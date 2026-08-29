import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function isConfigured(val?: string): boolean {
  if (!val || val.trim() === "") return false;
  if (val.includes("placeholder")) return false;
  return true;
}

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!isConfigured(url) || !isConfigured(token)) {
    return null;
  }

  try {
    return new Redis({ url: url!, token: token! });
  } catch (err) {
    console.warn("[RateLimit] Failed to initialize Redis client:", err);
    return null;
  }
}

const redis = createRedis();

function createLimiter(prefix: string, requests: number, window: string) {
  if (!redis) {
    return {
      async limit(_identifier: string) {
        return { success: true, limit: requests, remaining: requests, reset: 0 };
      },
    };
  }

  const ratelimit = new Ratelimit({
    redis,
    prefix: `ifp:${prefix}`,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"s" | "m" | "h" | "d"}`),
    analytics: true,
  });

  return {
    async limit(identifier: string) {
      try {
        return await ratelimit.limit(identifier);
      } catch (err) {
        console.warn(`[RateLimit] Error checking limit for ${prefix}:`, err);
        return { success: true, limit: requests, remaining: requests, reset: 0 };
      }
    },
  };
}

/** 5 login attempts per 15 minutes per IP */
export const loginLimiter = createLimiter("login", 5, "15 m");

/** 3 signup attempts per 15 minutes per IP */
export const signupLimiter = createLimiter("signup", 3, "15 m");

/** 5 OTP/MFA attempts per 15 minutes per IP */
export const otpLimiter = createLimiter("otp", 5, "15 m");

/** 3 password reset requests per hour per IP */
export const passwordResetLimiter = createLimiter("pw-reset", 3, "1 h");

/** 60 general API requests per minute per user */
export const apiLimiter = createLimiter("api", 60, "1 m");
