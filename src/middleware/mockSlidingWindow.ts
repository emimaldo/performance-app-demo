import { Request, Response, NextFunction } from 'express';

// Mock sliding window rate limiter that simulates Redis behavior without Redis
const windowRequests = new Map<string, number[]>();
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS = 100;

export async function mockSlidingWindowLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now() / 1000; // Convert to seconds
  
  // Get or create request timestamps for this IP
  let requests = windowRequests.get(key) || [];
  
  // Remove requests older than the window
  requests = requests.filter(timestamp => (now - timestamp) < WINDOW_SIZE_IN_SECONDS);
  
  // Check if we're within the limit
  if (requests.length >= MAX_REQUESTS) {
    res.set('Retry-After', String(WINDOW_SIZE_IN_SECONDS));
    return res.status(429).json({ 
      error: 'Too many requests',
      algorithm: 'sliding-window-mock'
    });
  }
  
  // Add current request timestamp
  requests.push(now);
  windowRequests.set(key, requests);
  
  // Set rate limit headers
  res.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - requests.length)));
  
  next();
}
