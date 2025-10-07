import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * ReportUserModal - Mobile-first modal for reporting users
 * Displays as bottom sheet on mobile, centered modal on desktop
 */
export default function ReportUserModal({ userId, username, isOpen, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { value: 'harassment', label: 'Harassment or bullying', icon: '⚠️' },
    { value: 'spam', label: 'Spam or unwanted messages', icon: '📧' },
    { value: 'inappropriate_content', label: 'Inappropriate content', icon: '🚫' },
    { value: 'impersonation', label: 'Impersonation or fake account', icon: '🎭' },
    { value: 'privacy_violation', label: 'Privacy violation', icon: '🔒' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('report_user', {
        p_reported_user_id: userId,
        p_reason: reason,
        p_description: description || null
      });

      if (error) throw error;

      toast.success('Report submitted. Our team will review it shortly.');
      onClose();

      // Reset form
      setReason('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div
        className={`relative w-full md:max-w-lg md:mx-4 ${uiConfig.colors.modal}
                    md:${uiConfig.layout.radius.xl} rounded-t-3xl md:rounded-b-3xl
                    ${uiConfig.layout.shadow['2xl']} max-h-[90vh] md:max-h-[85vh]
                    overflow-hidden flex flex-col animate-slideUp md:animate-scaleIn`}
      >
        {/* Handle Bar (Mobile only) */}
        <div className="md:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className={`flex items-center justify-between p-4 md:p-6 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                Report User
              </h2>
              <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                {username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${uiConfig.layout.radius.lg} hover:${uiConfig.colors.secondary} transition-colors`}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">
            {/* Warning message */}
            <div className={`p-3 ${uiConfig.layout.radius.lg} bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800`}>
              <p className={`${uiConfig.font.size.sm} text-amber-800 dark:text-amber-200`}>
                Reports are reviewed by our moderation team. False reports may result in action against your account.
              </p>
            </div>

            {/* Reason selection */}
            <div>
              <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                Why are you reporting this user? *
              </label>
              <div className="space-y-2">
                {reportReasons.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setReason(option.value)}
                    className={`w-full flex items-center gap-3 p-3 ${uiConfig.layout.radius.lg}
                              border-2 transition-all active:scale-[0.98]
                              ${reason === option.value
                                ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                                : `${uiConfig.colors.border} ${uiConfig.colors.input} hover:${uiConfig.colors.secondary}`
                              }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`flex-1 text-left ${uiConfig.font.size.sm} ${
                      reason === option.value
                        ? 'text-scout-accent-700 dark:text-scout-accent-300 font-medium'
                        : uiConfig.colors.body
                    }`}>
                      {option.label}
                    </span>
                    {reason === option.value && (
                      <div className="w-5 h-5 rounded-full bg-scout-accent-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label
                htmlFor="description"
                className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}
              >
                Additional details (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Provide any additional context that might help our moderation team..."
                className={`w-full ${uiConfig.colors.input} ${uiConfig.colors.border} ${uiConfig.layout.radius.lg}
                          px-3 py-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}
                          ${uiConfig.colors.focusRing} focus:border-transparent resize-none`}
              />
              <div className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-right`}>
                {description.length} / 500
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className={`p-4 md:p-6 border-t ${uiConfig.colors.borderLight} bg-gray-50 dark:bg-gray-900/50`}>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 ${uiConfig.layout.radius.lg} ${uiConfig.colors.border}
                          ${uiConfig.colors.body} ${uiConfig.font.weight.medium} hover:${uiConfig.colors.secondary}
                          ${uiConfig.animation.transition} ${uiConfig.states.disabled}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || isSubmitting}
                className={`flex-1 px-4 py-3 ${uiConfig.layout.radius.lg} bg-red-600 text-white
                          ${uiConfig.font.weight.medium} hover:bg-red-700 ${uiConfig.animation.transition}
                          ${uiConfig.states.disabled} active:scale-[0.98]`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
