import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

export interface CacheConfig {
  ttlSeconds?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix for cache keys
}

const defaultConfig: CacheConfig = {
  ttlSeconds: 300, // 5 minutes default
  keyPrefix: "cache:",
};

/**
 * Generate cache key from request
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    
    // Redis might return string or object
    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
    return parsed as T;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cache data
 */
export async function setCache(
  key: string,
  data: any,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

/**
 * Delete multiple cache keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache delete pattern error:", error);
  }
}

/**
 * Cache middleware for API requests
 */
export function withCache<T>(
  fn: () => Promise<T>,
  key: string,
  config: CacheConfig = defaultConfig
): Promise<T> {
  const fullKey = `${config.keyPrefix || "cache:"}${key}`;

  return new Promise(async (resolve, reject) => {
    // Try cache first
    const cached = await getCached<T>(fullKey);
    if (cached !== null) {
      return resolve(cached);
    }

    // Execute function
    try {
      const result = await fn();
      
      // Cache the result
      await setCache(fullKey, result, config.ttlSeconds || 300);
      
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Invalidate cache by prefix
 */
export async function invalidateCache(prefix: string): Promise<void> {
  await deleteCachePattern(`${prefix}:*`);
}

/**
 * Cache configurations for different data types
 */
export const cacheConfigs = {
  campaigns: {
    ttlSeconds: 60, // 1 minute (frequently changing)
    keyPrefix: "cache:campaigns",
  },
  campaign: {
    ttlSeconds: 300, // 5 minutes
    keyPrefix: "cache:campaign",
  },
  donations: {
    ttlSeconds: 60, // 1 minute
    keyPrefix: "cache:donations",
  },
  user: {
    ttlSeconds: 600, // 10 minutes
    keyPrefix: "cache:user",
  },
  stats: {
    ttlSeconds: 1800, // 30 minutes (rarely changing)
    keyPrefix: "cache:stats",
  },
};

/**
 * Clear all cache (use with caution)
 */
export async function clearAllCache(): Promise<void> {
  await deleteCachePattern("cache:*");
}
