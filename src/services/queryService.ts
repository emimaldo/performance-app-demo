
import { User, Post } from '../models/user.js';
import { databaseService } from '../infrastructure/database.js';

/**
 * Query Service - Demonstrates N+1 Query Problem and Solutions
 * 
 * The N+1 query problem is one of the most common performance issues in applications.
 * It occurs when an application executes N+1 database queries instead of 1-2 optimized queries.
 * 
 * Example scenario:
 * 1. Query to get list of users (1 query)
 * 2. For each user, query to get their posts (N queries)
 * 
 * Result: 1 + N queries instead of 1-2 queries
 * 
 * This service demonstrates:
 * - How the N+1 problem manifests
 * - Performance impact comparison
 * - Optimized solutions using batching/JOINs
 */
export class QueryService {
  
  /**
   * Get users with their posts - demonstrates N+1 problem
   * This method shows the inefficient approach that causes performance issues
   * 
   * @param userIds Array of user IDs to fetch
   * @returns Users with their posts (inefficient method)
   */
  async getUsersWithPostsN1(userIds: string[]): Promise<Array<User & { posts: Post[] }>> {
    console.log(`\n❌ N+1 QUERY PROBLEM DEMONSTRATION`);
    console.log(`Getting ${userIds.length} users with their posts (inefficient way)`);
    
    const startTime = performance.now();
    const result = await databaseService.getUsersWithPostsN1(userIds);
    const endTime = performance.now();
    
    console.log(`Total queries executed: 1 + ${userIds.length} = ${1 + userIds.length} queries`);
    console.log(`Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Average time per user: ${((endTime - startTime) / userIds.length).toFixed(2)}ms`);
    
    return result;
  }
  
  /**
   * Get users with their posts - optimized version
   * This method shows the efficient approach that solves the N+1 problem
   * 
   * @param userIds Array of user IDs to fetch
   * @returns Users with their posts (optimized method)
   */
  async getUsersWithPostsOptimized(userIds: string[]): Promise<Array<User & { posts: Post[] }>> {
    console.log(`\n✅ OPTIMIZED QUERY SOLUTION`);
    console.log(`Getting ${userIds.length} users with their posts (efficient way)`);
    
    const startTime = performance.now();
    const result = await databaseService.getUsersWithPostsOptimized(userIds);
    const endTime = performance.now();
    
    console.log(`Total queries executed: 2 queries (regardless of user count)`);
    console.log(`Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Average time per user: ${((endTime - startTime) / userIds.length).toFixed(2)}ms`);
    
    return result;
  }
  
  /**
   * Compare N+1 vs Optimized performance
   * Runs both methods and shows the performance difference
   * 
   * @param userIds Array of user IDs to test with
   */
  async comparePerformance(userIds: string[]): Promise<void> {
    console.log(`\n🔬 PERFORMANCE COMPARISON`);
    console.log(`=========================================`);
    console.log(`Testing with ${userIds.length} users...`);
    
    // Test N+1 approach
    const n1StartTime = performance.now();
    const n1Results = await this.getUsersWithPostsN1(userIds);
    const n1EndTime = performance.now();
    const n1Duration = n1EndTime - n1StartTime;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test optimized approach
    const optimizedStartTime = performance.now();
    const optimizedResults = await this.getUsersWithPostsOptimized(userIds);
    const optimizedEndTime = performance.now();
    const optimizedDuration = optimizedEndTime - optimizedStartTime;
    
    // Calculate performance improvement
    const improvementFactor = n1Duration / optimizedDuration;
    const timeSaved = n1Duration - optimizedDuration;
    const percentageImprovement = ((timeSaved / n1Duration) * 100);
    
    console.log(`\n📊 PERFORMANCE RESULTS:`);
    console.log(`N+1 Approach:      ${n1Duration.toFixed(2)}ms (${1 + userIds.length} queries)`);
    console.log(`Optimized Approach: ${optimizedDuration.toFixed(2)}ms (2 queries)`);
    console.log(`Improvement:        ${improvementFactor.toFixed(1)}x faster`);
    console.log(`Time Saved:         ${timeSaved.toFixed(2)}ms (${percentageImprovement.toFixed(1)}% reduction)`);
    console.log(`Queries Reduced:    ${userIds.length - 1} fewer queries`);
    
    // Verify both methods return the same data
    const dataMatches = JSON.stringify(n1Results) === JSON.stringify(optimizedResults);
    console.log(`Data Consistency:   ${dataMatches ? '✅ Both methods return identical data' : '❌ Data mismatch detected'}`);
    
    // Show scaling impact
    if (userIds.length >= 3) {
      console.log(`\n💡 SCALING IMPACT:`);
      console.log(`With 10 users:      N+1 would make ~11 queries vs 2 optimized`);
      console.log(`With 100 users:     N+1 would make ~101 queries vs 2 optimized`);
      console.log(`With 1000 users:    N+1 would make ~1001 queries vs 2 optimized`);
    }
  }
  
  /**
   * Demonstrate different scenarios where N+1 problems occur
   */
  async demonstrateScenarios(): Promise<void> {
    console.log(`\n🎯 COMMON N+1 SCENARIOS`);
    console.log(`========================================`);
    
    // Scenario 1: Small dataset (might not seem problematic)
    console.log(`\n1. Small Dataset (3 users):`);
    await this.comparePerformance(['user123', 'user456', 'user789']);
    
    // Scenario 2: Medium dataset (performance impact becomes clear)
    console.log(`\n2. Medium Dataset (5 users):`);
    await this.comparePerformance(['user123', 'user456', 'user789', 'user101', 'user202']);
    
    console.log(`\n💡 KEY INSIGHTS:`);
    console.log(`• N+1 problems are often overlooked in small datasets`);
    console.log(`• Performance impact grows linearly with data size`);
    console.log(`• Database connection overhead amplifies the problem`);
    console.log(`• Production loads can make N+1 queries catastrophic`);
    console.log(`• Early optimization prevents major rewrites later`);
  }
  
  /**
   * Show detailed query execution logs
   * Helps understand what's happening at the database level
   */
  async showQueryExecution(userIds: string[]): Promise<void> {
    console.log(`\n🔍 DETAILED QUERY EXECUTION`);
    console.log(`==========================================`);
    
    console.log(`\n--- N+1 Query Execution ---`);
    await this.getUsersWithPostsN1(userIds.slice(0, 2)); // Show with just 2 users for clarity
    
    console.log(`\n--- Optimized Query Execution ---`);
    await this.getUsersWithPostsOptimized(userIds.slice(0, 2));
  }
}

export const queryService = new QueryService();
