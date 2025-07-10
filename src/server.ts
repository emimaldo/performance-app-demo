import express, { Request, Response } from 'express';
import { userService } from './services/userService.js';
import { queryService } from './services/queryService.js';
import { tokenBucketLimiter } from './middleware/tokenBucket.js';
import { slidingWindowLimiter } from './middleware/slidingWindow.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes with different rate limiting strategies
app.get('/api/user/:id', tokenBucketLimiter, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserProfile(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/:id/no-cache', slidingWindowLimiter, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserWithoutCache(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/user/:id/cache', async (req: Request, res: Response) => {
  try {
    await userService.invalidateUser(req.params.id);
    res.json({ message: 'Cache invalidated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// N+1 Query Problem Demonstration Endpoints
app.get('/api/users-with-posts/n1', async (req: Request, res: Response) => {
  try {
    const userIds = (req.query.userIds as string)?.split(',') || ['user123', 'user456', 'user789'];
    console.log('\n🔗 API Request: N+1 Query Demonstration');
    const result = await queryService.getUsersWithPostsN1(userIds);
    res.json({
      method: 'N+1 queries (inefficient)',
      userCount: userIds.length,
      queryCount: 1 + userIds.length,
      users: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});

app.get('/api/users-with-posts/optimized', async (req: Request, res: Response) => {
  try {
    const userIds = (req.query.userIds as string)?.split(',') || ['user123', 'user456', 'user789'];
    console.log('\n✅ API Request: Optimized Query Demonstration');
    const result = await queryService.getUsersWithPostsOptimized(userIds);
    res.json({
      method: 'Optimized queries (efficient)',
      userCount: userIds.length,
      queryCount: 2,
      users: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});

app.get('/api/query-comparison', async (req: Request, res: Response) => {
  try {
    const userIds = (req.query.userIds as string)?.split(',') || ['user123', 'user456', 'user789'];
    console.log('\n🔬 API Request: Performance Comparison');
    
    // Measure N+1 approach
    const n1Start = performance.now();
    const n1Result = await queryService.getUsersWithPostsN1(userIds);
    const n1End = performance.now();
    const n1Duration = n1End - n1Start;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Measure optimized approach
    const optimizedStart = performance.now();
    const optimizedResult = await queryService.getUsersWithPostsOptimized(userIds);
    const optimizedEnd = performance.now();
    const optimizedDuration = optimizedEnd - optimizedStart;
    
    // Calculate improvement
    const improvementFactor = n1Duration / optimizedDuration;
    const timeSaved = n1Duration - optimizedDuration;
    const percentageImprovement = (timeSaved / n1Duration) * 100;
    
    res.json({
      comparison: {
        n1Approach: {
          duration: `${n1Duration.toFixed(2)}ms`,
          queries: 1 + userIds.length,
          method: 'N+1 queries'
        },
        optimizedApproach: {
          duration: `${optimizedDuration.toFixed(2)}ms`,
          queries: 2,
          method: 'Batched queries'
        },
        improvement: {
          factor: `${improvementFactor.toFixed(1)}x faster`,
          timeSaved: `${timeSaved.toFixed(2)}ms`,
          percentage: `${percentageImprovement.toFixed(1)}% reduction`,
          queriesReduced: userIds.length - 1
        }
      },
      userCount: userIds.length,
      dataConsistency: JSON.stringify(n1Result) === JSON.stringify(optimizedResult)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Performance demo API available at:`);
  console.log(`   GET /api/user/:id (with token bucket rate limiting)`);
  console.log(`   GET /api/user/:id/no-cache (with sliding window rate limiting)`);
  console.log(`   DELETE /api/user/:id/cache (invalidate cache)`);
  console.log(`   GET /health (health check)`);
  console.log(`🔗 N+1 Query Problem demos:`);
  console.log(`   GET /api/users-with-posts/n1?userIds=user123,user456 (demonstrates N+1 problem)`);
  console.log(`   GET /api/users-with-posts/optimized?userIds=user123,user456 (optimized solution)`);
  console.log(`   GET /api/query-comparison?userIds=user123,user456,user789 (performance comparison)`);
});
