// Scout2Retire Success Metrics Framework
// Tracks code quality and error prevention effectiveness

class MetricsCollector {
  constructor() {
    this.metrics = {
      styleViolations: [],
      navigationErrors: [],
      darkModeIssues: [],
      layoutInconsistencies: [],
      buildFailures: [],
      commitStats: {
        total: 0,
        fixes: 0,
        features: 0,
        refactors: 0
      },
      sessionStart: new Date().toISOString()
    };
    
    this.targets = {
      styleViolationRate: 0,        // Target: 0 violations per session
      navigationCoverage: 100,      // Target: 100% pages with navigation
      darkModeCompliance: 100,      // Target: 100% components support dark mode
      fixCommitRatio: 5,           // Target: <5% commits are fixes
      meanTimeToDetect: 120        // Target: <2 minutes to detect issues
    };
  }

  // Track style violations
  trackStyleViolation(component, violation, suggestion) {
    const incident = {
      timestamp: new Date().toISOString(),
      component,
      violation,
      suggestion,
      detectionTime: this.calculateDetectionTime()
    };
    
    this.metrics.styleViolations.push(incident);
    this.persistMetrics();
  }

  // Track navigation errors
  trackNavigationError(page, error) {
    const incident = {
      timestamp: new Date().toISOString(),
      page,
      error,
      detectionTime: this.calculateDetectionTime()
    };
    
    this.metrics.navigationErrors.push(incident);
    this.persistMetrics();
  }

  // Track dark mode issues
  trackDarkModeIssue(component, issue) {
    const incident = {
      timestamp: new Date().toISOString(),
      component,
      issue,
      detectionTime: this.calculateDetectionTime()
    };
    
    this.metrics.darkModeIssues.push(incident);
    this.persistMetrics();
  }

  // Track layout inconsistencies
  trackLayoutInconsistency(page, expected, actual) {
    const incident = {
      timestamp: new Date().toISOString(),
      page,
      expected,
      actual,
      detectionTime: this.calculateDetectionTime()
    };
    
    this.metrics.layoutInconsistencies.push(incident);
    this.persistMetrics();
  }

  // Track commit patterns
  trackCommit(message) {
    this.metrics.commitStats.total++;
    
    if (message.toLowerCase().includes('fix')) {
      this.metrics.commitStats.fixes++;
    } else if (message.toLowerCase().includes('feat')) {
      this.metrics.commitStats.features++;
    } else if (message.toLowerCase().includes('refactor')) {
      this.metrics.commitStats.refactors++;
    }
    
    this.persistMetrics();
  }

  // Calculate detection time
  calculateDetectionTime() {
    const sessionStart = new Date(this.metrics.sessionStart);
    const now = new Date();
    const diffMinutes = Math.floor((now - sessionStart) / 1000 / 60);
    return diffMinutes;
  }

  // Calculate KPIs
  calculateKPIs() {
    const totalIssues = 
      this.metrics.styleViolations.length +
      this.metrics.navigationErrors.length +
      this.metrics.darkModeIssues.length +
      this.metrics.layoutInconsistencies.length;

    const fixCommitRatio = this.metrics.commitStats.total > 0
      ? (this.metrics.commitStats.fixes / this.metrics.commitStats.total) * 100
      : 0;

    const avgDetectionTime = totalIssues > 0
      ? [...this.metrics.styleViolations, 
         ...this.metrics.navigationErrors,
         ...this.metrics.darkModeIssues,
         ...this.metrics.layoutInconsistencies]
        .reduce((sum, issue) => sum + issue.detectionTime, 0) / totalIssues
      : 0;

    return {
      styleViolationRate: this.metrics.styleViolations.length,
      navigationErrorRate: this.metrics.navigationErrors.length,
      darkModeIssueRate: this.metrics.darkModeIssues.length,
      layoutInconsistencyRate: this.metrics.layoutInconsistencies.length,
      fixCommitRatio: fixCommitRatio.toFixed(1),
      meanTimeToDetect: avgDetectionTime.toFixed(1),
      totalIssues
    };
  }

  // Get performance against targets
  getPerformance() {
    const kpis = this.calculateKPIs();
    
    return {
      styleViolations: {
        value: kpis.styleViolationRate,
        target: this.targets.styleViolationRate,
        status: kpis.styleViolationRate <= this.targets.styleViolationRate ? 'good' : 'bad',
        trend: this.calculateTrend('styleViolations')
      },
      navigationCoverage: {
        value: this.calculateNavigationCoverage(),
        target: this.targets.navigationCoverage,
        status: this.calculateNavigationCoverage() >= this.targets.navigationCoverage ? 'good' : 'bad',
        trend: 'stable'
      },
      darkModeCompliance: {
        value: this.calculateDarkModeCompliance(),
        target: this.targets.darkModeCompliance,
        status: this.calculateDarkModeCompliance() >= this.targets.darkModeCompliance ? 'good' : 'bad',
        trend: 'stable'
      },
      fixCommitRatio: {
        value: parseFloat(kpis.fixCommitRatio),
        target: this.targets.fixCommitRatio,
        status: parseFloat(kpis.fixCommitRatio) <= this.targets.fixCommitRatio ? 'good' : 'bad',
        trend: this.calculateTrend('fixCommits')
      },
      meanTimeToDetect: {
        value: parseFloat(kpis.meanTimeToDetect),
        target: this.targets.meanTimeToDetect,
        status: parseFloat(kpis.meanTimeToDetect) <= this.targets.meanTimeToDetect ? 'good' : 'bad',
        trend: this.calculateTrend('detectionTime')
      }
    };
  }

  // Calculate navigation coverage (mock implementation)
  calculateNavigationCoverage() {
    // In a real implementation, this would check actual pages
    const pagesWithNav = 4; // Daily, Discover, Compare, Profile
    const totalPages = 4;
    return (pagesWithNav / totalPages) * 100;
  }

  // Calculate dark mode compliance (mock implementation)
  calculateDarkModeCompliance() {
    // In a real implementation, this would check actual components
    const darkModeIssues = this.metrics.darkModeIssues.length;
    // Unused: const totalComponents = 50; // Approximate number of components
    return Math.max(0, 100 - (darkModeIssues * 2));
  }

  // Calculate trend
  calculateTrend() {
    // In a real implementation, this would compare with historical data
    const trends = ['improving', 'stable', 'declining'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  // Generate report
  generateReport() {
    const kpis = this.calculateKPIs();
    const performance = this.getPerformance();
    
    return {
      summary: {
        totalIssues: kpis.totalIssues,
        sessionDuration: this.calculateDetectionTime(),
        timestamp: new Date().toISOString()
      },
      kpis,
      performance,
      recentIssues: this.getRecentIssues(),
      recommendations: this.getRecommendations(kpis)
    };
  }

  // Get recent issues
  getRecentIssues() {
    const allIssues = [
      ...this.metrics.styleViolations.map(v => ({ ...v, type: 'style' })),
      ...this.metrics.navigationErrors.map(e => ({ ...e, type: 'navigation' })),
      ...this.metrics.darkModeIssues.map(i => ({ ...i, type: 'darkMode' })),
      ...this.metrics.layoutInconsistencies.map(i => ({ ...i, type: 'layout' }))
    ];
    
    return allIssues
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }

  // Get recommendations based on metrics
  getRecommendations(kpis) {
    const recommendations = [];
    
    if (kpis.styleViolationRate > 0) {
      recommendations.push({
        priority: 'high',
        category: 'style',
        message: 'Review uiConfig.ts usage in recent components',
        action: 'Run npm run verify:styles to identify violations'
      });
    }
    
    if (kpis.fixCommitRatio > this.targets.fixCommitRatio) {
      recommendations.push({
        priority: 'medium',
        category: 'process',
        message: 'High fix commit ratio indicates quality issues',
        action: 'Implement more thorough testing before commits'
      });
    }
    
    if (kpis.meanTimeToDetect > this.targets.meanTimeToDetect) {
      recommendations.push({
        priority: 'medium',
        category: 'tooling',
        message: 'Issues taking too long to detect',
        action: 'Enable real-time error reporting in development'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'general',
        message: 'All metrics within targets!',
        action: 'Continue following current development practices'
      });
    }
    
    return recommendations;
  }

  // Persist metrics to localStorage
  persistMetrics() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          'scout2retire_metrics',
          JSON.stringify(this.metrics)
        );
      } catch (e) {
        console.error('Failed to persist metrics:', e);
      }
    }
  }

  // Load metrics from localStorage
  loadMetrics() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('scout2retire_metrics');
        if (stored) {
          this.metrics = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load metrics:', e);
      }
    }
  }

  // Reset metrics
  reset() {
    this.metrics = {
      styleViolations: [],
      navigationErrors: [],
      darkModeIssues: [],
      layoutInconsistencies: [],
      buildFailures: [],
      commitStats: {
        total: 0,
        fixes: 0,
        features: 0,
        refactors: 0
      },
      sessionStart: new Date().toISOString()
    };
    this.persistMetrics();
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

// Load existing metrics on initialization
metricsCollector.loadMetrics();

export default metricsCollector;