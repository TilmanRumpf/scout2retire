import { uiConfig } from '../../styles/uiConfig';

/**
 * InviteModal - Modal for inviting friends by email
 * Extracted from Chat.jsx to reduce complexity
 */
export default function InviteModal({
  isOpen,
  onClose,
  inviteEmail,
  setInviteEmail,
  inviteMessage,
  setInviteMessage,
  inviteLoading,
  pendingInvitations,
  onSendInvite,
  onCancelInvitation
}) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setInviteEmail('');
    // Keep the message for next time
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendInvite(inviteEmail);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full`}>
        {/* Header */}
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex justify-between items-center">
            <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Invite a Friend
            </h2>
            <button
              onClick={handleClose}
              className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`${uiConfig.colors.body} mb-4`}>
            Connect with someone who shares your retirement dreams:
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent`}
                  required
                  disabled={inviteLoading}
                />
              </div>

              {/* Message Input */}
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add your personal message here..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:border-transparent resize-none"
                  disabled={inviteLoading}
                />
                <div className={`mt-1 text-xs ${uiConfig.colors.hint} text-right`}>
                  {inviteMessage.length}/500
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 ${uiConfig.colors.btnNeutral} ${uiConfig.layout.radius.md}`}
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={inviteLoading || !inviteEmail}
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>

          {/* Pending Invitations List */}
          {pendingInvitations?.sent && pendingInvitations.sent.length > 0 && (
            <div className={`mt-6 pt-6 border-t ${uiConfig.colors.borderLight}`}>
              <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-3`}>
                Pending invitations you've sent:
              </p>
              <div className="space-y-2">
                {pendingInvitations.sent.map(invite => (
                  <div key={invite.id} className={`flex items-center justify-between ${uiConfig.colors.input} p-2 ${uiConfig.layout.radius.md}`}>
                    <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                      {invite.friend?.username || `User ${invite.friend_id?.slice(0, 8)}...`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                        Pending
                      </span>
                      <button
                        onClick={() => onCancelInvitation(invite.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Cancel invitation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
