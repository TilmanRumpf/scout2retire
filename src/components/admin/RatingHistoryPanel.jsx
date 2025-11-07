// Rating History Panel - Track town data changes over time
// Purpose: Catch AI fuckups, data corruption, real disasters
// Shows: Timeline of changes with severity flags

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp, User, Bot } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

export default function RatingHistoryPanel({ townId, townName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all'); // 'all', 'flagged', 'extreme'
  const [showReviewed, setShowReviewed] = useState(false);

  useEffect(() => {
    if (townId) {
      loadHistory();
    }
  }, [townId, filterSeverity, showReviewed]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('town_data_history')
        .select('*')
        .eq('town_id', townId)
        .order('changed_at', { ascending: false });

      // Apply filters
      if (filterSeverity === 'flagged') {
        query = query.eq('is_flagged', true);
      } else if (filterSeverity === 'extreme') {
        query = query.eq('severity', 'extreme');
      }

      if (!showReviewed) {
        query = query.eq('admin_reviewed', false);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load rating history');
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (historyId, notes = null) => {
    try {
      const { error } = await supabase
        .from('town_data_history')
        .update({
          admin_reviewed: true,
          review_notes: notes
        })
        .eq('id', historyId);

      if (error) throw error;

      toast.success('Marked as reviewed');
      loadHistory();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      toast.error('Failed to mark as reviewed');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'extreme':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'moderate':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <CheckCircle className="text-green-500" size={20} />;
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      extreme: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      moderate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      normal: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[severity] || colors.normal}`}>
        {severity?.toUpperCase()}
      </span>
    );
  };

  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'ai_update':
        return <Bot size={16} className="text-purple-500" />;
      case 'manual_edit':
        return <User size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className={uiConfig.colors.hint} />;
    }
  };

  const renderFieldChange = (fieldName, oldValue, newValue) => {
    const isNumeric = !isNaN(oldValue) && !isNaN(newValue);
    const isIncrease = isNumeric && parseFloat(newValue) > parseFloat(oldValue);

    return (
      <div key={fieldName} className="flex items-center gap-2 text-sm">
        <span className={`font-medium ${uiConfig.colors.subtitle}`}>{fieldName}:</span>
        <span className="text-gray-500 dark:text-gray-400 line-through">{oldValue || 'null'}</span>
        <span>→</span>
        <span className={`font-medium ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {newValue || 'null'}
        </span>
        {isNumeric && (
          isIncrease ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
            Rating History: {townName}
          </h3>
          <p className={`text-sm ${uiConfig.colors.hint}`}>
            Tracks changes to objective town data (NOT personalized match scores)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className={`px-3 py-1.5 rounded border ${uiConfig.colors.input}`}
          >
            <option value="all">All Changes</option>
            <option value="flagged">Flagged Only</option>
            <option value="extreme">Extreme Only</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showReviewed}
              onChange={(e) => setShowReviewed(e.target.checked)}
              className="rounded"
            />
            <span className={uiConfig.colors.body}>Show Reviewed</span>
          </label>
        </div>
      </div>

      {/* History Timeline */}
      {history.length === 0 ? (
        <div className={`text-center py-12 ${uiConfig.colors.hint}`}>
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>No changes recorded yet</p>
          <p className="text-xs mt-2">Changes will appear here when town data is updated</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className={`p-4 rounded-lg border ${
                record.is_flagged
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : `border-gray-200 dark:border-gray-700 ${uiConfig.colors.card}`
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(record.severity)}
                  <div>
                    <div className="flex items-center gap-2">
                      {getChangeTypeIcon(record.change_type)}
                      <span className={`text-sm font-medium ${uiConfig.colors.body}`}>
                        {record.change_type?.replace('_', ' ').toUpperCase()}
                      </span>
                      {getSeverityBadge(record.severity)}
                    </div>
                    <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                      {new Date(record.changed_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Review Button */}
                {record.is_flagged && !record.admin_reviewed && (
                  <button
                    onClick={() => markAsReviewed(record.id)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}

                {record.admin_reviewed && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Reviewed
                  </span>
                )}
              </div>

              {/* Change Reason */}
              {record.change_reason && (
                <div className={`text-sm mb-2 ${uiConfig.colors.hint}`}>
                  <strong>Reason:</strong> {record.change_reason}
                </div>
              )}

              {/* Changed Fields */}
              <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                {record.changed_fields?.map((fieldName) =>
                  renderFieldChange(
                    fieldName,
                    record.old_values?.[fieldName],
                    record.new_values?.[fieldName]
                  )
                )}
              </div>

              {/* Review Notes */}
              {record.review_notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${uiConfig.colors.hint}`}>
                    <strong>Review Notes:</strong> {record.review_notes}
                  </p>
                </div>
              )}

              {/* Extreme Change Warning */}
              {record.severity === 'extreme' && !record.admin_reviewed && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ EXTREME CHANGE DETECTED
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This might indicate: Real disaster (volcano/tsunami), data corruption, AI hallucination, or accidental overwrite
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {history.length > 0 && (
        <div className={`grid grid-cols-4 gap-4 p-4 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.border}`}>
          <div>
            <div className={`text-2xl font-bold ${uiConfig.colors.heading}`}>{history.length}</div>
            <div className={`text-xs ${uiConfig.colors.hint}`}>Total Changes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {history.filter(h => h.severity === 'extreme').length}
            </div>
            <div className={`text-xs ${uiConfig.colors.hint}`}>Extreme</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {history.filter(h => h.severity === 'moderate').length}
            </div>
            <div className={`text-xs ${uiConfig.colors.hint}`}>Moderate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {history.filter(h => h.admin_reviewed).length}
            </div>
            <div className={`text-xs ${uiConfig.colors.hint}`}>Reviewed</div>
          </div>
        </div>
      )}
    </div>
  );
}
