import { uiConfig } from '../../styles/uiConfig';
import Message from './Message';

/**
 * MessageList - Renders list of messages with filtering
 * Extracted from Chat.jsx
 */
export default function MessageList({
  messages,
  user,
  chatType,
  isTyping,
  mutedUsers,
  blockedUsers,
  showMutedMessages,
  setShowMutedMessages,
  messagesEndRef,
  formatMessageDate,
  onDeleteMessage,
  onPinMessage,
  setSelectedUser
}) {
  // Filter messages based on muted/blocked users
  const filteredMessages = showMutedMessages
    ? messages
    : messages.filter(msg =>
        !mutedUsers.includes(msg.user_id) &&
        !blockedUsers.includes(msg.user_id)
      );

  const hiddenCount = messages.length - filteredMessages.length;

  // Calculate permissions for each message
  const getMessagePermissions = (message, index) => {
    const isDeleted = message.deleted_at;
    const now = new Date();
    const messageTime = new Date(message.created_at);
    const messageAge = (now - messageTime) / 1000 / 60; // in minutes
    const DELETE_WINDOW_MINUTES = 15;

    const isOwnMessage = message.user_id === user?.id;
    const withinTimeWindow = messageAge < DELETE_WINDOW_MINUTES;
    const canDelete = isOwnMessage && !isDeleted && withinTimeWindow;
    const canPin = chatType === 'group' && !isDeleted;
    const isFirstInGroup = index === 0 || messages[index - 1].user_id !== message.user_id;

    return { isDeleted, canDelete, canPin, isFirstInGroup };
  };

  return (
    <>
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowMutedMessages(!showMutedMessages)}
          className={`w-full text-center ${uiConfig.font.size.xs} ${uiConfig.colors.hint} hover:${uiConfig.colors.body} py-2 ${uiConfig.layout.radius.lg} hover:${uiConfig.colors.secondary} transition-colors`}
        >
          {showMutedMessages
            ? `Hide ${hiddenCount} muted/blocked message${hiddenCount > 1 ? 's' : ''}`
            : `Show ${hiddenCount} muted/blocked message${hiddenCount > 1 ? 's' : ''}`
          }
        </button>
      )}

      {filteredMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className={`text-center ${uiConfig.colors.hint}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {filteredMessages.map((message, index) => {
            const permissions = getMessagePermissions(message, index);

            return (
              <div
                key={message.id}
                className={index > 0 && messages[index - 1].user_id === message.user_id ? 'mt-1' : 'mt-4'}
              >
                <Message
                  message={message}
                  user={user}
                  chatType={chatType}
                  {...permissions}
                  formatMessageDate={formatMessageDate}
                  onDeleteMessage={onDeleteMessage}
                  onPinMessage={onPinMessage}
                  onUserClick={(userId, userName) => {
                    setSelectedUser({ id: userId, name: userName });
                  }}
                />
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && chatType === 'scout' && (
            <div className="flex justify-start mt-4">
              <div className={`bg-blue-600 text-white ${uiConfig.layout.radius.lg} px-4 py-2`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </>
  );
}
