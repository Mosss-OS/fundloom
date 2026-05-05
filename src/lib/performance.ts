export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Retry on network errors or 5xx server errors
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') return true;
    if (error?.response?.status >= 500 && error?.response?.status < 600) return true;
    return false;
  },
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (finalConfig.shouldRetry && !finalConfig.shouldRetry(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt === finalConfig.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelayMs * Math.pow(finalConfig.backoffFactor, attempt),
        finalConfig.maxDelayMs
      );

      // Add some jitter (±20%)
      const jitter = delay * 0.2;
      const actualDelay = delay + (Math.random() * jitter * 2 - jitter);

      await sleep(actualDelay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry decorator for functions
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: Partial<RetryConfig> = {},
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), config);
  }) as T;
}

/**
 * Batch requests to avoid rate limiting and improve performance
 */
export class RequestBatcher<T, R> {
  private batch: Array<{
    input: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchFn: (inputs: T[]) => Promise<R[]>,
    private maxBatchSize: number = 50,
    private maxWaitMs: number = 50,
  ) {}

  async add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ input, resolve, reject });

      if (this.batch.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const currentBatch = this.batch.splice(0, this.maxBatchSize);
    if (currentBatch.length === 0) return;

    try {
      const results = await this.batchFn(currentBatch.map(item => item.input));
      
      // Assume results are in the same order as inputs
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => item.reject(error));
    }
  }
}

/**
 * Deduplicate identical in-flight requests
 */
const pendingRequests = new Map<string, Promise<any>>();

export function deduplicate<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Optimistic update helper
 */
export function optimisticUpdate<T>(
  currentData: T,
  updateFn: (data: T) => T,
  onError?: (error: any, previousData: T) => void,
): { data: T; rollback: () => T } {
  const previousData = JSON.parse(JSON.stringify(currentData)); // Deep clone
  const updatedData = updateFn(currentData);
  
  return {
    data: updatedData,
    rollback: () => {
      if (onError) {
        onError(new Error("Rollback"), previousData);
      }
      return previousData as T;
    },
  };
}
