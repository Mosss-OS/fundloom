import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 requests per hour
};

const authenticatedConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000, // 1000 requests per hour for authenticated users
};

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `rate_limit:${identifier}`;
  const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
  const reset = windowStart + config.windowMs;

  try {
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expireat(key, reset / 1000);
    }

    const allowed = requests <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - requests);

    return { allowed, remaining, reset };
  } catch (error) {
    // If Redis fails, allow the request (fail open)
    console.error("Rate limiting error:", error);
    return { allowed: true, remaining: config.maxRequests, reset };
  }
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Use IP address as fallback
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to API requests
 */
export async function applyRateLimit(
  request: Request,
  userId?: string
): Promise<Response | null> {
  const identifier = getRateLimitIdentifier(request, userId);
  const config = userId ? authenticatedConfig : defaultConfig;
  
  const { allowed, remaining, reset } = await rateLimit(identifier, config);

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Rate limit headers for successful requests
 */
export function rateLimitHeaders(
  remaining: number,
  reset: number,
  userId?: string
): Record<string, string> {
  const config = userId ? authenticatedConfig : defaultConfig;
  return {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };
}
