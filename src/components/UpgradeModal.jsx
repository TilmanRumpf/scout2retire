import React from 'react';
import { X, Sparkles, Check, Zap } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

/**
 * UpgradeModal - Shown when user hits subscription tier limit
 * Triggered by limitReached: true from canUserPerform()
 */
export function UpgradeModal({
  isOpen,
  onClose,
  featureName = 'this feature',
  currentTier = 'free',
  suggestedTier = 'premium',
  currentUsage,
  limit,
  reason
}) {
  if (!isOpen) return null;

  const tierInfo = {
    freemium: {
      name: 'Freemium',
      monthly: 0,
      yearly: 0,
      badge: '⭐',
      color: 'emerald',
      features: [
        '5 chat partners',
        '10 town favorites',
        '10 Scotty AI chats per month',
        '1 PDF export per month'
      ]
    },
    premium: {
      name: 'Premium',
      monthly: 49,
      yearly: 490,
      badge: '💎',
      color: 'blue',
      features: [
        'Unlimited chat partners',
        'Unlimited town favorites',
        '50 Scotty AI chats per month',
        '10 PDF exports per month',
        'Priority support',
        'Advanced search filters'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      monthly: 200,
      yearly: 2000,
      badge: '🏆',
      color: 'purple',
      features: [
        'Everything in Premium',
        'Unlimited Scotty AI chats',
        'Unlimited PDF exports',
        'White-label reports',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ]
    }
  };

  const tier = tierInfo[suggestedTier] || tierInfo.premium;
  const savingsPercentage = tier.yearly > 0 ? Math.round(((tier.monthly * 12 - tier.yearly) / (tier.monthly * 12)) * 100) : 0;

  const bgColorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20'
  };

  const buttonColorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto
                     transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-xl ${bgColorClasses[tier.color]}`}>
                <Sparkles className={`w-6 h-6 text-${tier.color}-600`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upgrade Required
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unlock more features
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-4">
            {/* Limit Message */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">You've reached your limit:</span>
                {' '}
                {limit !== undefined && currentUsage !== undefined ? (
                  <span className="text-gray-600 dark:text-gray-400">
                    {currentUsage}/{limit} {featureName.toLowerCase()} used
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">
                    {featureName} limit reached
                  </span>
                )}
              </p>
              {reason && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {reason}
                </p>
              )}
            </div>

            {/* Upgrade Tier Card */}
            <div className={`${bgColorClasses[tier.color]} rounded-xl p-5 border-2 border-${tier.color}-200
                           dark:border-${tier.color}-800`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tier.badge}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tier.name}
                  </h3>
                </div>
                {savingsPercentage > 0 && (
                  <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30
                                text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                    <Zap className="w-3 h-3" />
                    Save {savingsPercentage}%
                  </div>
                )}
              </div>

              {/* Pricing */}
              {tier.monthly > 0 && (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${tier.monthly}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  {tier.yearly > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      or ${tier.yearly}/year (save ${tier.monthly * 12 - tier.yearly})
                    </p>
                  )}
                </div>
              )}

              {/* Features */}
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 text-${tier.color}-600 flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Tier Info */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              Currently on {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                window.location.href = '/pricing';
              }}
              className={`flex-1 px-4 py-3 ${buttonColorClasses[tier.color]} text-white font-semibold
                        rounded-xl transition-all transform hover:scale-105 shadow-lg`}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for managing upgrade modal state
export function useUpgradeModal() {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    featureName: '',
    currentTier: 'free',
    suggestedTier: 'premium',
    currentUsage: undefined,
    limit: undefined,
    reason: undefined
  });

  const showUpgradeModal = (limitCheckResult) => {
    setModalState({
      isOpen: true,
      featureName: limitCheckResult.featureName || 'this feature',
      currentUsage: limitCheckResult.current_usage,
      limit: limitCheckResult.limit,
      suggestedTier: limitCheckResult.upgrade_to || 'premium',
      reason: limitCheckResult.reason,
      currentTier: 'free' // TODO: Get from user context
    });
  };

  const hideUpgradeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    upgradeModalProps: modalState,
    showUpgradeModal,
    hideUpgradeModal
  };
}
