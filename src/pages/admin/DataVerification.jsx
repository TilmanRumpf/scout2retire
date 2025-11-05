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
import DismissIssueModal from '../../components/admin/DismissIssueModal';

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
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [dismissedIssues, setDismissedIssues] = useState(new Set());
  const [dismissalDetails, setDismissalDetails] = useState(new Map());
  const [showDismissed, setShowDismissed] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null);
  const [bulkActionCount, setBulkActionCount] = useState(0);
  const [researchingIssue, setResearchingIssue] = useState(null);
  const [researchResult, setResearchResult] = useState(null);
  const [selectedTownForVerification, setSelectedTownForVerification] = useState(null);
  const [townSearchQuery, setTownSearchQuery] = useState('');
  const [showTownVerificationView, setShowTownVerificationView] = useState(false);

  // Load towns and analyze
  useEffect(() => {
    loadAndAnalyze();
    loadDismissals();
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

  const loadDismissals = async () => {
    try {
      // Get dismissals with user info
      const { data: dismissals, error } = await supabase
        .from('data_verification_dismissals')
        .select(`
          town_id,
          field_name,
          issue_type,
          dismissal_comment,
          dismissed_at,
          dismissed_by
        `)
        .is('undismissed_at', null);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(dismissals.map(d => d.dismissed_by).filter(Boolean))];

      // Fetch user emails from auth.users
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      // Create lookup map for users
      const userMap = new Map(users?.map(u => [u.id, u.email]) || []);

      // Create dismissal set for quick lookup
      const dismissalSet = new Set(
        dismissals.map(d => `${d.town_id}_${d.field_name}_${d.issue_type}`)
      );

      // Create details map with full audit info
      const detailsMap = new Map(
        dismissals.map(d => {
          const key = `${d.town_id}_${d.field_name}_${d.issue_type}`;
          return [key, {
            approvedBy: userMap.get(d.dismissed_by) || 'Unknown',
            approvedAt: new Date(d.dismissed_at),
            comment: d.dismissal_comment
          }];
        })
      );

      setDismissedIssues(dismissalSet);
      setDismissalDetails(detailsMap);
    } catch (error) {
      console.error('Error loading dismissals:', error);
    }
  };

  const handleDismissClick = (issue, townName, townId, e) => {
    e.stopPropagation();
    // Ensure townId is always present in the issue object
    setSelectedIssue({
      ...issue,
      townName,
      townId: issue.townId || townId // Use issue.townId if present, otherwise use passed townId
    });
    setShowDismissModal(true);
  };

  const handleDismissal = async (issue) => {
    const key = `${issue.townId}_${issue.field}_${issue.severity}`;
    setDismissedIssues(prev => new Set(prev).add(key));
    toast.success('Issue approved successfully');

    // Reload dismissals to get the audit trail info
    await loadDismissals();
  };

  const isIssueDismissed = (issue, townId = null) => {
    // Use provided townId if issue doesn't have one
    const id = issue.townId || townId;
    const key = `${id}_${issue.field}_${issue.severity}`;
    return dismissedIssues.has(key);
  };

  const getDismissalDetails = (issue, townId = null) => {
    // Use provided townId if issue doesn't have one
    const id = issue.townId || townId;
    const key = `${id}_${issue.field}_${issue.severity}`;
    return dismissalDetails.get(key);
  };

  const handleVerifyIssue = (issue, townName) => {
    // Build Google search query based on the issue
    let query = `${townName} ${issue.field}`;

    // Add specific context based on field type
    if (issue.field.includes('elevation')) {
      query += ' elevation meters';
    } else if (issue.field.includes('temperature')) {
      query += ' average temperature';
    } else if (issue.field.includes('population')) {
      query += ' population';
    } else if (issue.field.includes('precipitation')) {
      query += ' rainfall precipitation';
    }

    // Open Google search in new tab
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank');

    toast.success('Opening Google search to verify data');
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

    // Filter out dismissed issues (unless showDismissed is true)
    if (!showDismissed) {
      filtered = filtered.map(town => ({
        ...town,
        issues: town.issues.filter(i => !isIssueDismissed(i))
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

  // Helper function to sort issues by severity
  const sortIssuesBySeverity = (issues) => {
    const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  };

  // Get worst towns and re-sort based on VISIBLE (non-dismissed) issues
  const worstTowns = getWorstTowns(report, 50) // Get more to account for filtering
    .map(town => ({
      ...town,
      visibleIssues: sortIssuesBySeverity(
        town.issues.filter(i => showDismissed || !isIssueDismissed(i, town.townId))
      )
    }))
    .filter(town => town.visibleIssues.length > 0) // Remove towns with no visible issues
    .sort((a, b) => {
      // Re-sort by visible issue severity
      const countSeverity = (town, severity) =>
        town.visibleIssues.filter(i => i.severity === severity).length;

      const aCritical = countSeverity(a, 'critical');
      const bCritical = countSeverity(b, 'critical');
      if (aCritical !== bCritical) return bCritical - aCritical;

      const aHigh = countSeverity(a, 'high');
      const bHigh = countSeverity(b, 'high');
      if (aHigh !== bHigh) return bHigh - aHigh;

      const aMedium = countSeverity(a, 'medium');
      const bMedium = countSeverity(b, 'medium');
      if (aMedium !== bMedium) return bMedium - aMedium;

      const aLow = countSeverity(a, 'low');
      const bLow = countSeverity(b, 'low');
      if (aLow !== bLow) return bLow - aLow;

      return b.visibleIssues.length - a.visibleIssues.length;
    })
    .slice(0, 10); // Take top 10 after sorting

  // Get filtered town list for search dropdown
  const getFilteredTowns = () => {
    if (!townSearchQuery.trim()) return [];

    const query = townSearchQuery.toLowerCase();

    // Prioritize: 1) Town name starts with query, 2) Town name contains query, 3) Region/country contains query
    const startsWithQuery = towns.filter(town =>
      town.town_name.toLowerCase().startsWith(query)
    );

    const containsInName = towns.filter(town =>
      !town.town_name.toLowerCase().startsWith(query) &&
      town.town_name.toLowerCase().includes(query)
    );

    const containsInRegionCountry = towns.filter(town =>
      !town.town_name.toLowerCase().includes(query) &&
      (town.region?.toLowerCase().includes(query) || town.country?.toLowerCase().includes(query))
    );

    return [...startsWithQuery, ...containsInName, ...containsInRegionCountry].slice(0, 10);
  };

  const handleTownSelect = (town) => {
    // Find issues for this town
    const townIssues = report.townIssues.find(t => t.townId === town.id);

    setSelectedTownForVerification({
      ...town,
      issues: townIssues?.issues || []
    });
    setShowTownVerificationView(true);
    // Set the full town name in search bar (this closes dropdown)
    setTownSearchQuery(formatTownDisplay({ town_name: town.town_name, region: town.region, country: town.country }));
  };

  const handleCloseVerificationView = () => {
    setShowTownVerificationView(false);
    setSelectedTownForVerification(null);
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      <UnifiedHeader
        title="Data Verification Dashboard"
        subtitle={`Analyzed ${report.summary.totalTowns} towns • Found ${report.summary.totalIssues} issues in ${report.summary.townsWithIssues} towns`}
        showFilters={false}
      />
      <HeaderSpacer hasFilters={false} />

      <div className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page}`}>
        {/* Verify Specific Town - Prominent Search */}
        <div className={`${uiConfig.colors.card} p-6 rounded-lg ${uiConfig.layout.shadow.md} mb-6 border-2 border-orange-500`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-2`}>
                🔍 Verify Specific Town
              </h3>
              <p className={`text-sm ${uiConfig.colors.subtitle} mb-4`}>
                Search for a town to review all its data quality issues
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={townSearchQuery}
                  onChange={(e) => setTownSearchQuery(e.target.value)}
                  placeholder="Type town name, region, or country..."
                  className={`w-full px-4 py-3 border-2 ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                />

                {/* Dropdown with search results */}
                {townSearchQuery.trim() && !showTownVerificationView && getFilteredTowns().length > 0 && (
                  <div className={`absolute z-10 w-full mt-2 ${uiConfig.colors.card} border ${uiConfig.colors.border} rounded-lg ${uiConfig.layout.shadow.lg} max-h-96 overflow-y-auto`}>
                    {getFilteredTowns().map((town) => {
                      const townIssues = report.townIssues.find(t => t.townId === town.id);
                      const issueCount = townIssues?.issues.length || 0;

                      return (
                        <button
                          key={town.id}
                          onClick={() => handleTownSelect(town)}
                          className={`w-full text-left px-4 py-3 hover:${uiConfig.colors.secondary} border-b ${uiConfig.colors.border} last:border-b-0 transition-colors`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`font-medium ${uiConfig.colors.heading}`}>
                                {formatTownDisplay({ town_name: town.town_name, region: town.region, country: town.country })}
                              </div>
                              {issueCount > 0 && (
                                <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                                  {issueCount} issue{issueCount !== 1 ? 's' : ''} found
                                </div>
                              )}
                            </div>
                            {issueCount > 0 ? (
                              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-medium">
                                {issueCount}
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                                ✓ Clean
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {townSearchQuery.trim() && !showTownVerificationView && getFilteredTowns().length === 0 && (
                  <div className={`absolute z-10 w-full mt-2 ${uiConfig.colors.card} border ${uiConfig.colors.border} rounded-lg ${uiConfig.layout.shadow.lg} p-4 text-center ${uiConfig.colors.subtitle}`}>
                    No towns found matching "{townSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Single Town Verification View */}
        {showTownVerificationView && selectedTownForVerification && (
          <div className={`${uiConfig.colors.card} p-6 rounded-lg ${uiConfig.layout.shadow.md} mb-6 border-2 border-blue-500`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
                  {formatTownDisplay({
                    town_name: selectedTownForVerification.town_name,
                    region: selectedTownForVerification.region,
                    country: selectedTownForVerification.country
                  })}
                </h3>
                <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                  {selectedTownForVerification.issues.length} issue{selectedTownForVerification.issues.length !== 1 ? 's' : ''} found
                </div>
              </div>
              <button
                onClick={handleCloseVerificationView}
                className={`px-4 py-2 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.primary}`}
              >
                Close
              </button>
            </div>

            {selectedTownForVerification.issues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <div className={`text-xl font-semibold ${uiConfig.colors.heading} mb-2`}>
                  No Data Quality Issues Found
                </div>
                <div className={`${uiConfig.colors.subtitle}`}>
                  This town's data looks good!
                </div>
              </div>
            ) : (
              <div>
                {/* Quick Actions */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => navigateToTown(selectedTownForVerification.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit in Towns Manager
                  </button>
                  <button
                    onClick={() => {
                      const wouldDismiss = selectedTownForVerification.issues.filter(
                        i => !isIssueDismissed(i, selectedTownForVerification.id)
                      ).length;

                      if (wouldDismiss === 0) {
                        toast.error('All issues are already approved');
                        return;
                      }

                      const comment = prompt(`Enter approval reason for all ${wouldDismiss} issues:`);
                      if (comment && comment.trim()) {
                        toast.success(`Would approve ${wouldDismiss} issues (bulk approval not yet implemented)`);
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Approve All Issues
                  </button>
                </div>

                {/* Issues List */}
                <div className="space-y-3">
                  {selectedTownForVerification.issues.map((issue, idx) => {
                    const isDismissed = isIssueDismissed(issue, selectedTownForVerification.id);
                    const details = getDismissalDetails(issue, selectedTownForVerification.id);

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          issue.severity === 'critical' ? 'border-red-500' :
                          issue.severity === 'high' ? 'border-orange-500' :
                          issue.severity === 'medium' ? 'border-yellow-500' :
                          'border-blue-500'
                        } ${uiConfig.colors.secondary} ${isDismissed ? 'opacity-60' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <SeverityBadge severity={issue.severity} />
                              <span className={`text-sm ${uiConfig.colors.subtitle}`}>
                                {issue.type?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className={`${uiConfig.colors.body} mb-1`}>
                              <span className="font-medium">{issue.field}:</span> {issue.message}
                            </div>
                            {isDismissed && details && (
                              <div className={`text-sm ${uiConfig.colors.hint} mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded`}>
                                <div className="font-medium text-green-700 dark:text-green-300 mb-1">
                                  ✓ Approved by {details.approvedBy}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {details.approvedAt.toLocaleDateString()} {details.approvedAt.toLocaleTimeString()}
                                </div>
                                <div className="text-xs italic">"{details.comment}"</div>
                              </div>
                            )}
                          </div>
                          {!isDismissed && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifyIssue(issue, selectedTownForVerification.town_name)}
                                className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                              >
                                🔍 Verify
                              </button>
                              <button
                                onClick={(e) => handleDismissClick(
                                  { ...issue, townId: selectedTownForVerification.id },
                                  selectedTownForVerification.town_name,
                                  selectedTownForVerification.id,
                                  e
                                )}
                                className="px-3 py-1 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                              >
                                ✓ Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Issue Type Breakdown */}
        <div className={`${uiConfig.colors.card} p-6 rounded-lg ${uiConfig.layout.shadow.md} mb-6`}>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
            📊 Issue Type Breakdown - Click to filter & resolve
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(report.summary.byType).map(([type, count]) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setActiveView('by-town');

                  // For large quantities (50+), show bulk resolution options
                  if (count >= 50) {
                    setShowBulkActions(true);
                    setBulkActionType(type);
                    setBulkActionCount(count);
                    toast.success(`Found ${count} ${type.replace(/_/g, ' ')} issues - showing resolution options`);
                  } else {
                    setShowBulkActions(false);
                    toast.success(`Filtering ${count} ${type.replace(/_/g, ' ')} issues`);
                  }
                }}
                className={`p-3 rounded-lg ${uiConfig.colors.secondary} text-left hover:ring-2 hover:ring-orange-500 transition-all cursor-pointer ${
                  selectedType === type ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <div className={`text-sm ${uiConfig.colors.subtitle} capitalize`}>
                  {type.replace(/_/g, ' ')}
                </div>
                <div className={`text-2xl font-bold ${uiConfig.colors.heading}`}>{count}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {count >= 50 ? '🔧 Bulk resolve →' : 'Click to resolve →'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Resolution Actions Panel - Shows for 50+ issues */}
        {showBulkActions && bulkActionType && (
          <div className={`${uiConfig.colors.card} p-6 rounded-lg ${uiConfig.layout.shadow.md} mb-6 border-2 border-orange-500`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                  🔧 Bulk Resolution Options: {bulkActionType.replace(/_/g, ' ')} ({bulkActionCount} issues)
                </h3>
                <p className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                  Choose a systematic approach to resolve these issues efficiently
                </p>
              </div>
              <button
                onClick={() => setShowBulkActions(false)}
                className={`px-3 py-1 text-sm rounded-lg ${uiConfig.colors.secondary} hover:${uiConfig.colors.primary}`}
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Review & Dismiss Acceptable */}
              <button
                className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                onClick={() => {
                  toast.success('Opening review mode - scroll down to see filtered issues');
                  setShowBulkActions(false);
                }}
              >
                <div className="text-lg mb-1">📋 Review & Dismiss</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Manually review each issue and dismiss ones that are acceptable
                </div>
              </button>

              {/* Bulk Dismiss with Comment */}
              <button
                className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                onClick={() => {
                  const comment = prompt(`Enter dismissal reason for all ${bulkActionCount} ${bulkActionType.replace(/_/g, ' ')} issues:`);
                  if (comment && comment.trim()) {
                    toast.success(`Would bulk dismiss ${bulkActionCount} issues (database operation not yet implemented)`);
                  }
                }}
              >
                <div className="text-lg mb-1">✅ Bulk Dismiss All</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Dismiss all issues of this type with a single comment
                </div>
              </button>

              {/* Export for Analysis */}
              <button
                className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                onClick={() => {
                  toast.success('Exporting issues to CSV...');
                  // Export functionality would go here
                }}
              >
                <div className="text-lg mb-1">📥 Export to CSV</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Export all issues for external analysis and batch editing
                </div>
              </button>

              {/* Pattern-Based Resolution */}
              {(bulkActionType === 'outlier_moderate' || bulkActionType === 'outlier_extreme') && (
                <button
                  className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                  onClick={() => {
                    toast('Analyzing patterns in outlier data...');
                  }}
                >
                  <div className="text-lg mb-1">🔍 Detect Patterns</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Find systematic issues (e.g., unit conversion errors, regional patterns)
                  </div>
                </button>
              )}

              {/* Validation Rule Adjustment */}
              {bulkActionType === 'suspicious' && (
                <button
                  className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                  onClick={() => {
                    toast('Opening validation rule settings...');
                  }}
                >
                  <div className="text-lg mb-1">⚙️ Adjust Rules</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Review and adjust validation thresholds if too strict
                  </div>
                </button>
              )}

              {/* View All Affected Towns */}
              <button
                className="p-4 text-left rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition-all"
                onClick={() => {
                  setShowBulkActions(false);
                  toast.success('Showing all affected towns below');
                }}
              >
                <div className="text-lg mb-1">🗺️ View All Towns</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  See complete list of all {bulkActionCount} affected towns
                </div>
              </button>
            </div>
          </div>
        )}

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
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                        🔴 Critical Issues ({criticalIssues.filter(i => showDismissed || !isIssueDismissed(i)).length})
                      </h3>
                      <button
                        onClick={() => setShowDismissed(!showDismissed)}
                        className={`px-3 py-1 text-sm rounded-lg ${uiConfig.colors.secondary} hover:${uiConfig.colors.primary}`}
                      >
                        {showDismissed ? 'Hide' : 'Show'} Dismissed
                      </button>
                    </div>
                    <div className="space-y-2">
                      {criticalIssues
                        .filter(i => showDismissed || !isIssueDismissed(i))
                        .slice(0, 10)
                        .map((issue, idx) => {
                          const isDismissed = isIssueDismissed(issue);
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border-l-4 border-red-500 ${uiConfig.colors.secondary} cursor-pointer hover:${uiConfig.colors.primary} ${
                                isDismissed ? 'opacity-60' : ''
                              }`}
                              onClick={() => navigateToTown(issue.townId, issue.field)}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <div className={`font-medium ${uiConfig.colors.heading}`}>
                                    {formatTownDisplay({ town_name: issue.townName, region: issue.region, country: issue.country })}
                                  </div>
                                  <div className={`text-sm ${uiConfig.colors.body} mt-1`}>
                                    <span className="font-medium">{issue.field}:</span> {issue.message}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex items-center gap-2">
                                    <SeverityBadge severity={issue.severity} />
                                    {isDismissed ? (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        ✓ Approved
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleVerifyIssue(issue, issue.townName);
                                          }}
                                          className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                          title="Verify with Google"
                                        >
                                          🔍 Verify
                                        </button>
                                        <button
                                          onClick={(e) => handleDismissClick(issue, issue.townName, issue.townId, e)}
                                          className="px-3 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                        >
                                          ✓ Approve
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  {isDismissed && (() => {
                                    const details = getDismissalDetails(issue);
                                    if (!details) return null;
                                    return (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        <div title={details.comment}>
                                          By: {details.approvedBy}
                                        </div>
                                        <div>
                                          {details.approvedAt.toLocaleDateString()} {details.approvedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Worst Towns */}
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3`}>
                    🏚️ Top 10 Towns with Most Issues
                  </h3>
                  <div className="space-y-3">
                    {worstTowns.map((town) => {
                      // visibleIssues already computed in worstTowns calculation
                      return (
                        <div
                          key={town.townId}
                          className={`p-4 rounded-lg ${uiConfig.colors.secondary}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 cursor-pointer" onClick={() => navigateToTown(town.townId)}>
                              <div className={`font-medium ${uiConfig.colors.heading}`}>
                                {formatTownDisplay({ town_name: town.townName, region: town.region, country: town.country })}
                              </div>
                              <div className={`text-sm ${uiConfig.colors.subtitle} mt-1`}>
                                {town.visibleIssues.filter(i => i.severity === 'critical').length} critical,{' '}
                                {town.visibleIssues.filter(i => i.severity === 'high').length} high,{' '}
                                {town.visibleIssues.filter(i => i.severity === 'medium').length} medium,{' '}
                                {town.visibleIssues.filter(i => i.severity === 'low').length} low
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {town.visibleIssues.length}
                            </div>
                          </div>

                          {/* Show top 3 issues with quick dismiss */}
                          <div className="space-y-2">
                            {town.visibleIssues.slice(0, 3).map((issue, idx) => {
                              const isDismissed = isIssueDismissed(issue, town.townId);
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-start gap-2 p-2 rounded ${isDismissed ? 'opacity-60' : ''}`}
                                >
                                  <SeverityBadge severity={issue.severity} />
                                  <div className={`text-sm ${uiConfig.colors.body} flex-1`}>
                                    <div>
                                      <span className="font-medium">{issue.field}:</span> {issue.message}
                                    </div>
                                    {isDismissed && (() => {
                                      const details = getDismissalDetails(issue, town.townId);
                                      if (!details) return null;
                                      return (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={details.comment}>
                                          ✓ Approved by {details.approvedBy} on {details.approvedAt.toLocaleDateString()}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {isDismissed ? (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                      ✓ Approved
                                    </span>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVerifyIssue(issue, town.townName);
                                        }}
                                        className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 whitespace-nowrap"
                                        title="Verify with Google"
                                      >
                                        🔍 Verify
                                      </button>
                                      <button
                                        onClick={(e) => handleDismissClick(issue, town.townName, town.townId, e)}
                                        className="px-3 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 whitespace-nowrap"
                                      >
                                        ✓ Approve
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {town.visibleIssues.length > 3 && (
                              <button
                                onClick={() => navigateToTown(town.townId)}
                                className={`text-sm ${uiConfig.colors.hint} hover:${uiConfig.colors.accent}`}
                              >
                                ... and {town.visibleIssues.length - 3} more issues - click to view all
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

      {/* Dismiss Issue Modal */}
      {showDismissModal && selectedIssue && (
        <DismissIssueModal
          issue={selectedIssue}
          townName={selectedIssue.townName}
          onDismiss={handleDismissal}
          onClose={() => setShowDismissModal(false)}
        />
      )}
    </div>
  );
}
