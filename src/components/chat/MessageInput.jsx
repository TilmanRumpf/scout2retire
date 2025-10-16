import { uiConfig } from '../../styles/uiConfig';
import { MAX_LENGTHS } from '../../utils/sanitizeUtils';

/**
 * MessageInput - Message input form
 * Extracted from Chat.jsx
 */
export default function MessageInput({
  messageInput,
  setMessageInput,
  chatType,
  activeThread,
  activeTown,
  activeFriend,
  onSubmit
}) {
  const getPlaceholder = () => {
    if (chatType === 'town' && activeTown) {
      return `Message ${activeTown.name} chat...`;
    } else if (chatType === 'lounge') {
      // Check if it's a country-specific lounge or general retirement lounge
      if (activeThread && activeThread.topic && activeThread.topic !== 'Lounge') {
        return `Message ${activeThread.topic} chat...`;
      }
      return 'Message the retirement lounge...';
    } else if (chatType === 'friends' && activeFriend) {
      return `Message ${activeFriend.friend.username || 'friend'}...`;
    }
    return 'Message the community...';
  };

  return (
    <div className={`border-t ${uiConfig.colors.borderLight} p-4`}>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            maxLength={MAX_LENGTHS.CHAT_MESSAGE}
            placeholder={getPlaceholder()}
            className={`flex-1 ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} py-2 px-4 ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent`}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className={`bg-scout-accent-600 hover:bg-scout-accent-700 text-white p-2 ${uiConfig.layout.radius.lg} ${uiConfig.states.disabled} ${uiConfig.animation.transition}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {messageInput.length > 0 && (
          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-right`}>
            {messageInput.length} / {MAX_LENGTHS.CHAT_MESSAGE}
          </div>
        )}
      </form>
    </div>
  );
}
