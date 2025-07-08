import { User } from '../models/user.js';

export async function getUserFromDB(userId: string): Promise<User> {
  // Simulate DB latency
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    id: userId,
    name: `User_${userId}`,
    timestamp: Date.now(),
  };
}
