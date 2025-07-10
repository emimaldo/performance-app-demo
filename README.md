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

### N+1 Query Problem
- **Problem**: 1 query for main data + N queries for related data
- **Impact**: Linear performance degradation with data size
- **Solution**: Batched queries, JOINs, or DataLoader patterns
- **Demo**: Side-by-side comparison of inefficient vs optimized approaches

## Project Structure

```
src/
├── models/
│   └── user.ts              # Data types and interfaces (User, Post)
├── infrastructure/
│   ├── cache.ts             # Cache service (simulated Redis)
│   ├── circuitBreaker.ts    # Circuit breaker implementation
│   ├── loadBalancer.ts      # Load balancer with health monitoring
│   ├── mockCache.ts         # Alternative mock cache implementation
│   └── database.ts          # Database operations with N+1 demos
├── services/
│   ├── userService.ts       # Business logic combining cache + database
│   ├── queryService.ts      # N+1 query problem demonstrations
│   └── faultTolerance.ts    # Fault tolerance patterns
├── middleware/
│   ├── tokenBucket.ts       # Token bucket rate limiter
│   ├── slidingWindow.ts     # Redis-based sliding window rate limiter
│   └── mockSlidingWindow.ts # In-memory sliding window rate limiter
├── config/
│   └── rateLimitConfig.ts   # Rate limiting configuration
├── demo.ts                  # Comprehensive performance demo
├── server.ts               # Express server with rate limiting and N+1 demos
└── balancedServer.ts       # Load-balanced server with fault tolerance
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

The demo will show performance comparisons and fault tolerance behavior:

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

### N+1 Query Problem Demonstration
```
🔗 PART 3: N+1 QUERY PROBLEM
=====================================

❌ N+1 QUERY PROBLEM DEMONSTRATION
Getting 3 users with their posts (inefficient way)
🔍 DB Query: Getting 3 users
🔍 DB Query: Getting posts for user user123
🔍 DB Query: Getting posts for user user456
🔍 DB Query: Getting posts for user user789
Total queries executed: 1 + 3 = 4 queries
Total time: 312.45ms

✅ OPTIMIZED QUERY SOLUTION
Getting 3 users with their posts (efficient way)
🔍 DB Query: Getting 3 users
🔍 DB Query: Getting posts for 3 users (optimized)
Total queries executed: 2 queries (regardless of user count)
Total time: 145.23ms

📊 PERFORMANCE RESULTS:
N+1 Approach:      312.45ms (4 queries)
Optimized Approach: 145.23ms (2 queries)
Improvement:        2.2x faster
Time Saved:         167.22ms (53.5% reduction)
```

### Load Balanced Server Response
```json
{
  "message": "Performance & Scalability Demo - Load Balanced Instance",
  "instance": 12345,
  "timestamp": "2025-07-09T...",
  "concepts": {
    "caching": "Redis-like cache simulation with TTL support",
    "rateLimiting": "Token bucket and sliding window algorithms",
    "loadBalancing": "Round-robin distribution with health monitoring",
    "faultTolerance": "Circuit breaker, retry mechanisms, and timeout protection"
  },
  "endpoints": {
    "/health": "Health check for load balancer monitoring",
    "/unstable": "Circuit breaker demonstration (50% failure rate)",
    "/retry-demo": "Retry mechanism with exponential backoff",
    "/timeout-demo": "Timeout protection (2-second limit)"
  },
  "performance": {
    "cacheHit": "~5ms response time",
    "cacheMiss": "~105ms response time (DB + cache write)",
    "directDB": "~100ms response time"
  }
}
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

### Load Balancer Settings
- **Algorithm**: Round-robin distribution
- **Health checks**: Every 30 seconds via `/health` endpoint
- **Failover**: Automatic removal after 3 consecutive failures
- **Recovery**: 30-second timeout before retry

### Fault Tolerance Settings
- **Circuit Breaker**: 50% error threshold, 10-second reset timeout
- **Retry Logic**: Maximum 3 attempts with exponential backoff
- **Timeout Protection**: 2-second timeout for demo endpoints
- **Health Monitoring**: Continuous service availability checks

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

### N+1 Query Problem Endpoints

- `GET /api/users-with-posts/n1?userIds=user123,user456` - Demonstrates N+1 problem (inefficient)
- `GET /api/users-with-posts/optimized?userIds=user123,user456` - Shows optimized solution (efficient)
- `GET /api/query-comparison?userIds=user123,user456,user789` - Side-by-side performance comparison

## Load-Balanced Server

The balanced server demonstrates fault tolerance patterns:

```bash
# Start the balanced server
npm run balanced-server
```

### Fault Tolerance Endpoints

- `GET /` - Main route with performance concepts overview and instance identification
- `GET /health` - Health check for load balancer
- `GET /unstable` - Circuit breaker demonstration (50% failure rate)
- `GET /retry-demo` - Retry mechanism with exponential backoff
- `GET /timeout-demo` - Timeout handling (2-second limit)

### Testing All Components

```bash
# Test basic server with rate limiting
curl http://localhost:3000/api/user/123
curl http://localhost:3000/health

# Test load-balanced server with fault tolerance
curl http://localhost:3000/
curl http://localhost:3000/unstable
curl http://localhost:3000/retry-demo
curl http://localhost:3000/timeout-demo

# Test with Docker load balancer (Nginx on port 8080)
curl http://localhost:8080/
curl http://localhost:8080/health
curl http://localhost:8080/unstable

# Test rate limiting (repeat quickly to trigger limits)
for i in {1..15}; do curl http://localhost:3000/api/user/123; done

# Monitor different instances handling requests (Docker)
watch -n 1 'curl -s http://localhost:8080/ | jq .instance'

# Test circuit breaker behavior
for i in {1..10}; do curl http://localhost:3000/unstable; done

# Test N+1 query problem demonstrations
curl "http://localhost:3000/api/users-with-posts/n1?userIds=user123,user456"
curl "http://localhost:3000/api/users-with-posts/optimized?userIds=user123,user456"
curl "http://localhost:3000/api/query-comparison?userIds=user123,user456,user789"
```

## Docker Deployment

Deploy with load balancing using Docker Compose:

```bash
# Start all services (3 app instances + Nginx + Redis)
docker-compose up --build

# Scale specific services
docker-compose up --scale app1=2 --scale app2=2

# View logs from specific service
docker-compose logs -f nginx
docker-compose logs -f app1

# Access through load balancer
curl http://localhost:8080/
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
- What the N+1 query problem is and why it's problematic
- How query optimization can dramatically improve application performance
- The importance of efficient database access patterns for scalability
- When to use batching, JOINs, and DataLoader patterns

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
