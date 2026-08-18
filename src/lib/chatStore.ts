import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

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

export async function getChatState(complaintId: string): Promise<ChatState> {
  const messagesKey = `chat:messages:${complaintId}`;
  const modeKey = `chat:mode:${complaintId}`;
  const emergencyKey = `chat:emergency:${complaintId}`;

  const pipeline = redis.pipeline();
  pipeline.lrange(messagesKey, 0, -1);
  pipeline.get(modeKey);
  pipeline.get(emergencyKey);

  const [messages, mode, emergencyAlert] = await pipeline.exec();

  return {
    messages: (messages as ChatMessage[]) || [],
    mode: (mode as "bot" | "staff") || "bot",
    emergencyAlert: emergencyAlert === "true",
  };
}

export async function appendChatMessage(complaintId: string, message: ChatMessage): Promise<void> {
  const messagesKey = `chat:messages:${complaintId}`;
  
  const pipeline = redis.pipeline();
  pipeline.rpush(messagesKey, message);
  pipeline.expire(messagesKey, TTL);
  
  await pipeline.exec();
}

export async function setChatMode(complaintId: string, mode: "bot" | "staff"): Promise<void> {
  const modeKey = `chat:mode:${complaintId}`;
  
  const pipeline = redis.pipeline();
  pipeline.set(modeKey, mode);
  pipeline.expire(modeKey, TTL);
  
  await pipeline.exec();
}

export async function setEmergencyAlert(complaintId: string): Promise<void> {
  const emergencyKey = `chat:emergency:${complaintId}`;
  
  const pipeline = redis.pipeline();
  pipeline.set(emergencyKey, "true");
  pipeline.expire(emergencyKey, TTL);
  
  await pipeline.exec();
}

export async function getActiveChatComplaintIds(): Promise<string[]> {
  try {
    const keys = await redis.keys("chat:messages:*");
    return keys.map((key) => key.replace("chat:messages:", ""));
  } catch (error) {
    console.error("Failed to fetch active chat keys:", error);
    return [];
  }
}
