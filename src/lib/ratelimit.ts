import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const publicRequestLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  analytics: true,
});
