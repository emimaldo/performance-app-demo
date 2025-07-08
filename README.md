# Performance App Demo

A demonstration application showcasing performance optimization and scalability concepts using caching strategies.

## Overview

This demo illustrates the performance differences between:
- Database queries (~100ms latency)
- Cache hits (~5ms latency) 
- Cache misses (DB + cache write time)

## Project Structure

```
src/
├── models/
│   └── user.ts              # Data types and interfaces
├── infrastructure/
│   ├── cache.ts             # Cache service (simulated Redis)
│   ├── mockCache.ts         # Alternative mock cache implementation
│   └── database.ts          # Database operations (simulated)
└── services/
    └── userService.ts       # Business logic combining cache + database
```

## Features

- **Simulated Redis Cache**: In-memory cache with realistic latency simulation
- **Database Simulation**: Mock database with configurable latency
- **Performance Measurement**: Built-in timing utilities to demonstrate performance gains
- **TTL Support**: Time-to-live functionality for cache entries
- **Generic Cache Interface**: Flexible caching for any data type

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5+

### Installation

```bash
npm install
```

### Running the Demo

```bash
# Run the performance demo
npm run demo

# Development mode with file watching
npm run dev

# Build the project
npm run build

# Run built version
npm start
```

## Demo Output

The demo will show performance comparisons:

```
🚀 Performance Demo Starting...

--- First call (cache miss) ---
Cache miss for user: user123, fetching from DB
getUserProfile (cache miss): 105.23ms

--- Second call (cache hit) ---
Cache hit for user: user123
getUserProfile (cache hit): 5.12ms

--- Direct DB call (no cache) ---
getUserWithoutCache: 100.45ms
```

## Performance Concepts Demonstrated

### 1. Cache Miss vs Cache Hit
- **Cache Miss**: ~105ms (100ms DB + 5ms cache write)
- **Cache Hit**: ~5ms (20x faster)

### 2. Concurrent Requests
- Multiple simultaneous requests to demonstrate caching benefits
- Shows how cache reduces database load

### 3. TTL (Time To Live)
- Automatic cache expiration after configured time
- Simulates real-world cache invalidation

## Architecture Decisions

### Separation of Concerns
- **Models**: Data structures and interfaces
- **Infrastructure**: External dependencies (cache, database)
- **Services**: Business logic combining infrastructure components

### Why Simulate Latency?
1. **Realism**: Real Redis has network latency (1-10ms typically)
2. **Demonstration**: Measurable performance differences
3. **Testing**: Behavior under different latency conditions
4. **Education**: Shows real impact of caching strategies

## Configuration

### Cache Settings
- Default TTL: 300 seconds (5 minutes)
- Cache latency: 5ms (realistic for local Redis)
- Database latency: 100ms (typical for complex queries)

### Switching to Real Redis
To use actual Redis instead of simulation:

1. Set `REDIS_URL` environment variable
2. Replace cache import in `userService.ts`:
```typescript
// Change from:
import { cacheService } from '../infrastructure/cache.js';
// To:
import { cacheService } from '../infrastructure/redisCache.js';
```

## API Reference

### UserService

```typescript
// Get user with caching
const user = await userService.getUserProfile(userId);

// Get user without cache
const user = await userService.getUserWithoutCache(userId);

// Invalidate user cache
await userService.invalidateUser(userId);
```

### Cache Service

```typescript
// Generic cache operations
await cacheService.set<User>('key', userData, 300);
const user = await cacheService.get<User>('key');
await cacheService.del('key');
const exists = await cacheService.exists('key');
```

## Learning Objectives

After running this demo, you'll understand:
- How caching dramatically improves response times
- The trade-offs between memory usage and performance
- Cache invalidation strategies
- When to use caching vs direct database access
- Performance measurement techniques

## Next Steps

Consider exploring:
- Database connection pooling
- Cache warming strategies
- Distributed caching
- Cache eviction policies
- Load testing with tools like Artillery or k6
