import { Redis } from '@upstash/redis';

const hasRedisEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasRedisEnv
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export interface ChatMessage {
  id: string;
  sender: "student" | "staff" | "admin" | "bot" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  isEmergency?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  mode: "bot" | "staff";
  emergencyAlert?: boolean;
}

const TTL = 3600; // 1 hour

// Resilient in-memory store attached to globalThis to prevent chat failure if Redis is unavailable or misconfigured
interface InMemoryChatStorage {
  messages: Map<string, ChatMessage[]>;
  modes: Map<string, "bot" | "staff">;
  emergencies: Map<string, boolean>;
}

const inMemoryStore: InMemoryChatStorage =
  (globalThis as unknown as { __campuscare_chatStore?: InMemoryChatStorage }).__campuscare_chatStore || {
    messages: new Map(),
    modes: new Map(),
    emergencies: new Map(),
  };

(globalThis as unknown as { __campuscare_chatStore: InMemoryChatStorage }).__campuscare_chatStore = inMemoryStore;

export async function getChatState(complaintId: string): Promise<ChatState> {
  if (redis) {
    try {
      const messagesKey = `chat:messages:${complaintId}`;
      const modeKey = `chat:mode:${complaintId}`;
      const emergencyKey = `chat:emergency:${complaintId}`;

      const pipeline = redis.pipeline();
      pipeline.lrange(messagesKey, 0, -1);
      pipeline.get(modeKey);
      pipeline.get(emergencyKey);

      const [messages, mode, emergencyAlert] = await pipeline.exec();

      const parsedMessages = (messages as ChatMessage[]) || [];
      const parsedMode = (mode as "bot" | "staff") || "bot";
      const parsedAlert = emergencyAlert === "true";

      // Sync into memory cache
      if (parsedMessages.length > 0) {
        inMemoryStore.messages.set(complaintId, parsedMessages);
      }
      inMemoryStore.modes.set(complaintId, parsedMode);
      inMemoryStore.emergencies.set(complaintId, parsedAlert);

      return {
        messages: parsedMessages,
        mode: parsedMode,
        emergencyAlert: parsedAlert,
      };
    } catch (redisError) {
      console.warn("Upstash Redis getChatState fallback to in-memory:", (redisError as Error).message);
    }
  }

  // Graceful in-memory fallback
  return {
    messages: inMemoryStore.messages.get(complaintId) || [],
    mode: inMemoryStore.modes.get(complaintId) || "bot",
    emergencyAlert: inMemoryStore.emergencies.get(complaintId) || false,
  };
}

export async function appendChatMessage(complaintId: string, message: ChatMessage): Promise<void> {
  // Always record in in-memory store so chat and bot dispatch never break
  const existing = inMemoryStore.messages.get(complaintId) || [];
  existing.push(message);
  inMemoryStore.messages.set(complaintId, existing);

  if (redis) {
    try {
      const messagesKey = `chat:messages:${complaintId}`;
      const pipeline = redis.pipeline();
      pipeline.rpush(messagesKey, message);
      pipeline.expire(messagesKey, TTL);
      await pipeline.exec();
    } catch (redisError) {
      console.warn("Upstash Redis appendChatMessage fallback to in-memory:", (redisError as Error).message);
    }
  }
}

export async function setChatMode(complaintId: string, mode: "bot" | "staff"): Promise<void> {
  inMemoryStore.modes.set(complaintId, mode);

  if (redis) {
    try {
      const modeKey = `chat:mode:${complaintId}`;
      const pipeline = redis.pipeline();
      pipeline.set(modeKey, mode);
      pipeline.expire(modeKey, TTL);
      await pipeline.exec();
    } catch (redisError) {
      console.warn("Upstash Redis setChatMode fallback to in-memory:", (redisError as Error).message);
    }
  }
}

export async function setEmergencyAlert(complaintId: string): Promise<void> {
  inMemoryStore.emergencies.set(complaintId, true);

  if (redis) {
    try {
      const emergencyKey = `chat:emergency:${complaintId}`;
      const pipeline = redis.pipeline();
      pipeline.set(emergencyKey, "true");
      pipeline.expire(emergencyKey, TTL);
      await pipeline.exec();
    } catch (redisError) {
      console.warn("Upstash Redis setEmergencyAlert fallback to in-memory:", (redisError as Error).message);
    }
  }
}

export async function getActiveChatComplaintIds(): Promise<string[]> {
  if (redis) {
    try {
      const keys = await redis.keys("chat:messages:*");
      if (keys && keys.length > 0) {
        return keys.map((key) => key.replace("chat:messages:", ""));
      }
    } catch (error) {
      console.warn("Upstash Redis getActiveChatComplaintIds fallback to in-memory:", (error as Error).message);
    }
  }
  return Array.from(inMemoryStore.messages.keys());
}
