import { uiConfig } from '../../styles/uiConfig';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * ChatArea - Main chat conversation area
 * Extracted from Chat.jsx
 */
export default function ChatArea({
  // Chat state
  chatType,
  activeGroupChat,
  activeThread,
  messages,
  user,
  isTyping,
  activeTown,
  activeFriend,
  messageInput,
  setMessageInput,

  // Filtering
  mutedUsers,
  blockedUsers,
  showMutedMessages,
  setShowMutedMessages,

  // Refs
  messagesEndRef,

  // Modals
  setShowGroupEditModal,

  // Actions
  onSendMessage,
  onDeleteMessage,
  onPinMessage,
  setSelectedUser,

  // Utilities
  formatMessageDate
}) {
  return (
    <div
      className={`flex-1 min-w-0 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex flex-col`}
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      {/* Group Chat Header */}
      <ChatHeader
        chatType={chatType}
        activeGroupChat={activeGroupChat}
        setShowGroupEditModal={setShowGroupEditModal}
      />

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList
          messages={messages}
          user={user}
          chatType={chatType}
          isTyping={isTyping}
          mutedUsers={mutedUsers}
          blockedUsers={blockedUsers}
          showMutedMessages={showMutedMessages}
          setShowMutedMessages={setShowMutedMessages}
          messagesEndRef={messagesEndRef}
          formatMessageDate={formatMessageDate}
          onDeleteMessage={onDeleteMessage}
          onPinMessage={onPinMessage}
          setSelectedUser={setSelectedUser}
        />
      </div>

      {/* Message input */}
      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        chatType={chatType}
        activeThread={activeThread}
        activeTown={activeTown}
        activeFriend={activeFriend}
        onSubmit={onSendMessage}
      />
    </div>
  );
}
