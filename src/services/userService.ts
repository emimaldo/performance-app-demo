import { User } from '../models/user.js';
import { getUserFromDB } from '../infrastructure/database.js';
import { cacheService } from '../infrastructure/cache.js';

export class UserService {
  private getCacheKey(userId: string): string {
    return `user:profile:${userId}`;
  }

  async getUserProfile(userId: string): Promise<User> {
    const cacheKey = this.getCacheKey(userId);
    
    const cached = await cacheService.get<User>(cacheKey);
    if (cached) {
      console.log(`Cache hit for user: ${userId}`);
      return cached;
    }
    
    console.log(`Cache miss for user: ${userId}, fetching from DB`);
    const user = await getUserFromDB(userId);
    await cacheService.set(cacheKey, user);
    
    return user;
  }

  async invalidateUser(userId: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId);
    await cacheService.del(cacheKey);
  }

  async getUserWithoutCache(userId: string): Promise<User> {
    return getUserFromDB(userId);
  }
}

export const userService = new UserService();
