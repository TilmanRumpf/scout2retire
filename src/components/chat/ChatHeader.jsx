import { Users, Settings } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';

/**
 * ChatHeader - Displays header for group chats with settings button
 * Extracted from Chat.jsx
 */
export default function ChatHeader({
  chatType,
  activeGroupChat,
  setShowGroupEditModal
}) {
  if (chatType !== 'group' || !activeGroupChat) return null;

  return (
    <div className={`flex items-center justify-between p-4 border-b ${uiConfig.colors.borderLight}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg`}>
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
            {activeGroupChat.topic || 'Group Chat'}
          </div>
          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
            {activeGroupChat.category || 'General'}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowGroupEditModal(true)}
        className={`p-2 ${uiConfig.colors.hint} hover:${uiConfig.colors.body} rounded-lg transition-colors`}
        title="Group Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}
