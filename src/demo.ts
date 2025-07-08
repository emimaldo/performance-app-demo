import { userService } from './services/userService.js';

async function measureTime<T>(operation: () => Promise<T>, label: string): Promise<T> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

async function runPerformanceDemo() {
  console.log('🚀 Performance Demo Starting...\n');

  const userId = 'user123';

  // First call - cache miss (should take ~105ms: 100ms DB + 5ms cache write)
  console.log('--- First call (cache miss) ---');
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

  console.log('\n✅ Demo completed!');
}

// Run the demo
runPerformanceDemo().catch(console.error);
