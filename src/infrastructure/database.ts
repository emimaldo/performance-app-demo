import type { User } from '../models/user.js';
import type { Post } from '../models/user.js';

/**
 * Database Service - Simulates database operations with realistic latency
 * 
 * In a real application, this would connect to PostgreSQL, MySQL, MongoDB, etc.
 * We simulate network latency and query execution time to demonstrate
 * the performance impact of caching strategies.
 */
class DatabaseService {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private postsByUser: Map<string, string[]> = new Map();

  constructor() {
    this.seedData();
  }

  /**
   * Seed initial data for testing
   * Creates users and their related posts
   */
  private seedData() {
    // Create sample users
    const sampleUsers: User[] = [
      { id: 'user123', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
      { id: 'user456', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() },
      { id: 'user789', name: 'Bob Johnson', email: 'bob@example.com', createdAt: new Date() },
      { id: 'user101', name: 'Alice Brown', email: 'alice@example.com', createdAt: new Date() },
      { id: 'user202', name: 'Charlie Davis', email: 'charlie@example.com', createdAt: new Date() },
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Create sample posts for each user
    const samplePosts: Post[] = [
      // User 123 posts
      { id: 'post1', userId: 'user123', title: 'Getting Started with Node.js', content: 'Node.js is a powerful runtime...', createdAt: new Date(), views: 150 },
      { id: 'post2', userId: 'user123', title: 'Understanding Async/Await', content: 'Async/await makes promises easier...', createdAt: new Date(), views: 200 },
      { id: 'post3', userId: 'user123', title: 'TypeScript Best Practices', content: 'TypeScript adds type safety...', createdAt: new Date(), views: 180 },
      
      // User 456 posts
      { id: 'post4', userId: 'user456', title: 'React Performance Tips', content: 'Optimizing React apps is crucial...', createdAt: new Date(), views: 300 },
      { id: 'post5', userId: 'user456', title: 'State Management with Redux', content: 'Redux helps manage complex state...', createdAt: new Date(), views: 250 },
      
      // User 789 posts
      { id: 'post6', userId: 'user789', title: 'Database Optimization', content: 'Database performance is key...', createdAt: new Date(), views: 400 },
      { id: 'post7', userId: 'user789', title: 'Caching Strategies', content: 'Effective caching improves performance...', createdAt: new Date(), views: 350 },
      { id: 'post8', userId: 'user789', title: 'Load Balancing Techniques', content: 'Load balancing distributes traffic...', createdAt: new Date(), views: 280 },
      
      // User 101 posts
      { id: 'post9', userId: 'user101', title: 'Microservices Architecture', content: 'Microservices offer scalability...', createdAt: new Date(), views: 220 },
      
      // User 202 posts
      { id: 'post10', userId: 'user202', title: 'Docker Best Practices', content: 'Containerization with Docker...', createdAt: new Date(), views: 190 },
      { id: 'post11', userId: 'user202', title: 'Kubernetes Fundamentals', content: 'Orchestrating containers with K8s...', createdAt: new Date(), views: 240 },
    ];

    // Store posts and create user-post relationships
    samplePosts.forEach(post => {
      this.posts.set(post.id, post);
      
      if (!this.postsByUser.has(post.userId)) {
        this.postsByUser.set(post.userId, []);
      }
      this.postsByUser.get(post.userId)!.push(post.id);
    });
  }

  /**
   * Simulate network latency for database operations
   * In a real application, this would be the time taken by the DB to execute a query
   * and return results over the network.
   */
  private async simulateLatency() {
    // Random delay between 50ms and 150ms
    const delay = Math.floor(Math.random() * 100) + 50;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async getUser(id: string): Promise<User | null> {
    console.log(`🔍 DB Query: Getting user ${id}`);
    await this.simulateLatency();
    return this.users.get(id) || null;
  }

  /**
   * Get a single post by ID
   * @param id Post ID
   * @returns Post or null if not found
   */
  async getPost(id: string): Promise<Post | null> {
    console.log(`🔍 DB Query: Getting post ${id}`);
    await this.simulateLatency();
    return this.posts.get(id) || null;
  }

  /**
   * Get posts by user ID - simulates individual queries (N+1 problem)
   * @param userId User ID
   * @returns Array of posts for the user
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    console.log(`🔍 DB Query: Getting posts for user ${userId}`);
    await this.simulateLatency();
    
    const postIds = this.postsByUser.get(userId) || [];
    return postIds.map(id => this.posts.get(id)!);
  }

  /**
   * Get multiple users at once
   * @param userIds Array of user IDs
   * @returns Array of users
   */
  async getUsers(userIds: string[]): Promise<User[]> {
    console.log(`🔍 DB Query: Getting ${userIds.length} users`);
    await this.simulateLatency();
    
    return userIds
      .map(id => this.users.get(id))
      .filter((user): user is User => user !== undefined);
  }

  /**
   * Get all users (for demonstration)
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    console.log('🔍 DB Query: Getting all users');
    await this.simulateLatency();
    return Array.from(this.users.values());
  }

  /**
   * Optimized method: Get posts for multiple users in a single query
   * This simulates a JOIN or batched query that solves the N+1 problem
   * @param userIds Array of user IDs
   * @returns Map of userId to their posts
   */
  async getPostsByUserIds(userIds: string[]): Promise<Map<string, Post[]>> {
    console.log(`🔍 DB Query: Getting posts for ${userIds.length} users (optimized)`);
    await this.simulateLatency();
    
    const result = new Map<string, Post[]>();
    
    userIds.forEach(userId => {
      const postIds = this.postsByUser.get(userId) || [];
      const posts = postIds.map(id => this.posts.get(id)!);
      result.set(userId, posts);
    });
    
    return result;
  }

  /**
   * Get users with their posts - demonstrates N+1 problem
   * Makes 1 query for users + N queries for each user's posts
   * @param userIds Array of user IDs
   * @returns Users with their posts
   */
  async getUsersWithPostsN1(userIds: string[]): Promise<Array<User & { posts: Post[] }>> {
    console.log('❌ N+1 Query Problem: Getting users with posts (inefficient)');
    
    // 1 query to get users
    const users = await this.getUsers(userIds);
    
    // N additional queries - one for each user
    const usersWithPosts = [];
    for (const user of users) {
      const posts = await this.getPostsByUserId(user.id);
      usersWithPosts.push({ ...user, posts });
    }
    
    return usersWithPosts;
  }

  /**
   * Get users with their posts - optimized version
   * Makes only 2 queries total regardless of number of users
   * @param userIds Array of user IDs
   * @returns Users with their posts
   */
  async getUsersWithPostsOptimized(userIds: string[]): Promise<Array<User & { posts: Post[] }>> {
    console.log('✅ Optimized Query: Getting users with posts (efficient)');
    
    // 1 query to get users
    const users = await this.getUsers(userIds);
    
    // 1 additional query to get all posts for all users
    const postsMap = await this.getPostsByUserIds(userIds);
    
    // Combine the data
    return users.map(user => ({
      ...user,
      posts: postsMap.get(user.id) || []
    }));
  }
}

export const databaseService = new DatabaseService();

/**
 * Backward compatibility function for existing userService
 */
export async function getUserFromDB(userId: string): Promise<User> {
  const user = await databaseService.getUser(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  return user;
}
