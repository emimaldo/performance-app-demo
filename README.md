# Performance App Demo

A comprehensive demonstration application showcasing performance optimization and scalability concepts using caching strategies and rate limiting algorithms.

## Overview

This demo illustrates key performance and scalability concepts:

### Caching Performance
- Database queries (~100ms latency)
- Cache hits (~5ms latency) 
- Cache misses (DB + cache write time)

### Rate Limiting Strategies
- **Token Bucket**: Allows burst traffic but limits sustained rate
- **Sliding Window**: Provides smooth rate limiting over time windows
- **Fixed Window**: Simple time-window based limiting

## Project Structure

```
src/
├── models/
│   └── user.ts              # Data types and interfaces
├── infrastructure/
│   ├── cache.ts             # Cache service (simulated Redis)
│   ├── mockCache.ts         # Alternative mock cache implementation
│   └── database.ts          # Database operations (simulated)
├── services/
│   └── userService.ts       # Business logic combining cache + database
├── middleware/
│   ├── tokenBucket.ts       # Token bucket rate limiter
│   ├── slidingWindow.ts     # Redis-based sliding window rate limiter
│   └── mockSlidingWindow.ts # In-memory sliding window rate limiter
├── config/
│   └── rateLimitConfig.ts   # Rate limiting configuration
├── demo.ts                  # Performance and rate limiting demo
└── server.ts               # Express server with different rate limiting strategies
```

## Features

- **Simulated Redis Cache**: In-memory cache with realistic latency simulation
- **Database Simulation**: Mock database with configurable latency
- **Performance Measurement**: Built-in timing utilities to demonstrate performance gains
- **TTL Support**: Time-to-live functionality for cache entries
- **Generic Cache Interface**: Flexible caching for any data type
- **Rate Limiting Algorithms**:
  - Token Bucket: Burst-friendly with sustained rate control
  - Sliding Window: Smooth rate limiting over time windows
- **Express API Server**: RESTful endpoints with different rate limiting strategies
- **Comprehensive Demo**: Interactive demonstration of all concepts

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

# Run the Express server
npm run server

# Development mode with file watching
npm run dev

# Development server with file watching
npm run dev:server

# Build the project
npm run build

# Run built version
npm start

# Run built server
npm start:server
```

## Demo Output

The demo will show performance comparisons and rate limiting behavior:

### Caching Performance
```
🚀 Performance & Scalability Demo Starting...

📊 PART 1: CACHING PERFORMANCE
=====================================

--- First call (cache miss) ---
Cache miss for user: user123, fetching from DB
getUserProfile (cache miss): 105.23ms

--- Second call (cache hit) ---
Cache hit for user: user123
getUserProfile (cache hit): 5.12ms

--- Direct DB call (no cache) ---
getUserWithoutCache: 100.45ms
```

### Rate Limiting Behavior
```
🚦 PART 2: RATE LIMITING
=====================================

--- Testing Token Bucket (10 tokens, 1 token/sec) ---
Request 1: ✅ ALLOWED
Request 2: ✅ ALLOWED
...
Request 11: ❌ BLOCKED (429) - Rate limit exceeded

--- Testing Sliding Window Mock (100 req/min) ---
Request 1: ✅ ALLOWED
Request 2: ✅ ALLOWED
...
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

### 4. Rate Limiting Algorithms

#### Token Bucket
- **How it works**: Tokens are added to a bucket at a fixed rate
- **Benefits**: Allows burst traffic up to bucket capacity
- **Use case**: APIs that need to handle occasional spikes
- **Configuration**: 10 tokens capacity, 1 token/second refill rate

#### Sliding Window
- **How it works**: Tracks requests within a rolling time window
- **Benefits**: Smooth, consistent rate limiting
- **Use case**: Preventing sustained abuse
- **Configuration**: 100 requests per 60-second window

## Architecture Decisions

### Separation of Concerns
- **Models**: Data structures and interfaces
- **Infrastructure**: External dependencies (cache, database)
- **Services**: Business logic combining infrastructure components
- **Middleware**: Request processing logic (rate limiting)
- **Config**: Application configuration settings

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

### Rate Limiting Settings
- **Token Bucket**: 10 tokens capacity, 1 token/second refill
- **Sliding Window**: 100 requests per 60-second window
- **Request cost**: 1 token per request

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

## Express API Server

The server provides RESTful endpoints demonstrating different rate limiting strategies:

```bash
# Start the server
npm run server
```

### Available Endpoints

- `GET /api/user/:id` - Get user with caching (Token Bucket rate limiting)
- `GET /api/user/:id/no-cache` - Get user without cache (Sliding Window rate limiting)
- `DELETE /api/user/:id/cache` - Invalidate user cache (No rate limiting)
- `GET /health` - Health check endpoint

### Testing the API

```bash
# Test with caching and token bucket rate limiting
curl http://localhost:3000/api/user/123

# Test without cache and sliding window rate limiting
curl http://localhost:3000/api/user/123/no-cache

# Invalidate cache
curl -X DELETE http://localhost:3000/api/user/123/cache

# Health check
curl http://localhost:3000/health
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

### Rate Limiting Middleware

```typescript
// Token bucket middleware
app.get('/api/endpoint', tokenBucketLimiter, handler);

// Sliding window middleware (requires Redis)
app.get('/api/endpoint', slidingWindowLimiter, handler);

// Mock sliding window (no Redis required)
app.get('/api/endpoint', mockSlidingWindowLimiter, handler);
```

## Learning Objectives

After running this demo, you'll understand:
- How caching dramatically improves response times
- The trade-offs between memory usage and performance
- Cache invalidation strategies
- When to use caching vs direct database access
- Performance measurement techniques
- Different rate limiting algorithms and their use cases
- How to implement rate limiting in Express.js applications
- The importance of burst handling vs sustained rate control

## Next Steps

Consider exploring:
- Database connection pooling
- Cache warming strategies
- Distributed caching
- Cache eviction policies
- Advanced rate limiting algorithms (Fixed window, Sliding window log)
- Load testing with tools like Artillery or k6
- Circuit breaker patterns
- API gateway rate limiting
