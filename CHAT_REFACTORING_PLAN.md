# Chat.jsx Refactoring Plan

## Overview
The Chat.jsx file is 3,714 lines and needs to be broken down into smaller, maintainable components. This document provides a detailed extraction plan.

---

## Component Extraction Plan

### 1. **LobbyTab Component**
**Lines:** 2235-2318
**File:** `src/components/chat/LobbyTab.jsx`

**State Needed:**
- `chatFavorites`
- `favoritesSearchTerm`, `setFavoritesSearchTerm`

**Functions Needed:**
- `toggleFavoriteChat(chatType, referenceId, referenceName)`
- `switchToFriendChat(friend)`
- `switchToGroupChat(group)`
- `switchToTownChat(town)`
- `setSelectedCountry(country)`

**Props from External:**
- `friends` - to find friend data
- `groupChats` - to find group data
- `allTowns` - to find town data

**Description:** Displays user's favorited chats with search functionality. Includes favorites from friends, groups, town lounges, and country lounges.

---

### 2. **LoungesTab Component**
**Lines:** 2322-2749
**File:** `src/components/chat/LoungesTab.jsx`

**State Needed:**
- `loungeView`, `setLoungeView`
- `selectedCountry`, `setSelectedCountry`
- `loungesSearchTerm`, `setLoungesSearchTerm`
- `townLoungeSearchTerm`, `setTownLoungeSearchTerm`
- `unreadByType`
- `chatType`
- `allCountries`
- `allTowns`
- `favorites`
- `countryLikes`
- `showCountryAutocomplete`, `setShowCountryAutocomplete`
- `showTownAutocomplete`, `setShowTownAutocomplete`
- `countryDropdownPos`, `setCountryDropdownPos`
- `townDropdownPos`, `setTownDropdownPos`
- `countrySearchRef`
- `countryInputRef`
- `townSearchRef`
- `townInputRef`

**Functions Needed:**
- `switchToLoungeChat()`
- `switchToTownChat(town)`
- `toggleCountryLike(country)`
- `toggleFavorite(userId, townId, name, country)` - from townUtils
- `fetchFavorites(userId, source)` - from townUtils

**Description:** Main lounges tab with sub-sections for Retirement Lounge, Country Lounge, and Town Lounge. Includes search with autocomplete for both countries and towns.

**Sub-components to create:**
- `CountryLoungeView.jsx` (lines 2393-2563)
- `TownLoungeView.jsx` (lines 2566-2747)

---

### 3. **GroupsTab Component**
**Lines:** 2753-2869
**File:** `src/components/chat/GroupsTab.jsx`

**State Needed:**
- `groupsSearchTerm`, `setGroupsSearchTerm`
- `groupChats`
- `chatType`
- `activeGroupChat`
- `unreadCounts`
- `user`

**Functions Needed:**
- `setShowGroupChatModal(bool)`
- `switchToGroupChat(group)`

**Description:** Displays user's groups (My Groups) and other public groups. Includes create group button and search functionality.

---

### 4. **FriendsTab Component**
**Lines:** 2873-3010
**File:** `src/components/chat/FriendsTab.jsx`

**State Needed:**
- `friendsSearchTerm`, `setFriendsSearchTerm`
- `likedMembers`
- `friends`
- `chatType`
- `activeFriend`
- `unreadByFriend`

**Functions Needed:**
- `setShowInviteModal(bool)`
- `switchToFriendChat(friend)`
- `toggleLikeMember(memberId)`

**Description:** Shows liked members and friends list. Includes invite friend button and search functionality.

---

### 5. **FavoritesTab Component**
**Lines:** 3014-3098
**File:** `src/components/chat/FavoritesTab.jsx`

**State Needed:**
- `favoritesSearchTerm`, `setFavoritesSearchTerm`
- `chatFavorites`

**Functions Needed:**
- `toggleFavoriteChat(chatType, referenceId, referenceName)`
- `switchToFriendChat(friend)`
- `switchToGroupChat(group)`
- `switchToTownChat(town)`
- `setSelectedCountry(country)`

**Props from External:**
- `friends`
- `groupChats`
- `allTowns`

**Description:** Identical to LobbyTab - shows favorited chats. Consider consolidating with LobbyTab.

**NOTE:** This is a duplicate of LobbyTab (lines 2235-2318). Should be the same component.

---

### 6. **ChatMessagesArea Component**
**Lines:** 3104-3347
**File:** `src/components/chat/ChatMessagesArea.jsx`

**State Needed:**
- `chatType`
- `activeGroupChat`
- `messages`
- `showMutedMessages`, `setShowMutedMessages`
- `mutedUsers`
- `blockedUsers`
- `user`
- `messageInput`, `setMessageInput`
- `activeTown`
- `activeFriend`
- `isTyping`
- `messagesEndRef`

**Functions Needed:**
- `setShowGroupEditModal(bool)`
- `setSelectedUser({id, name})`
- `deleteMessage(messageId)`
- `handlePinMessage(messageId, shouldPin)`
- `handleSendMessage(e)`
- `formatMessageDate(dateString)`

**Description:** Main chat display area with messages, group chat header, message input form. Handles message filtering, deletion, pinning.

**Sub-components to create:**
- `GroupChatHeader.jsx` (lines 3107-3130)
- `MessageList.jsx` (lines 3133-3307)
- `MessageItem.jsx` (individual message rendering, lines 3188-3285)
- `MessageInput.jsx` (lines 3309-3345)

---

### 7. **MobileActionSheet Component**
**Lines:** 3355-3444
**File:** `src/components/chat/MobileActionSheet.jsx`

**State Needed:**
- `isMobile`
- `showMobileActions`, `setShowMobileActions`

**Functions Needed:**
- `setShowInviteModal(bool)`
- `setShowGroupChatModal(bool)`

**Description:** Mobile bottom sheet with action buttons (Invite Friend, Create Group, Browse Towns).

---

### 8. **InviteModal Component**
**Lines:** 3475-3600
**File:** `src/components/chat/InviteModal.jsx`

**State Needed:**
- `showInviteModal`
- `inviteEmail`, `setInviteEmail`
- `inviteMessage`, `setInviteMessage`
- `inviteLoading`
- `pendingInvitations`

**Functions Needed:**
- `setShowInviteModal(bool)`
- `sendInviteByEmail(email)`
- `cancelSentInvitation(connectionId)`

**Description:** Modal for inviting friends by email with personal message. Shows pending invitations sent.

---

### 9. **CompanionsModal Component**
**Lines:** 3602-3693
**File:** `src/components/chat/CompanionsModal.jsx`

**State Needed:**
- `showCompanionsModal`
- `companions`, `setCompanions`
- `user`

**Functions Needed:**
- `setShowCompanionsModal(bool)`
- `sendFriendRequest(userId)`
- `loadSuggestedCompanions(userId)`

**Description:** Modal for finding and connecting with other Scout2Retire members.

---

## Data Loading Functions (Keep in Chat.jsx)

These functions should remain in Chat.jsx as they manage data fetching and state updates:

### Core Data Loaders (Lines 112-368)
- `loadData()` - Main initialization function
- `loadFriends(userId)` - Lines 434-494
- `loadGroupChats(userId)` - Lines 497-545
- `loadBlockedUsers()` - Lines 548-563
- `loadPendingInvitations(userId)` - Lines 566-624
- `loadSuggestedCompanions(userId)` - Lines 627-679
- `loadAllCountries()` - Lines 682-699
- `loadUserCountries(userFavorites)` - Lines 702-725
- `loadAllTowns()` - Lines 728-744
- `loadLikedMembers(userId)` - Lines 747-779
- `loadChatFavorites(userId)` - Lines 782-799
- `loadCountryLikes(userId)` - Lines 802-818
- `loadUnreadCounts(threads)` - Lines 967-1027
- `loadMessages(threadId)` - Lines 1052-1111

### Action Functions
- `toggleCountryLike(country)` - Lines 821-874
- `toggleLikeMember(memberId)` - Lines 877-916
- `toggleFavoriteChat(chatType, referenceId, referenceName)` - Lines 919-964
- `markThreadAsRead(threadId)` - Lines 1030-1049
- `switchToTownChat(town)` - Lines 1246-1292
- `switchToLoungeChat()` - Lines 1295-1341
- `switchToGroupChat(group)` - Lines 1344-1365
- `switchToFriendChat(friend)` - Lines 1406-1455
- `sendFriendRequest(targetUserId)` - Lines 1458-1483
- `handleCreateGroup({...})` - Lines 1486-1564
- `handleUserAction(actionId, userId)` - Lines 1567-1613
- `toggleMute(userId)` - Lines 1616-1627
- `blockUser(userId)` - Lines 1630-1642
- `unblockUser(userId)` - Lines 1645-1657
- `sendInviteByEmail(email)` - Lines 1660-1829
- `acceptInvitation(connectionId)` - Lines 1832-1898
- `declineInvitation(connectionId)` - Lines 1901-1941
- `cancelSentInvitation(connectionId)` - Lines 1944-1972
- `deleteMessage(messageId)` - Lines 1975-1988
- `handlePinMessage(messageId, shouldPin)` - Lines 1991-2009
- `handleSendMessage(e)` - Lines 2012-2102
- `formatMessageDate(dateString)` - Lines 2105-2119

### Helper Functions
- `getAIResponse(userMessage)` - Lines 1368-1403

---

## Effects (Keep in Chat.jsx)

All useEffect hooks should remain in Chat.jsx to manage subscriptions and side effects:

- Load companions when modal opens (Lines 106-110)
- Load initial data (Lines 113-369)
- Mark thread as read (Lines 373-377)
- Real-time subscription for unread updates (Lines 380-431)
- Subscribe to new messages in active thread (Lines 1114-1173)
- Subscribe to ALL messages for unread counts (Lines 1176-1209)
- Scroll to bottom for new messages (Lines 1212-1226)
- Handle click outside autocomplete (Lines 1229-1243)

---

## Proposed File Structure

```
src/
├── components/
│   └── chat/
│       ├── tabs/
│       │   ├── LobbyTab.jsx
│       │   ├── LoungesTab.jsx
│       │   │   ├── CountryLoungeView.jsx
│       │   │   └── TownLoungeView.jsx
│       │   ├── GroupsTab.jsx
│       │   └── FriendsTab.jsx
│       ├── messages/
│       │   ├── ChatMessagesArea.jsx
│       │   ├── GroupChatHeader.jsx
│       │   ├── MessageList.jsx
│       │   ├── MessageItem.jsx
│       │   └── MessageInput.jsx
│       ├── modals/
│       │   ├── InviteModal.jsx
│       │   └── CompanionsModal.jsx
│       └── mobile/
│           └── MobileActionSheet.jsx
├── hooks/
│   └── useChatState.js (already exists)
└── pages/
    └── Chat.jsx (orchestration layer)
```

---

## Extraction Order (Recommended)

1. **Start with Modals** (easiest, most isolated):
   - InviteModal
   - CompanionsModal
   - MobileActionSheet

2. **Then Tabs** (moderate complexity):
   - FavoritesTab / LobbyTab (consolidate into one)
   - GroupsTab
   - FriendsTab
   - LoungesTab (last, most complex)

3. **Finally Messages Area** (most complex):
   - MessageInput
   - MessageItem
   - GroupChatHeader
   - MessageList
   - ChatMessagesArea

---

## Consolidation Opportunities

### 1. **LobbyTab and FavoritesTab are identical**
- Lines 2235-2318 (Lobby)
- Lines 3014-3098 (Favorites)
- Create single `FavoritesTab.jsx` component
- Use in both tab positions

### 2. **Search bars are repeated**
- Extract to `SearchBar.jsx` component
- Used in: Lobby, Lounges, Groups, Friends, Favorites

### 3. **Autocomplete dropdown logic**
- Extract to `AutocompleteDropdown.jsx`
- Used in: Country Lounge, Town Lounge

---

## Testing Strategy

For each extracted component:

1. Create component file
2. Extract JSX and identify dependencies
3. Pass state/functions as props
4. Test component in isolation
5. Replace inline JSX with component import
6. Verify functionality unchanged
7. Run Playwright tests

---

## Benefits After Refactoring

1. **Reduced Chat.jsx size**: From 3,714 lines to ~800-1000 lines
2. **Improved maintainability**: Each component has single responsibility
3. **Better testability**: Components can be tested in isolation
4. **Easier debugging**: Smaller components are easier to reason about
5. **Reusability**: Components like SearchBar can be reused
6. **Better performance**: Smaller components re-render less

---

## Notes

- Keep all data loading in Chat.jsx (parent orchestration)
- Keep all useEffect hooks in Chat.jsx (subscriptions, side effects)
- Pass only needed state/functions to each component
- Consider using React.memo() for performance if needed
- FriendsSection component already exists and is used elsewhere
- GroupChatModal and GroupChatEditModal already exist
- UserActionSheet and ReportUserModal already exist
