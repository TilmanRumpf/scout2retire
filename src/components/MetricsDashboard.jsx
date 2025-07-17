// Scout2Retire Metrics Dashboard
// Displays code quality and error prevention metrics

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import metricsCollector from '../utils/metrics';
import { uiConfig } from '../styles/uiConfig';

export default function MetricsDashboard() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate initial report
    const generateReport = () => {
      const newReport = metricsCollector.generateReport();
      setReport(newReport);
      setIsLoading(false);
    };

    generateReport();

    // Update report every 30 seconds
    const interval = setInterval(generateReport, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'declining':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'good' 
      ? <CheckCircle size={20} className="text-green-500" />
      : <XCircle size={20} className="text-red-500" />;
  };

  const getStatusColor = (status) => {
    return status === 'good' 
      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
  };

  if (isLoading) {
    return (
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.spacing.card} ${uiConfig.layout.radius.lg}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.spacing.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
          Error Prevention Metrics
        </h2>
        <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
          Session: {report.summary.sessionDuration} minutes
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Style Violations */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.performance.styleViolations.status)}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Style Violations
            </h3>
            {getStatusIcon(report.performance.styleViolations.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.performance.styleViolations.value}
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              / {report.performance.styleViolations.target}
            </span>
            {getTrendIcon(report.performance.styleViolations.trend)}
          </div>
        </div>

        {/* Navigation Coverage */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.performance.navigationCoverage.status)}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Navigation Coverage
            </h3>
            {getStatusIcon(report.performance.navigationCoverage.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.performance.navigationCoverage.value}%
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              target: {report.performance.navigationCoverage.target}%
            </span>
          </div>
        </div>

        {/* Fix Commit Ratio */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.performance.fixCommitRatio.status)}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Fix Commit Ratio
            </h3>
            {getStatusIcon(report.performance.fixCommitRatio.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.performance.fixCommitRatio.value}%
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              target: &lt;{report.performance.fixCommitRatio.target}%
            </span>
            {getTrendIcon(report.performance.fixCommitRatio.trend)}
          </div>
        </div>

        {/* Dark Mode Compliance */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.performance.darkModeCompliance.status)}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Dark Mode Compliance
            </h3>
            {getStatusIcon(report.performance.darkModeCompliance.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.performance.darkModeCompliance.value}%
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              target: {report.performance.darkModeCompliance.target}%
            </span>
          </div>
        </div>

        {/* Mean Time to Detect */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.performance.meanTimeToDetect.status)}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Mean Time to Detect
            </h3>
            {getStatusIcon(report.performance.meanTimeToDetect.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.performance.meanTimeToDetect.value}
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              min (target: &lt;{report.performance.meanTimeToDetect.target})
            </span>
            {getTrendIcon(report.performance.meanTimeToDetect.trend)}
          </div>
        </div>

        {/* Total Issues */}
        <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
              Total Issues
            </h3>
            <AlertCircle size={20} className="text-yellow-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold}`}>
              {report.summary.totalIssues}
            </span>
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.muted}`}>
              this session
            </span>
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      {report.recentIssues.length > 0 && (
        <div className="mb-6">
          <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
            Recent Issues
          </h3>
          <div className="space-y-2">
            {report.recentIssues.map((issue, index) => (
              <div 
                key={index}
                className={`p-3 ${uiConfig.colors.input} ${uiConfig.layout.radius.md} ${uiConfig.font.size.sm}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`${uiConfig.font.weight.medium} capitalize`}>
                      {issue.type}:
                    </span>{' '}
                    {issue.component || issue.page || 'Unknown location'}
                    {issue.violation && (
                      <div className={`${uiConfig.colors.muted} ${uiConfig.font.size.xs} mt-1`}>
                        {issue.violation}
                      </div>
                    )}
                  </div>
                  <span className={`${uiConfig.colors.muted} ${uiConfig.font.size.xs}`}>
                    {issue.detectionTime}m ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
          Recommendations
        </h3>
        <div className="space-y-2">
          {report.recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`p-3 ${uiConfig.layout.radius.md} border ${
                rec.priority === 'high' 
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  : rec.priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              }`}
            >
              <div className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} mb-1`}>
                {rec.message}
              </div>
              <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.muted}`}>
                Action: {rec.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <button
          onClick={() => {
            const newReport = metricsCollector.generateReport();
            setReport(newReport);
          }}
          className={uiConfig.components.buttonPrimary}
        >
          Refresh Metrics
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all metrics?')) {
              metricsCollector.reset();
              const newReport = metricsCollector.generateReport();
              setReport(newReport);
            }
          }}
          className={uiConfig.components.buttonSecondary}
        >
          Reset Metrics
        </button>
      </div>
    </div>
  );
}