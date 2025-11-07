// Alert Dashboard - IN-YOUR-FACE warnings about donkey shit
// Shows: Extreme changes, outliers, data corruption, AI fuckups

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, TrendingDown, Database, Bot } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import { uiConfig } from '../../styles/uiConfig';

export default function AlertDashboard({ onNavigateToTown }) {
  const [alerts, setAlerts] = useState({
    extreme: [],
    outliers: [],
    needsReview: 0,
    loading: true
  });

  useEffect(() => {
    loadAlerts();
    // Refresh every 60 seconds
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      // Get extreme changes needing review
      const { data: extremeChanges, error } = await supabase
        .from('town_data_history')
        .select(`
          *,
          towns!inner(id, town_name, country)
        `)
        .eq('severity', 'extreme')
        .eq('admin_reviewed', false)
        .order('changed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get count of all unreviewed flagged items
      const { count, error: countError } = await supabase
        .from('town_data_history')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true)
        .eq('admin_reviewed', false);

      if (countError) throw countError;

      setAlerts({
        extreme: extremeChanges || [],
        needsReview: count || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts(prev => ({ ...prev, loading: false }));
    }
  };

  const markAllAsReviewed = async () => {
    try {
      const { error } = await supabase
        .from('town_data_history')
        .update({ admin_reviewed: true })
        .eq('is_flagged', true)
        .eq('admin_reviewed', false);

      if (error) throw error;
      loadAlerts();
    } catch (error) {
      console.error('Error marking all as reviewed:', error);
    }
  };

  if (alerts.loading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-32" />
    );
  }

  // No alerts = show success state
  if (alerts.needsReview === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">✓</span>
          </div>
          <div>
            <h3 className="font-bold text-green-700 dark:text-green-300">All Clear!</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              No extreme changes or outliers detected
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ALERT STATE - Show warnings
  return (
    <div className="space-y-3">
      {/* Header Alert */}
      <div className="bg-red-50 dark:bg-red-900/20 border-3 border-red-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-300">
                ⚠️ DONKEY SHIT DETECTED
              </h3>
              <p className="text-red-600 dark:text-red-400 font-medium mt-1">
                {alerts.needsReview} suspicious changes need your review
              </p>
              <p className="text-sm text-red-500 dark:text-red-500 mt-1">
                Possible causes: AI fuckups, data corruption, real disasters, outliers
              </p>
            </div>
          </div>

          <button
            onClick={markAllAsReviewed}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Mark All Reviewed
          </button>
        </div>
      </div>

      {/* Extreme Changes List */}
      {alerts.extreme.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
          <h4 className="font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
            <TrendingDown size={20} />
            Top {alerts.extreme.length} Extreme Changes
          </h4>

          <div className="space-y-2">
            {alerts.extreme.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                onClick={() => onNavigateToTown && onNavigateToTown(change.town_id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {change.towns?.town_name}, {change.towns?.country}
                    </span>
                    {change.change_type === 'ai_update' && (
                      <Bot size={14} className="text-purple-500" title="AI Update" />
                    )}
                  </div>

                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {change.changed_fields?.map((field, idx) => (
                      <span key={field}>
                        <strong>{field}:</strong>{' '}
                        <span className="line-through">{change.old_values?.[field]}</span>
                        {' → '}
                        <span className="font-bold">{change.new_values?.[field]}</span>
                        {idx < change.changed_fields.length - 1 && ', '}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(change.changed_at).toLocaleString()}
                  </div>
                </div>

                <AlertTriangle size={20} className="text-red-500" />
              </div>
            ))}
          </div>

          {alerts.needsReview > alerts.extreme.length && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
              + {alerts.needsReview - alerts.extreme.length} more changes need review
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-100 dark:bg-red-900/30 rounded p-3 border border-red-300 dark:border-red-700">
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {alerts.extreme.length}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">Extreme Changes</div>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3 border border-yellow-300 dark:border-yellow-700">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {alerts.needsReview}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Need Review</div>
        </div>

        <div className="bg-orange-100 dark:bg-orange-900/30 rounded p-3 border border-orange-300 dark:border-orange-700">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {alerts.extreme.filter(a => a.change_type === 'ai_update').length}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">AI Fuckups</div>
        </div>
      </div>
    </div>
  );
}
