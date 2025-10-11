import { Trash2, Pin } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import { displaySafeContent } from '../../utils/sanitizeUtils';

/**
 * Message - Single message component
 * Extracted from Chat.jsx
 */
export default function Message({
  message,
  user,
  chatType,
  isDeleted,
  isFirstInGroup,
  canDelete,
  canPin,
  formatMessageDate,
  onDeleteMessage,
  onPinMessage,
  onUserClick
}) {
  return (
    <div className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] ${uiConfig.layout.radius.lg} px-4 py-2 relative group ${
          isDeleted
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic'
            : message.user_id === user?.id
            ? 'bg-scout-accent-600 text-white'
            : message.user_id === 'scout'
            ? 'bg-blue-600 text-white'
            : `${uiConfig.colors.input} ${uiConfig.colors.body}`
        }`}
      >
        {isFirstInGroup && !isDeleted && (
          <div className="flex items-center text-xs mb-1">
            {message.user_id === user?.id ? (
              <span className={`${uiConfig.font.weight.medium} text-scout-accent-100`}>
                You
              </span>
            ) : message.user_id === 'scout' ? (
              <span className={`${uiConfig.font.weight.medium} text-blue-100`}>
                {message.user_name}
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick(message.user_id, message.user_name);
                }}
                className={`${uiConfig.font.weight.medium} ${uiConfig.colors.hint} hover:underline cursor-pointer active:opacity-70 transition-opacity`}
              >
                {message.user_name}
              </button>
            )}
            <span className={`ml-2 ${
              message.user_id === user?.id
                ? 'text-scout-accent-200'
                : message.user_id === 'scout'
                ? 'text-blue-200'
                : uiConfig.colors.muted
            }`}>
              {formatMessageDate(message.created_at)}
            </span>
          </div>
        )}

        {/* Message content or deleted placeholder */}
        {isDeleted ? (
          <div className="flex items-center gap-2">
            <Trash2 className="w-3 h-3" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{displaySafeContent(message.message)}</div>
        )}

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this message? This cannot be undone.')) {
                onDeleteMessage(message.id);
              }
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10"
            title="Delete message"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        {/* Pin button (group chats only) */}
        {canPin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinMessage(message.id, !message.is_pinned);
            }}
            className={`absolute -top-2 ${canDelete ? '-right-12' : '-right-2'} p-1.5 ${
              message.is_pinned
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-scout-accent-500 hover:bg-scout-accent-600'
            } text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10`}
            title={message.is_pinned ? "Unpin message" : "Pin message"}
          >
            <Pin className={`w-3 h-3 ${message.is_pinned ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
