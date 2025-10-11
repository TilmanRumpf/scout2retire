# Chat Refactoring - Code Examples

This document provides concrete examples of how to extract components from Chat.jsx.

---

## Example 1: InviteModal (Easiest)

### Before (in Chat.jsx, lines 3475-3600)
```jsx
// Inside Chat.jsx return statement
{showInviteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`${uiConfig.colors.modal} ...`}>
      {/* 125 lines of modal content */}
    </div>
  </div>
)}
```

### After: Create `/src/components/chat/modals/InviteModal.jsx`
```jsx
import { uiConfig } from '../../../styles/uiConfig';

export default function InviteModal({
  isOpen,
  inviteEmail,
  setInviteEmail,
  inviteMessage,
  setInviteMessage,
  inviteLoading,
  pendingInvitations,
  onClose,
  sendInviteByEmail,
  cancelSentInvitation,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex justify-between items-center">
            <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Invite a Friend
            </h2>
            <button
              onClick={() => {
                onClose();
                setInviteEmail('');
              }}
              className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Rest of modal content - same as before */}
        </div>
      </div>
    </div>
  );
}
```

### In Chat.jsx (updated)
```jsx
import InviteModal from '../components/chat/modals/InviteModal';

// ... rest of Chat.jsx

return (
  <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
    {/* ... other content ... */}

    <InviteModal
      isOpen={showInviteModal}
      inviteEmail={inviteEmail}
      setInviteEmail={setInviteEmail}
      inviteMessage={inviteMessage}
      setInviteMessage={setInviteMessage}
      inviteLoading={inviteLoading}
      pendingInvitations={pendingInvitations}
      onClose={() => setShowInviteModal(false)}
      sendInviteByEmail={sendInviteByEmail}
      cancelSentInvitation={cancelSentInvitation}
    />
  </div>
);
```

---

## Example 2: GroupsTab (Moderate Complexity)

### Create `/src/components/chat/tabs/GroupsTab.jsx`
```jsx
import { Search, Users } from 'lucide-react';
import { uiConfig } from '../../../styles/uiConfig';

export default function GroupsTab({
  groupsSearchTerm,
  setGroupsSearchTerm,
  groupChats,
  chatType,
  activeGroupChat,
  unreadCounts,
  user,
  setShowGroupChatModal,
  switchToGroupChat,
}) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
          <input
            type="search"
            placeholder="Search groups..."
            value={groupsSearchTerm}
            onChange={(e) => setGroupsSearchTerm(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
          />
        </div>
      </div>

      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex items-center justify-between">
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Groups</h2>
            <button
              onClick={() => setShowGroupChatModal(true)}
              className={`${uiConfig.colors.btnSecondary} px-3 py-1 text-xs ${uiConfig.layout.radius.md}`}
            >
              Create Group
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* My Groups */}
          {groupChats.filter(g => g.created_by === user?.id || g.members?.includes(user?.id)).length > 0 && (
            <>
              <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                My Groups
              </div>
              {groupChats
                .filter(g => g.created_by === user?.id || g.members?.includes(user?.id))
                .sort((a, b) => (a.topic || '').localeCompare(b.topic || ''))
                .map(group => (
                  <button
                    key={group.id}
                    onClick={() => switchToGroupChat(group)}
                    className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                      chatType === 'group' && activeGroupChat?.id === group.id ? uiConfig.colors.badge : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${group.is_public ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                        <span>{group.is_public ? '🌐' : '🔒'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={uiConfig.font.weight.medium}>{group.topic || 'Untitled Group'}</div>
                          {unreadCounts[group.id] > 0 && (
                            <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              {unreadCounts[group.id]}
                            </div>
                          )}
                        </div>
                        <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                          {group.category || 'General'} {group.role === 'admin' && '• Admin'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              <hr className="my-2" />
            </>
          )}

          {/* Other Groups - similar pattern */}
          {/* ... */}

          {groupChats.length === 0 && (
            <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
              <p>No groups yet.</p>
              <button
                onClick={() => setShowGroupChatModal(true)}
                className={`mt-3 ${uiConfig.colors.btnPrimary} px-4 py-2 ${uiConfig.layout.radius.md}`}
              >
                Create First Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### In Chat.jsx (updated)
```jsx
import GroupsTab from '../components/chat/tabs/GroupsTab';

// Inside the main return, replace lines 2753-2869 with:
{activeTab === 'groups' && (
  <GroupsTab
    groupsSearchTerm={groupsSearchTerm}
    setGroupsSearchTerm={setGroupsSearchTerm}
    groupChats={groupChats}
    chatType={chatType}
    activeGroupChat={activeGroupChat}
    unreadCounts={unreadCounts}
    user={user}
    setShowGroupChatModal={setShowGroupChatModal}
    switchToGroupChat={switchToGroupChat}
  />
)}
```

---

## Example 3: SearchBar (Reusable Component)

### Create `/src/components/chat/shared/SearchBar.jsx`
```jsx
import { Search } from 'lucide-react';
import { uiConfig } from '../../../styles/uiConfig';

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3 ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
        />
      </div>
    </div>
  );
}
```

### Usage in GroupsTab
```jsx
import SearchBar from '../shared/SearchBar';

export default function GroupsTab({ ... }) {
  return (
    <div className="space-y-4">
      <SearchBar
        value={groupsSearchTerm}
        onChange={setGroupsSearchTerm}
        placeholder="Search groups..."
      />

      {/* Rest of tab content */}
    </div>
  );
}
```

---

## Example 4: MessageItem (Complex with Conditionals)

### Create `/src/components/chat/messages/MessageItem.jsx`
```jsx
import { Trash2, Pin } from 'lucide-react';
import { uiConfig } from '../../../styles/uiConfig';
import { displaySafeContent } from '../../../utils/sanitizeUtils';

export default function MessageItem({
  message,
  previousMessage,
  index,
  currentUserId,
  chatType,
  onDeleteMessage,
  onPinMessage,
  onUserClick,
  formatMessageDate,
}) {
  // Check if message is deleted
  const isDeleted = message.deleted_at;

  // Check if message can be deleted (own message, within time window)
  const now = new Date();
  const messageTime = new Date(message.created_at);
  const messageAge = (now - messageTime) / 1000 / 60; // in minutes
  const DELETE_WINDOW_MINUTES = 15;

  const isOwnMessage = message.user_id === currentUserId;
  const withinTimeWindow = messageAge < DELETE_WINDOW_MINUTES;
  const canDelete = isOwnMessage && !isDeleted && withinTimeWindow;

  // Check if message can be pinned (group chats only)
  const canPin = chatType === 'group' && !isDeleted;

  // Check if we should show user header (first message or different user from previous)
  const showUserHeader = index === 0 || previousMessage?.user_id !== message.user_id;

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
        showUserHeader ? 'mt-4' : 'mt-1'
      }`}
    >
      <div
        className={`max-w-[75%] ${uiConfig.layout.radius.lg} px-4 py-2 relative group ${
          isDeleted
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic'
            : isOwnMessage
            ? 'bg-scout-accent-600 text-white'
            : message.user_id === 'scout'
            ? 'bg-blue-600 text-white'
            : `${uiConfig.colors.input} ${uiConfig.colors.body}`
        }`}
      >
        {showUserHeader && !isDeleted && (
          <div className="flex items-center text-xs mb-1">
            {isOwnMessage ? (
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
                  onUserClick({
                    id: message.user_id,
                    name: message.user_name
                  });
                }}
                className={`${uiConfig.font.weight.medium} ${uiConfig.colors.hint} hover:underline cursor-pointer active:opacity-70 transition-opacity`}
              >
                {message.user_name}
              </button>
            )}
            <span className={`ml-2 ${
              isOwnMessage
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

        {/* Pin button */}
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
```

### Usage in MessageList
```jsx
import MessageItem from './MessageItem';

export default function MessageList({ messages, currentUserId, chatType, ... }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          previousMessage={index > 0 ? messages[index - 1] : null}
          index={index}
          currentUserId={currentUserId}
          chatType={chatType}
          onDeleteMessage={deleteMessage}
          onPinMessage={handlePinMessage}
          onUserClick={setSelectedUser}
          formatMessageDate={formatMessageDate}
        />
      ))}
    </div>
  );
}
```

---

## Example 5: Prop Consolidation Pattern

When you have many props, consider grouping them:

### Before (many individual props)
```jsx
<ChatMessagesArea
  chatType={chatType}
  activeGroupChat={activeGroupChat}
  messages={messages}
  showMutedMessages={showMutedMessages}
  mutedUsers={mutedUsers}
  blockedUsers={blockedUsers}
  user={user}
  messageInput={messageInput}
  activeTown={activeTown}
  activeFriend={activeFriend}
  isTyping={isTyping}
  messagesEndRef={messagesEndRef}
  setShowGroupEditModal={setShowGroupEditModal}
  setSelectedUser={setSelectedUser}
  setShowMutedMessages={setShowMutedMessages}
  setMessageInput={setMessageInput}
  deleteMessage={deleteMessage}
  handlePinMessage={handlePinMessage}
  handleSendMessage={handleSendMessage}
  formatMessageDate={formatMessageDate}
/>
```

### After (grouped by concern)
```jsx
<ChatMessagesArea
  chatState={{
    type: chatType,
    activeGroup: activeGroupChat,
    activeTown: activeTown,
    activeFriend: activeFriend,
  }}
  messagesState={{
    messages: messages,
    messageInput: messageInput,
    isTyping: isTyping,
    showMuted: showMutedMessages,
    messagesEndRef: messagesEndRef,
  }}
  moderationState={{
    mutedUsers: mutedUsers,
    blockedUsers: blockedUsers,
  }}
  user={user}
  actions={{
    setShowGroupEditModal,
    setSelectedUser,
    setShowMutedMessages,
    setMessageInput,
    deleteMessage,
    handlePinMessage,
    handleSendMessage,
    formatMessageDate,
  }}
/>
```

Then in component:
```jsx
export default function ChatMessagesArea({
  chatState,
  messagesState,
  moderationState,
  user,
  actions
}) {
  const { type, activeGroup, activeTown, activeFriend } = chatState;
  const { messages, messageInput, isTyping, showMuted, messagesEndRef } = messagesState;
  const { mutedUsers, blockedUsers } = moderationState;
  const {
    setShowGroupEditModal,
    setSelectedUser,
    setShowMutedMessages,
    setMessageInput,
    deleteMessage,
    handlePinMessage,
    handleSendMessage,
    formatMessageDate,
  } = actions;

  // Rest of component
}
```

---

## Testing Example

After extracting a component, test it works:

```jsx
// In Chat.jsx, temporarily add console.log
{activeTab === 'groups' && (
  <>
    {console.log('GroupsTab props:', {
      groupsSearchTerm,
      groupChats: groupChats.length,
      user: user?.id,
    })}
    <GroupsTab
      groupsSearchTerm={groupsSearchTerm}
      setGroupsSearchTerm={setGroupsSearchTerm}
      // ... rest of props
    />
  </>
)}
```

Run Playwright test:
```bash
npx playwright test tests/e2e/chat.spec.js
```

If tests pass, remove console.log and commit.

---

## Common Pitfalls to Avoid

### 1. Forgetting to pass setters
```jsx
// BAD - read-only, can't update
<GroupsTab groupsSearchTerm={groupsSearchTerm} />

// GOOD - can update
<GroupsTab
  groupsSearchTerm={groupsSearchTerm}
  setGroupsSearchTerm={setGroupsSearchTerm}
/>
```

### 2. Passing entire state object instead of specific values
```jsx
// BAD - component re-renders on ANY state change
<GroupsTab chatState={chatState} />

// GOOD - only re-renders when these specific values change
<GroupsTab
  groupsSearchTerm={groupsSearchTerm}
  groupChats={groupChats}
  user={user}
/>
```

### 3. Not destructuring useChatState properly
```jsx
// BAD - loses all state
const chatState = useChatState();

// GOOD - maintains all state and setters
const {
  groupsSearchTerm,
  setGroupsSearchTerm,
  groupChats,
  // ... rest
} = useChatState();
```

### 4. Breaking refs
```jsx
// BAD - creates new ref on every render
<CountryLoungeView countrySearchRef={useRef(null)} />

// GOOD - uses ref from parent
<CountryLoungeView countrySearchRef={countrySearchRef} />
```

---

## Next Steps

1. Start with InviteModal (easiest)
2. Verify it works in isolation
3. Run Playwright tests
4. Move to CompanionsModal
5. Continue with migration checklist

Remember: **One component at a time, test after each extraction.**
