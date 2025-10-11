import { uiConfig } from '../../styles/uiConfig';

/**
 * CompanionsModal - Modal for finding and connecting with other users
 * Extracted from Chat.jsx to reduce complexity
 */
export default function CompanionsModal({
  isOpen,
  onClose,
  companions,
  setCompanions,
  user,
  onLoadSuggestedCompanions,
  onSendFriendRequest
}) {
  if (!isOpen) return null;

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    if (search) {
      const filtered = companions.filter(c =>
        c.username?.toLowerCase().includes(search)
      );
      setCompanions(filtered);
    } else {
      onLoadSuggestedCompanions(user.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full max-h-[80vh] overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex justify-between items-center">
            <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Find Companions
            </h2>
            <button
              onClick={onClose}
              className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Search Box */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={handleSearch}
              className={`w-full px-4 py-2 border ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} focus:outline-none focus:ring-2 focus:ring-scout-accent-500`}
            />
          </div>

          {/* Empty State */}
          {companions.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${uiConfig.colors.hint} mb-2`}>
                No users found
              </p>
              <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                Try searching by name or use the "Invite a Friend" button to invite someone by email
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-4`}>
                Connect with other Scout2Retire members:
              </p>

              {/* Companions List */}
              {companions.map(companion => (
                <div
                  key={companion.id}
                  className={`${uiConfig.colors.input} ${uiConfig.layout.radius.lg} p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                        <span className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium}`}>
                          {companion.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                          {companion.username || 'User'}
                        </h3>
                        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                          {companion.similarity_score}% match
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onSendFriendRequest(companion.id)}
                      className={`px-3 py-1 bg-scout-accent-600 hover:bg-scout-accent-700 text-white ${uiConfig.font.size.sm} ${uiConfig.layout.radius.md} ${uiConfig.animation.transition}`}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
