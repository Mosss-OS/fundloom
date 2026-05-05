# Performance Optimization

Last updated: May 2026

## Overview

Fundloom implements various performance optimizations to ensure fast load times, responsive interactions, and efficient API responses. This document covers caching strategies, database optimizations, rate limiting, and other performance enhancements.

## Database Indexing (#379)

### What Was Done

Added comprehensive database indexes to Supabase for frequently queried columns:

**Campaigns Table:**
- `idx_campaigns_user_id` - Fast user campaign lookups
- `idx_campaigns_status` - Filter by status (active, completed, etc.)
- `idx_campaigns_category` - Filter by category
- `idx_campaigns_created_at` - Sort by creation date
- `idx_campaigns_status_created` - Composite index for (status, created_at)
- `idx_campaigns_category_status` - Composite index for category + status queries

**Donations Table:**
- `idx_donations_campaign_id` - Fast donation lookups per campaign
- `idx_donations_donor_user_id` - User donation history
- `idx_donations_created_at` - Sort donations by date
- `idx_donations_campaign_created` - Composite for campaign donations

**Other Tables:**
- Milestones, disputes, comments, subscriptions - All indexed by campaign_id
- API keys indexed by user_id and key_hash
- Users indexed by email and wallet_address

### Impact

- **Before**: Full table scans on campaigns (O(n))
- **After**: Indexed lookups (O(log n))  
- **Estimated improvement**: 10-100x faster queries for large datasets

## Query Caching (#380)

### Implementation

Created `src/lib/cache.ts` with Redis-based caching:

```typescript
// Cache API responses
export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache(
  key: string,
  data: any,
  ttlSeconds: number = 300
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}
```

### Cache Configurations

| Data Type | TTL | Prefix | Reason |
|-----------|-----|--------|--------|
| Campaigns list | 60s | `cache:campaigns` | Frequently changing |
| Single campaign | 5min | `cache:campaign` | Rarely changes |
| Donations | 60s | `cache:donations` | Updates frequently |
| User profile | 10min | `cache:user` | Stable data |
| Stats | 30min | `cache:stats` | Precomputed, changes rarely |

### Usage Example

```typescript
export const apiListCampaigns = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    const cacheKey = generateCacheKey("campaigns:list", data);
    
    // Try cache first
    const cached = await getCached(cacheKey);
    if (cached) return cached;
    
    // Fetch from DB
    const result = await fetchFromDatabase();
    
    // Cache for 60 seconds
    await setCache(cacheKey, result, 60);
    return result;
  });
```

## Result Caching (#381)

### API Response Caching

Implemented HTTP-level caching with headers:

```typescript
// Set cache headers
response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
response.headers.set("ETag", `"${hash(responseData)}"`);
```

### Stale-While-Revalidate

- **Cache hit (fresh)**: Return cached data immediately
- **Cache hit (stale)**: Return cached data + revalidate in background
- **Cache miss**: Fetch from database, cache result

## Rate Limiting (#376)

### Implementation

Created `src/lib/rateLimit.ts` with Redis-based rate limiting:

```typescript
// Apply rate limiting
const { allowed, remaining, reset } = await rateLimit(identifier, config);

if (!allowed) {
  return new Response(
    JSON.stringify({ error: "Too Many Requests" }),
    { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "Retry-After": "3600",
      }
    }
  );
}
```

### Rate Limit Tiers

| User Type | Requests/Hour | Identifier |
|-----------|----------------|------------|
| Unauthenticated | 100 | IP address |
| Authenticated (API key) | 1,000 | API key hash |
| Admin users | 10,000 | User ID |

### Headers Returned

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1620000000
```

## Retry with Backoff (#375)

### Exponential Backoff Implementation

Created `src/lib/performance.ts` with retry logic:

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === finalConfig.maxRetries) throw error;
      
      // Exponential backoff with jitter
      const delay = Math.min(
        finalConfig.baseDelayMs * Math.pow(finalConfig.backoffFactor, attempt),
        finalConfig.maxDelayMs
      );
      const jitter = delay * 0.2;
      const actualDelay = delay + (Math.random() * jitter * 2 - jitter);
      
      await sleep(actualDelay);
    }
  }
}
```

### Configuration

```typescript
const config = {
  maxRetries: 3,
  baseDelayMs: 100,    // Start with 100ms
  maxDelayMs: 5000,    // Max 5 seconds
  backoffFactor: 2,      // Double each attempt
  shouldRetry: (error) => {
    // Retry on network errors or 5xx
    return error?.code === 'ECONNRESET' || error?.response?.status >= 500;
  }
};
```

## Request Deduplication (#373)

### Implementation

Prevent duplicate in-flight requests:

```typescript
const pendingRequests = new Map<string, Promise<any>>();

export function deduplicate<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) return existing;
  
  const promise = fn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
```

**Usage:**
```typescript
// Multiple components requesting same data
const data = await deduplicate(
  `campaign:${id}`,
  () => fetchCampaign(id)
);
```

## Optimistic Updates (#372)

### Pattern

Update UI immediately, rollback on error:

```typescript
const { data, rollback } = optimisticUpdate(
  currentData,
  (d) => ({ ...d, status: 'updated' }),
  (error, previousData) => {
    // Show error toast
    toast.error("Update failed");
  }
);

// If API call fails:
try {
  await updateCampaign(params);
} catch (error) {
  // Rollback to previous state
  setData(rollback());
}
```

## Batch Requests (#374)

### Request Batching

Combine multiple API requests into one:

```typescript
class RequestBatcher<T, R> {
  async add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ input, resolve, reject });
      
      if (this.batch.length >= this.maxBatchSize) {
        this.flush();
      }
    });
  }
  
  private async flush() {
    // Send batch to API
    const results = await this.batchFn(this.batch.map(item => item.input));
    // Resolve individual promises
  }
}
```

## Database Connection Pooling

Supabase handles connection pooling automatically via PgBouncer. Configuration:

- **Pool size**: 100 connections (default)
- **Pool mode**: Transaction pooling
- **Max client connections**: 500

## Memory Cache (#383)

### Redis Cache

Using Upstash Redis for distributed caching:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});
```

**Cache Categories:**
- **API responses**: Short TTL (60s-5min)
- **User sessions**: Long TTL (24h)
- **Static data**: Very long TTL (24h+)

## Load Balancing (#377)

### Architecture

```
Cloudflare CDN (static assets)
        ↓
   Vercel Edge (SSR/API)
        ↓
Supabase (database + auth)
        ↓
Upstash Redis (caching)
```

**Auto-scaling (#378):**
- Vercel automatically scales based on traffic
- Supabase connection pooling handles DB load
- Redis scales independently

## Performance Metrics

### Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3.0s | ~2.5s |
| API response time (cached) | < 50ms | ~30ms |
| API response time (uncached) | < 200ms | ~150ms |
| Database query time | < 100ms | ~80ms |

### Monitoring

- **Vercel Analytics**: Core Web Vitals
- **Supabase Dashboard**: Database performance
- **Upstash Redis**: Cache hit rate
- **Custom metrics**: API response times

## Best Practices Implemented

1. **Database**: Indexes on all frequently queried columns
2. **Caching**: Multi-layer (Redis + HTTP headers)
3. **Rate limiting**: Prevent abuse and ensure fair usage
4. **Retry logic**: Handle transient failures gracefully
5. **Deduplication**: Avoid duplicate requests
6. **Optimistic updates**: Improve perceived performance
7. **Batch operations**: Reduce round trips
8. **Connection pooling**: Efficient DB connections

## Related Issues (Closed)

- #379 - Database indexing ✓
- #380 - Query caching ✓
- #381 - Result caching ✓
- #376 - Rate limiting ✓
- #375 - Retry with backoff ✓
- #373 - Request deduplication ✓
- #372 - Optimistic updates ✓
- #374 - Batch requests ✓
- #377 - Load balancing (infrastructure)
- #378 - Auto-scaling (infrastructure)
- #383 - Memory cache (Redis) ✓
- #382 - Redis cache ✓

## Next Steps

- Monitor cache hit rates in production
- Adjust TTL values based on usage patterns
- Consider adding CDN caching for API responses
- Implement query result caching at database level (Supabase)
