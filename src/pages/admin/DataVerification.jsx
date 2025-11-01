/**
 * DATA VERIFICATION DASHBOARD
 *
 * Comprehensive dashboard for detecting and fixing data quality issues:
 * - Statistical outliers
 * - Convention violations
 * - Impossible values
 * - Relational inconsistencies
 *
 * Created: 2025-10-28
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';
import { uiConfig } from '../../styles/uiConfig';
import {
  analyzeDataQuality,
  getWorstTowns,
  getCriticalIssues,
  getIssuesByField,
  SEVERITY,
  ISSUE_TYPE
} from '../../utils/dataVerification';
import { formatTownDisplay } from '../../utils/townDisplayUtils';
import toast from 'react-hot-toast';

export default function DataVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [towns, setTowns] = useState([]);
  const [report, setReport] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'by-town', 'by-field'
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load towns and analyze
  useEffect(() => {
    loadAndAnalyze();
  }, []);

  const loadAndAnalyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .order('town_name');

      if (error) throw error;

      setTowns(data);
      const analysisReport = analyzeDataQuality(data);
      setReport(analysisReport);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load town data');
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on current filters
  const getFilteredIssues = () => {
    if (!report) return [];

    let filtered = [...report.townIssues];

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.map(town => ({
        ...town,
        issues: town.issues.filter(i => i.severity === selectedSeverity)
      })).filter(town => town.issues.length > 0);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.map(town => ({
        ...town,
        issues: town.issues.filter(i => i.type === selectedType)
      })).filter(town => town.issues.length > 0);
    }

    // Filter by field
    if (selectedField !== 'all') {
      filtered = filtered.map(town => ({
        ...town,
        issues: town.issues.filter(i => i.field === selectedField)
      })).filter(town => town.issues.length > 0);
    }

    // Search by town name
    if (searchTerm) {
      filtered = filtered.filter(town =>
        town.townName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Navigate to town in TownsManager with optional field for auto-tab-selection
  const navigateToTown = (townId, fieldName = null) => {
    const params = new URLSearchParams({ town: townId });
    if (fieldName) {
      params.append('field', fieldName);
    }
    navigate(`/admin/towns-manager?${params.toString()}`);
  };

  // Severity badge component
  const SeverityBadge = ({ severity }) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };

    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[severity]}`}>
        <span>{icons[severity]}</span>
        <span className="capitalize">{severity}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page}`}>
        <UnifiedHeader title="Data Verification" subtitle="Loading..." showFilters={false} />
        <HeaderSpacer hasFilters={false} />
        <div className="flex items-center justify-center h-64">
          <div className={`${uiConfig.colors.body} text-lg`}>Analyzing {towns.length} towns...</div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page}`}>
        <UnifiedHeader title="Data Verification" subtitle="Error" showFilters={false} />
        <HeaderSpacer hasFilters={false} />
        <div className="flex items-center justify-center h-64">
          <div className={`${uiConfig.colors.body}`}>Failed to generate report</div>
        </div>
      </div>
    );
  }

  const filteredIssues = getFilteredIssues();
  const criticalIssues = getCriticalIssues(report);
  const worstTowns = getWorstTowns(report, 10);

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      <UnifiedHeader
        title="Data Verification Dashboard"
        subtitle={`Analyzed ${report.summary.totalTowns} towns • Found ${report.summary.totalIssues} issues in ${report.summary.townsWithIssues} towns`}
        showFilters={false}
      />
      <HeaderSpacer hasFilters={false} />

      <div className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page}`}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${uiConfig.colors.card} p-4 rounded-lg ${uiConfig.layout.shadow.md}`}>
            <div className={`text-sm ${uiConfig.colors.subtitle} mb-1`}>Critical Issues</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{report.summary.bySeverity.critical}</div>
            <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>Impossible values, breaks conventions</div>
          </div>

          <div className={`${uiConfig.colors.card} p-4 rounded-lg ${uiConfig.layout.shadow.md}`}>
            <div className={`text-sm ${uiConfig.colors.subtitle} mb-1`}>High Priority</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{report.summary.bySeverity.high}</div>
            <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>Severe outliers, major issues</div>
          </div>

          <div className={`${uiConfig.colors.card} p-4 rounded-lg ${uiConfig.layout.shadow.md}`}>
            <div className={`text-sm ${uiConfig.colors.subtitle} mb-1`}>Medium Priority</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{report.summary.bySeverity.medium}</div>
            <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>Moderate outliers, suspicious</div>
          </div>

          <div className={`${uiConfig.colors.card} p-4 rounded-lg ${uiConfig.layout.shadow.md}`}>
            <div className={`text-sm ${uiConfig.colors.subtitle} mb-1`}>Low Priority</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{report.summary.bySeverity.low}</div>
            <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>Minor inconsistencies</div>
          </div>
        </div>

        {/* View Tabs */}
        <div className={`${uiConfig.colors.card} rounded-lg ${uiConfig.layout.shadow.md} mb-6`}>
          <div className="border-b flex overflow-x-auto">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeView === 'overview'
                  ? `border-b-2 ${uiConfig.colors.accentBorder} ${uiConfig.colors.accent}`
                  : `${uiConfig.colors.body} hover:${uiConfig.colors.heading}`
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('by-town')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeView === 'by-town'
                  ? `border-b-2 ${uiConfig.colors.accentBorder} ${uiConfig.colors.accent}`
                  : `${uiConfig.colors.body} hover:${uiConfig.colors.heading}`
              }`}
            >
              By Town ({report.summary.townsWithIssues})
            </button>
            <button
              onClick={() => setActiveView('by-field')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeView === 'by-field'
                  ? `border-b-2 ${uiConfig.colors.accentBorder} ${uiConfig.colors.accent}`
                  : `${uiConfig.colors.body} hover:${uiConfig.colors.heading}`
              }`}
            >
              By Field
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* Critical Issues */}
                {criticalIssues.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3`}>
                      🔴 Critical Issues ({criticalIssues.length})
                    </h3>
                    <div className="space-y-2">
                      {criticalIssues.slice(0, 10).map((issue, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-l-4 border-red-500 ${uiConfig.colors.secondary} cursor-pointer hover:${uiConfig.colors.primary}`}
                          onClick={() => navigateToTown(issue.townId, issue.field)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-medium ${uiConfig.colors.heading}`}>
                                {formatTownDisplay({ town_name: issue.townName, region: issue.region, country: issue.country })}
                              </div>
                              <div className={`text-sm ${uiConfig.colors.body} mt-1`}>
                                <span className="font-medium">{issue.field}:</span> {issue.message}
                              </div>
                            </div>
                            <SeverityBadge severity={issue.severity} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worst Towns */}
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3`}>
                    🏚️ Top 10 Towns with Most Issues
                  </h3>
                  <div className="space-y-2">
                    {worstTowns.map((town) => (
                      <div
                        key={town.townId}
                        className={`p-3 rounded-lg ${uiConfig.colors.secondary} cursor-pointer hover:${uiConfig.colors.primary}`}
                        onClick={() => navigateToTown(town.townId)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${uiConfig.colors.heading}`}>
                              {formatTownDisplay({ town_name: town.townName, region: town.region, country: town.country })}
                            </div>
                            <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                              {town.issues.filter(i => i.severity === 'critical').length} critical,{' '}
                              {town.issues.filter(i => i.severity === 'high').length} high,{' '}
                              {town.issues.filter(i => i.severity === 'medium').length} medium,{' '}
                              {town.issues.filter(i => i.severity === 'low').length} low
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {town.issues.length}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issue Type Breakdown */}
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3`}>
                    📊 Issue Type Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(report.summary.byType).map(([type, count]) => (
                      <div key={type} className={`p-3 rounded-lg ${uiConfig.colors.secondary}`}>
                        <div className={`text-sm ${uiConfig.colors.subtitle} capitalize`}>
                          {type.replace(/_/g, ' ')}
                        </div>
                        <div className={`text-2xl font-bold ${uiConfig.colors.heading}`}>{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* By Town Tab */}
            {activeView === 'by-town' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search towns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input}`}
                  />
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className={`px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input}`}
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input}`}
                  >
                    <option value="all">All Types</option>
                    {Object.keys(ISSUE_TYPE).map(type => (
                      <option key={type} value={ISSUE_TYPE[type]}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSeverity('all');
                      setSelectedType('all');
                      setSelectedField('all');
                    }}
                    className={`px-4 py-2 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.primary}`}
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Town List */}
                <div className="space-y-3">
                  {filteredIssues.length === 0 ? (
                    <div className={`text-center py-8 ${uiConfig.colors.subtitle}`}>
                      No issues match the current filters
                    </div>
                  ) : (
                    filteredIssues.map((town) => (
                      <div
                        key={town.townId}
                        className={`p-4 rounded-lg ${uiConfig.colors.secondary} cursor-pointer hover:${uiConfig.colors.primary}`}
                        onClick={() => navigateToTown(town.townId, town.issues[0]?.field)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className={`font-medium ${uiConfig.colors.heading}`}>
                            {formatTownDisplay({ town_name: town.townName, region: town.region, country: town.country })}
                          </div>
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {town.issues.length} issues
                          </div>
                        </div>
                        <div className="space-y-2">
                          {town.issues.slice(0, 3).map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <SeverityBadge severity={issue.severity} />
                              <div className={`text-sm ${uiConfig.colors.body} flex-1`}>
                                <span className="font-medium">{issue.field}:</span> {issue.message}
                              </div>
                            </div>
                          ))}
                          {town.issues.length > 3 && (
                            <div className={`text-sm ${uiConfig.colors.hint}`}>
                              ... and {town.issues.length - 3} more issues
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* By Field Tab */}
            {activeView === 'by-field' && (
              <div>
                <div className="space-y-4">
                  {Object.entries(report.fieldIssues)
                    .filter(([_, data]) => data.outliers.length > 0 || data.conventionViolations.length > 0)
                    .map(([fieldName, data]) => {
                      const totalIssues = data.outliers.length + data.conventionViolations.length;
                      return (
                        <div key={fieldName} className={`p-4 rounded-lg ${uiConfig.colors.secondary}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className={`font-medium ${uiConfig.colors.heading}`}>{fieldName}</div>
                              <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                                Stats: Min {data.stats.min}, Max {data.stats.max}, Mean {data.stats.mean}, σ {data.stats.stdDev}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {totalIssues} issues
                            </div>
                          </div>

                          {/* Convention Violations */}
                          {data.conventionViolations.length > 0 && (
                            <div className="mb-3">
                              <div className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>
                                Convention Violations ({data.conventionViolations.length})
                              </div>
                              <div className="space-y-1">
                                {data.conventionViolations.slice(0, 5).map((violation, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-sm ${uiConfig.colors.body} px-3 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    onClick={() => navigateToTown(violation.townId, fieldName)}
                                  >
                                    <span className="font-medium">{violation.townName}:</span> {violation.message}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Outliers */}
                          {data.outliers.length > 0 && (
                            <div>
                              <div className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>
                                Statistical Outliers ({data.outliers.length})
                              </div>
                              <div className="space-y-1">
                                {data.outliers.slice(0, 5).map((outlier, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-sm ${uiConfig.colors.body} px-3 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    onClick={() => navigateToTown(outlier.townId, fieldName)}
                                  >
                                    <span className="font-medium">{outlier.townName}:</span> {outlier.value}{' '}
                                    <span className={`${uiConfig.colors.hint}`}>(Z-score: {outlier.zScore.toFixed(2)})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
