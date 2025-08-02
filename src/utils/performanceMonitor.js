// Performance monitoring for Scout2Retire
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      matchingTime: [],
      dbQueries: [],
      apiCalls: [],
      pageLoads: []
    };
    this.slowQueryThreshold = 1000; // 1 second
  }

  // Track matching algorithm performance
  async trackMatching(fn, preferences) {
    const start = performance.now();
    const result = await fn(preferences);
    const duration = performance.now() - start;
    
    this.metrics.matchingTime.push({
      duration,
      timestamp: new Date(),
      townCount: result.matches?.length || 0,
      preferences: this.sanitizePreferences(preferences)
    });

    if (duration > this.slowQueryThreshold) {
      console.warn(`⚠️ Slow matching: ${duration.toFixed(2)}ms`, {
        townCount: result.matches?.length,
        preferences
      });
    }

    // Keep only last 100 metrics
    if (this.metrics.matchingTime.length > 100) {
      this.metrics.matchingTime.shift();
    }

    return result;
  }

  // Track database query performance
  async trackQuery(queryName, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.metrics.dbQueries.push({
      name: queryName,
      duration,
      timestamp: new Date()
    });

    if (duration > this.slowQueryThreshold) {
      console.warn(`⚠️ Slow query "${queryName}": ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  // Get performance report
  getReport() {
    const report = {
      matching: {
        count: this.metrics.matchingTime.length,
        avgTime: this.getAverage(this.metrics.matchingTime.map(m => m.duration)),
        p95Time: this.getPercentile(this.metrics.matchingTime.map(m => m.duration), 95),
        slowQueries: this.metrics.matchingTime.filter(m => m.duration > this.slowQueryThreshold).length
      },
      database: {
        count: this.metrics.dbQueries.length,
        avgTime: this.getAverage(this.metrics.dbQueries.map(q => q.duration)),
        slowQueries: this.metrics.dbQueries.filter(q => q.duration > this.slowQueryThreshold),
        byQuery: this.groupByQuery()
      },
      recommendations: this.getRecommendations()
    };

    return report;
  }

  // Group queries by name for analysis
  groupByQuery() {
    const groups = {};
    this.metrics.dbQueries.forEach(query => {
      if (!groups[query.name]) {
        groups[query.name] = {
          count: 0,
          totalTime: 0,
          avgTime: 0
        };
      }
      groups[query.name].count++;
      groups[query.name].totalTime += query.duration;
    });

    Object.keys(groups).forEach(name => {
      groups[name].avgTime = groups[name].totalTime / groups[name].count;
    });

    return groups;
  }

  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    const avgMatchingTime = this.getAverage(this.metrics.matchingTime.map(m => m.duration));

    if (avgMatchingTime > 500) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Matching algorithm is slow. Consider implementing caching or pre-filtering.'
      });
    }

    const slowQueries = this.metrics.dbQueries.filter(q => q.duration > this.slowQueryThreshold);
    if (slowQueries.length > 5) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: `${slowQueries.length} slow database queries detected. Check indexes and query optimization.`
      });
    }

    return recommendations;
  }

  // Utility functions
  getAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  getPercentile(numbers, percentile) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  sanitizePreferences(prefs) {
    // Remove sensitive data from preferences before logging
    const safe = { ...prefs };
    delete safe.userId;
    delete safe.email;
    return safe;
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      timestamp: new Date(),
      metrics: this.getReport(),
      raw: {
        matchingTime: this.metrics.matchingTime.slice(-10), // Last 10
        dbQueries: this.metrics.dbQueries.slice(-20) // Last 20
      }
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return performanceMonitor;
}

// Middleware for automatic tracking
export function withPerformanceTracking(fn, metricName) {
  return async (...args) => {
    return performanceMonitor.trackQuery(metricName, () => fn(...args));
  };
}