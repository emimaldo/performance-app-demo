import { circuitBreaker } from '../infrastructure/circuitBreaker.js';

export class FaultToleranceService {
  // Retry mechanism with exponential backoff
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Execute operation with circuit breaker
  async executeWithCircuitBreaker(): Promise<string> {
    try {
      return await circuitBreaker.fire();
    } catch (error) {
      throw new Error('Service unavailable due to circuit breaker');
    }
  }

  // Timeout wrapper
  async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }
}

export const faultToleranceService = new FaultToleranceService();
