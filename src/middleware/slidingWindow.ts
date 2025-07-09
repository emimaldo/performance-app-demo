import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

let redis: Redis | null = null;
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS = 100;

// Initialize Redis only when explicitly called
function initializeRedis() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  }
  return redis;
}

export async function slidingWindowLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    const redisClient = initializeRedis();
    const key = `rl:${req.ip || 'unknown'}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);
    }

    if (current > MAX_REQUESTS) {
      res.set('Retry-After', String(WINDOW_SIZE_IN_SECONDS));
      return res.status(429).json({ 
        error: 'Too many requests',
        algorithm: 'sliding-window'
      });
    }

    res.set('X-RateLimit-Limit', String(MAX_REQUESTS));
    res.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - current)));
    
    next();
  } catch (error) {
    // If Redis is not available, allow the request but log the error
    console.error('Redis connection failed in sliding window limiter:', error);
    next();
  }
}
