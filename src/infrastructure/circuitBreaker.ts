import CircuitBreaker from 'opossum';

/**
 * Circuit Breaker Implementation
 * 
 * The Circuit Breaker pattern prevents cascade failures by monitoring service calls
 * and automatically "opening" (blocking requests) when failure rate exceeds threshold.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Blocking all requests, returns cached failure response
 * - HALF_OPEN: Testing if service has recovered, allows limited requests
 * 
 * Benefits:
 * - Prevents resource exhaustion from calling failing services
 * - Provides fast failure instead of waiting for timeouts
 * - Allows automatic recovery when service becomes healthy
 * - Protects upstream services from overload
 */

// Simulated unstable service for demonstration
// In production, this would be your actual service call (API, database, etc.)
async function unstableService(): Promise<string> {
  // 50% chance of failure to simulate an unreliable service
  if (Math.random() < 0.5) throw new Error('Random failure');
  return 'Success';
}

// Circuit breaker configuration
export const circuitBreaker = new CircuitBreaker(unstableService, {
  timeout: 3000,                    // Request timeout in milliseconds
  errorThresholdPercentage: 50,     // Open circuit when 50% of requests fail
  resetTimeout: 10000               // Try to close circuit after 10 seconds
});

// Set up circuit breaker event listeners for monitoring
circuitBreaker.on('open', () => console.warn('🔴 Circuit breaker opened - blocking requests'));
circuitBreaker.on('halfOpen', () => console.info('🟡 Circuit breaker half-open - testing requests'));
circuitBreaker.on('close', () => console.info('🟢 Circuit breaker closed - normal operation'));