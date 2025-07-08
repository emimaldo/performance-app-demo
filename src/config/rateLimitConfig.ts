export const RATE_LIMIT_CONFIG = {
  tokenBucket: {
    refillRate: 1,        // tokens per second
    bucketCapacity: 10,   // max tokens
    requestCost: 1,       // tokens per request
  },
  slidingWindow: {
    windowSizeSeconds: 60,
    maxRequests: 100,
  },
  fixedWindow: {
    windowSizeSeconds: 60,
    maxRequests: 100,
  }
} as const;

export type RateLimitAlgorithm = keyof typeof RATE_LIMIT_CONFIG;
