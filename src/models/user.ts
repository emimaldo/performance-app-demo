export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Post model for demonstrating N+1 query problems
 * Represents a blog post or article written by a user
 */
export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  views: number;
}
