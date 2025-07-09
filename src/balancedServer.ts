import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { faultToleranceService } from './services/faultTolerance.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const instanceId = process.pid;

app.use(express.json());

// Health check endpoint (essential for load balancer)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy', 
    instance: instanceId,
    timestamp: new Date().toISOString()
  });
});

// Main route with instance identification
// Shows performance concepts overview and which server instance handled the request
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Performance & Scalability Demo - Load Balanced Instance',
    instance: instanceId,
    timestamp: new Date().toISOString(),
    concepts: {
      caching: 'Redis-like cache simulation with TTL support',
      rateLimiting: 'Token bucket and sliding window algorithms',
      loadBalancing: 'Round-robin distribution with health monitoring',
      faultTolerance: 'Circuit breaker, retry mechanisms, and timeout protection'
    },
    endpoints: {
      '/health': 'Health check for load balancer monitoring',
      '/unstable': 'Circuit breaker demonstration (50% failure rate)',
      '/retry-demo': 'Retry mechanism with exponential backoff',
      '/timeout-demo': 'Timeout protection (2-second limit)'
    },
    performance: {
      cacheHit: '~5ms response time',
      cacheMiss: '~105ms response time (DB + cache write)',
      directDB: '~100ms response time'
    }
  });
});

// Unstable endpoint demonstrating circuit breaker
app.get('/unstable', async (req: Request, res: Response) => {
  try {
    const result = await faultToleranceService.executeWithCircuitBreaker();
    res.json({ 
      result, 
      instance: instanceId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      error: 'Service unavailable', 
      instance: instanceId,
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint with retry mechanism
app.get('/retry-demo', async (req: Request, res: Response) => {
  try {
    const result = await faultToleranceService.retryWithBackoff(
      async () => {
        if (Math.random() < 0.7) throw new Error('Random failure');
        return 'Success after retries';
      },
      3,
      500
    );
    
    res.json({ 
      result, 
      instance: instanceId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed after retries', 
      instance: instanceId,
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint with timeout demonstration
app.get('/timeout-demo', async (req: Request, res: Response) => {
  try {
    const result = await faultToleranceService.withTimeout(
      async () => {
        // Simulate a slow operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));
        return 'Operation completed';
      },
      2000 // 2 second timeout
    );
    
    res.json({ 
      result, 
      instance: instanceId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(408).json({ 
      error: 'Request timeout', 
      instance: instanceId,
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Load-balanced server instance ${instanceId} listening on port ${port}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET / (main route with instance info)`);
  console.log(`   GET /health (health check for load balancer)`);
  console.log(`   GET /unstable (circuit breaker demo)`);
  console.log(`   GET /retry-demo (retry mechanism demo)`);
  console.log(`   GET /timeout-demo (timeout handling demo)`);
});
