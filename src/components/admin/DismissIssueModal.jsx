import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function DismissIssueModal({ issue, townName, onDismiss, onClose }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load current user and update time
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user email from users table
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', user.id)
          .single();

        setCurrentUser(userData?.email || user.email);
      }
    };

    loadUser();

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Dismissal comment is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to dismiss issues');
      }

      // Validate town_id exists
      if (!issue.townId) {
        console.error('Missing townId in issue:', issue);
        throw new Error('Invalid issue data - missing town ID');
      }

      // Insert dismissal record
      const { error: insertError } = await supabase
        .from('data_verification_dismissals')
        .insert({
          town_id: issue.townId,
          field_name: issue.field,
          issue_type: issue.severity || 'validation_error',
          issue_description: issue.message,
          dismissed_value: { value: issue.value, expected: issue.expected },
          dismissed_by: user.id,
          dismissal_comment: comment.trim()
        });

      if (insertError) {
        // Check if it's a duplicate dismissal error
        if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
          // Issue already approved - close modal and reload to show updated status
          toast.success('This issue is already approved - refreshing...');
          onClose();
          setTimeout(() => window.location.reload(), 500);
        } else {
          throw insertError;
        }
      } else {
        // Success - close modal and reload to show updated status
        toast.success('Issue approved successfully - refreshing...');
        onClose();
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      console.error('Error dismissing issue:', err);
      if (!error) { // Only set error if not already set above
        setError(err.message || 'Failed to dismiss issue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Dismiss Data Issue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Issue Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Town</div>
            <div className="font-medium text-gray-900 mb-3">{townName}</div>

            <div className="text-sm text-gray-600 mb-1">Issue</div>
            <div className="text-gray-900">{issue.message}</div>

            {issue.field && (
              <div className="mt-2 text-sm text-gray-500">
                Field: <span className="font-mono">{issue.field}</span>
              </div>
            )}
          </div>

          {/* Dismissal Comment */}
          <div className="mb-6">
            <label htmlFor="dismissal-comment" className="block text-sm font-medium text-gray-700 mb-2">
              Why is this issue acceptable? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="dismissal-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Equatorial location - minimal seasonal variation expected. 1°C difference is within normal range for this latitude."
              required
            />
            <div className="mt-2 text-sm text-gray-500">
              This comment will be visible to all admins reviewing this town's data.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center gap-4">
            {/* Current User & Time */}
            <div className="text-sm text-gray-600">
              {currentUser && (
                <div>
                  <div className="font-medium text-gray-900">{currentUser}</div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !comment.trim()}
              >
                {submitting ? 'Dismissing...' : 'Dismiss Issue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
