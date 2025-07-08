import express, { Request, Response } from 'express';
import { userService } from './services/userService.js';
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Performance demo API available at:`);
  console.log(`   GET /api/user/:id (with token bucket rate limiting)`);
  console.log(`   GET /api/user/:id/no-cache (with sliding window rate limiting)`);
  console.log(`   DELETE /api/user/:id/cache (invalidate cache)`);
  console.log(`   GET /health (health check)`);
});
