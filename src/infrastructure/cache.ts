// Simulate Redis cache with in-memory storage for demo purposes
const cache = new Map<string, string>();

export class Cache {
  async get<T>(key: string): Promise<T | null> {
    // Simulate Redis latency (5ms - realistic for Redis on local network)
    // This allows us to demonstrate the performance difference between:
    // - Cache hit: ~5ms
    // - DB query: ~100ms (20x slower)
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // Simulate Redis write latency
    // In the real world, Redis has network latency even though it's very fast
    await new Promise(resolve => setTimeout(resolve, 5));
    
    cache.set(key, JSON.stringify(value));
    
    // Simulate TTL
    setTimeout(() => {
      cache.delete(key);
    }, ttlSeconds * 1000);
  }

  async del(key: string): Promise<void> {
    // Simulate Redis deletion latency
    await new Promise(resolve => setTimeout(resolve, 5));
    cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    // Simulate Redis existence check latency
    await new Promise(resolve => setTimeout(resolve, 5));
    return cache.has(key);
  }
}

export const cacheService = new Cache();
