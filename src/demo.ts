import { userService } from './services/userService.js';
import { tokenBucketLimiter } from './middleware/tokenBucket.js';
import { mockSlidingWindowLimiter } from './middleware/mockSlidingWindow.js';

async function measureTime<T>(operation: () => Promise<T>, label: string): Promise<T> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// Mock request/response objects for rate limiting demo
function createMockRequest(ip: string = '127.0.0.1') {
  return { ip, params: { id: 'user123' } } as any;
}

function createMockResponse() {
  let statusCode = 200;
  let jsonData: any = {};
  let headers: Record<string, string> = {};
  
  const mockRes = {
    status: (code: number) => { statusCode = code; return mockRes; },
    json: (data: any) => { jsonData = data; return mockRes; },
    set: (key: string, value: string) => { headers[key] = value; return mockRes; },
    getStatus: () => statusCode,
    getJson: () => jsonData,
    getHeaders: () => headers
  };
  
  return mockRes as any;
}

async function testRateLimiter(limiter: any, limiterName: string, requestCount: number = 5) {
  console.log(`\n--- Testing ${limiterName} ---`);
  
  for (let i = 0; i < requestCount; i++) {
    const req = createMockRequest();
    const res = createMockResponse();
    let nextCalled = false;
    
    const next = () => { nextCalled = true; };
    
    try {
      await limiter(req, res, next);
      
      if (nextCalled) {
        console.log(`Request ${i + 1}: ✅ ALLOWED`);
      } else {
        const status = res.getStatus();
        const data = res.getJson();
        console.log(`Request ${i + 1}: ❌ BLOCKED (${status}) - ${data.error}`);
      }
    } catch (error) {
      console.log(`Request ${i + 1}: ❌ ERROR - ${error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runPerformanceDemo() {
  console.log('🚀 Performance & Scalability Demo Starting...\n');

  // ============================================
  // PART 1: CACHING PERFORMANCE DEMO
  // ============================================
  console.log('📊 PART 1: CACHING PERFORMANCE');
  console.log('=====================================');

  const userId = 'user123';

  // First call - cache miss (should take ~105ms: 100ms DB + 5ms cache write)
  console.log('\n--- First call (cache miss) ---');
  await measureTime(
    () => userService.getUserProfile(userId),
    'getUserProfile (cache miss)'
  );

  console.log('\n--- Second call (cache hit) ---');
  // Second call - cache hit (should take ~5ms)
  await measureTime(
    () => userService.getUserProfile(userId),
    'getUserProfile (cache hit)'
  );

  console.log('\n--- Direct DB call (no cache) ---');
  // Direct DB call for comparison
  await measureTime(
    () => userService.getUserWithoutCache(userId),
    'getUserWithoutCache'
  );

  console.log('\n--- Multiple concurrent requests ---');
  // Test concurrent requests
  const promises = Array(5).fill(null).map((_, i) => 
    measureTime(
      () => userService.getUserProfile(`user${i}`),
      `Concurrent request ${i}`
    )
  );
  
  await Promise.all(promises);

  // ============================================
  // PART 2: RATE LIMITING DEMO
  // ============================================
  console.log('\n\n🚦 PART 2: RATE LIMITING');
  console.log('=====================================');

  // Test Token Bucket Rate Limiter
  await testRateLimiter(tokenBucketLimiter, 'Token Bucket (10 tokens, 1 token/sec)', 15);

  // Wait a bit to let tokens refill
  console.log('\n--- Waiting 3 seconds for token bucket to refill ---');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test a few more requests to show refilling
  await testRateLimiter(tokenBucketLimiter, 'Token Bucket (after refill)', 5);

  // Test Sliding Window Rate Limiter (mock version)
  console.log('\n--- Testing Mock Sliding Window Rate Limiter ---');
  await testRateLimiter(mockSlidingWindowLimiter, 'Sliding Window Mock (100 req/min)', 5);

  console.log('\n✅ Demo completed!');
  console.log('\n📈 Key Learnings:');
  console.log('  • Cache hits are ~20x faster than DB queries');
  console.log('  • Token bucket allows burst traffic but limits sustained rate');
  console.log('  • Sliding window provides smooth rate limiting over time');
  console.log('  • Different rate limiting strategies serve different use cases');
  console.log('  • Mock implementations help test concepts without external dependencies');
}

// Run the demo
runPerformanceDemo().catch(console.error);
