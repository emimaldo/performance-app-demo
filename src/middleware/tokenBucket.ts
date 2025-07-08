import { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const REFILL_RATE = 1;        // tokens per second
const BUCKET_CAPACITY = 10;   // max tokens
const REQUEST_COST = 1;

export function tokenBucketLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now() / 1000;
  const key = req.ip || 'unknown';
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: BUCKET_CAPACITY, lastRefill: now };
    buckets.set(key, bucket);
  }

  const delta = now - bucket.lastRefill;
  bucket.tokens = Math.min(
    BUCKET_CAPACITY,
    bucket.tokens + delta * REFILL_RATE
  );
  bucket.lastRefill = now;

  if (bucket.tokens < REQUEST_COST) {
    res.set('Retry-After', '1');
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      algorithm: 'token-bucket'
    });
  }

  bucket.tokens -= REQUEST_COST;
  next();
}
