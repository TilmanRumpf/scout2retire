# Chat Component Hierarchy

## Current Structure (Single File)
```
Chat.jsx (3,714 lines)
├── Everything in one massive file
└── Hard to navigate and maintain
```

## Proposed Structure (Modular)

```
Chat.jsx (800-1000 lines - Orchestration Layer)
│
├── UnifiedHeader (existing component)
│   └── Tabs: Lobby, Lounges, Groups, Friends, Favorites
│
├── LEFT SIDEBAR (Tab-Based Content)
│   │
│   ├── <LobbyTab />
│   │   ├── <SearchBar />
│   │   └── Favorited chats list
│   │
│   ├── <LoungesTab />
│   │   ├── Main lounge list view
│   │   ├── <CountryLoungeView />
│   │   │   ├── My Countries section
│   │   │   ├── <SearchBar />
│   │   │   ├── <AutocompleteDropdown />
│   │   │   └── All countries list
│   │   └── <TownLoungeView />
│   │       ├── My Favorite Towns section
│   │       ├── <SearchBar />
│   │       ├── <AutocompleteDropdown />
│   │       └── All towns list
│   │
│   ├── <GroupsTab />
│   │   ├── <SearchBar />
│   │   ├── Create Group button
│   │   ├── My Groups section
│   │   └── Other Groups section
│   │
│   ├── <FriendsTab />
│   │   ├── <SearchBar />
│   │   ├── Invite Friend button
│   │   ├── Liked Members section
│   │   └── Friends section
│   │
│   └── <FavoritesTab /> (same as LobbyTab - consolidate)
│       ├── <SearchBar />
│       └── Favorited chats list
│
├── RIGHT AREA (Chat Display)
│   │
│   └── <ChatMessagesArea />
│       ├── <GroupChatHeader /> (conditional)
│       ├── <MessageList />
│       │   └── <MessageItem /> (repeated for each message)
│       │       ├── User info
│       │       ├── Message content
│       │       ├── Delete button (conditional)
│       │       └── Pin button (conditional)
│       └── <MessageInput />
│           ├── Text input
│           ├── Character counter
│           └── Send button
│
├── MODALS & OVERLAYS
│   │
│   ├── <MobileActionSheet /> (mobile only)
│   │   ├── Invite a Friend action
│   │   ├── Create Group action
│   │   └── Browse Towns action
│   │
│   ├── <UserActionSheet /> (existing)
│   │   └── User actions menu
│   │
│   ├── <ReportUserModal /> (existing)
│   │   └── Report user form
│   │
│   ├── <InviteModal />
│   │   ├── Email input
│   │   ├── Personal message textarea
│   │   ├── Send button
│   │   └── Pending invitations list
│   │
│   ├── <CompanionsModal />
│   │   ├── Search input
│   │   └── Companions list with Connect buttons
│   │
│   ├── <GroupChatModal /> (existing)
│   │   └── Create group form
│   │
│   └── <GroupChatEditModal /> (existing)
│       └── Edit group settings
│
└── REUSABLE COMPONENTS (to create)
    ├── <SearchBar /> (used in 5+ places)
    └── <AutocompleteDropdown /> (used in Country/Town lounges)
```

## Data Flow

```
Chat.jsx (Parent - Data Management)
    │
    ├── useChatState() hook
    │   └── All state variables
    │
    ├── Data Loading Functions
    │   ├── loadFriends()
    │   ├── loadGroupChats()
    │   ├── loadMessages()
    │   ├── loadPendingInvitations()
    │   └── ... (15+ functions)
    │
    ├── Action Functions
    │   ├── switchToTownChat()
    │   ├── switchToGroupChat()
    │   ├── sendFriendRequest()
    │   ├── handleSendMessage()
    │   └── ... (20+ functions)
    │
    ├── useEffect Hooks
    │   ├── Load initial data
    │   ├── Real-time subscriptions
    │   ├── Mark threads as read
    │   └── Scroll management
    │
    └── Props Distribution
        │
        ├── To Tabs (state + functions)
        ├── To ChatMessagesArea (state + functions)
        └── To Modals (state + functions)
```

## Component Props Interface

### LobbyTab / FavoritesTab
```javascript
{
  // State
  chatFavorites: array,
  favoritesSearchTerm: string,
  friends: array,
  groupChats: array,
  allTowns: array,

  // Setters
  setFavoritesSearchTerm: function,

  // Actions
  toggleFavoriteChat: function,
  switchToFriendChat: function,
  switchToGroupChat: function,
  switchToTownChat: function,
  setSelectedCountry: function,
}
```

### LoungesTab
```javascript
{
  // State
  loungeView: string|null,
  selectedCountry: string|null,
  loungesSearchTerm: string,
  townLoungeSearchTerm: string,
  unreadByType: object,
  chatType: string,
  allCountries: array,
  allTowns: array,
  favorites: array,
  countryLikes: array,
  showCountryAutocomplete: boolean,
  showTownAutocomplete: boolean,
  countryDropdownPos: object,
  townDropdownPos: object,

  // Refs
  countrySearchRef: ref,
  countryInputRef: ref,
  townSearchRef: ref,
  townInputRef: ref,

  // Setters
  setLoungeView: function,
  setSelectedCountry: function,
  setLoungesSearchTerm: function,
  setTownLoungeSearchTerm: function,
  setShowCountryAutocomplete: function,
  setShowTownAutocomplete: function,
  setCountryDropdownPos: function,
  setTownDropdownPos: function,
  setFavorites: function,

  // Actions
  switchToLoungeChat: function,
  switchToTownChat: function,
  toggleCountryLike: function,

  // External
  user: object,
  toggleFavorite: function (from townUtils),
  fetchFavorites: function (from townUtils),
}
```

### GroupsTab
```javascript
{
  // State
  groupsSearchTerm: string,
  groupChats: array,
  chatType: string,
  activeGroupChat: object|null,
  unreadCounts: object,
  user: object,

  // Setters
  setGroupsSearchTerm: function,
  setShowGroupChatModal: function,

  // Actions
  switchToGroupChat: function,
}
```

### FriendsTab
```javascript
{
  // State
  friendsSearchTerm: string,
  likedMembers: array,
  friends: array,
  chatType: string,
  activeFriend: object|null,
  unreadByFriend: object,

  // Setters
  setFriendsSearchTerm: function,
  setShowInviteModal: function,

  // Actions
  switchToFriendChat: function,
  toggleLikeMember: function,
}
```

### ChatMessagesArea
```javascript
{
  // State
  chatType: string,
  activeGroupChat: object|null,
  messages: array,
  showMutedMessages: boolean,
  mutedUsers: array,
  blockedUsers: array,
  user: object,
  messageInput: string,
  activeTown: object|null,
  activeFriend: object|null,
  isTyping: boolean,

  // Refs
  messagesEndRef: ref,

  // Setters
  setShowGroupEditModal: function,
  setSelectedUser: function,
  setShowMutedMessages: function,
  setMessageInput: function,

  // Actions
  deleteMessage: function,
  handlePinMessage: function,
  handleSendMessage: function,
  formatMessageDate: function,
}
```

### InviteModal
```javascript
{
  // State
  isOpen: boolean,
  inviteEmail: string,
  inviteMessage: string,
  inviteLoading: boolean,
  pendingInvitations: object,

  // Setters
  setInviteEmail: function,
  setInviteMessage: function,

  // Actions
  onClose: function,
  sendInviteByEmail: function,
  cancelSentInvitation: function,
}
```

### CompanionsModal
```javascript
{
  // State
  isOpen: boolean,
  companions: array,
  user: object,

  // Setters
  setCompanions: function,

  // Actions
  onClose: function,
  sendFriendRequest: function,
  loadSuggestedCompanions: function,
}
```

### MobileActionSheet
```javascript
{
  // State
  isOpen: boolean,
  isMobile: boolean,

  // Actions
  onClose: function,
  setShowInviteModal: function,
  setShowGroupChatModal: function,
}
```

## Size Reduction Estimate

| File | Current Lines | Proposed Lines | Reduction |
|------|--------------|----------------|-----------|
| Chat.jsx | 3,714 | 800-1,000 | 73% |
| LobbyTab | - | 100 | new |
| LoungesTab | - | 150 | new |
| CountryLoungeView | - | 150 | new |
| TownLoungeView | - | 180 | new |
| GroupsTab | - | 120 | new |
| FriendsTab | - | 140 | new |
| ChatMessagesArea | - | 200 | new |
| MessageList | - | 150 | new |
| MessageItem | - | 100 | new |
| MessageInput | - | 80 | new |
| GroupChatHeader | - | 40 | new |
| InviteModal | - | 150 | new |
| CompanionsModal | - | 100 | new |
| MobileActionSheet | - | 100 | new |
| SearchBar | - | 40 | new |
| AutocompleteDropdown | - | 80 | new |
| **TOTAL** | **3,714** | **2,680** | **28%** |

Note: Total lines increase due to import statements, prop destructuring, and better organization, but each individual file is much smaller and more maintainable.

## Migration Checklist

### Phase 1: Modals (Low Risk)
- [ ] Extract InviteModal
- [ ] Extract CompanionsModal
- [ ] Extract MobileActionSheet
- [ ] Test modals work independently
- [ ] Run Playwright tests

### Phase 2: Simple Tabs (Medium Risk)
- [ ] Extract GroupsTab
- [ ] Extract FriendsTab
- [ ] Extract LobbyTab/FavoritesTab (consolidate)
- [ ] Test tabs work independently
- [ ] Run Playwright tests

### Phase 3: Complex Tab (Higher Risk)
- [ ] Extract CountryLoungeView
- [ ] Extract TownLoungeView
- [ ] Extract LoungesTab (wrapper)
- [ ] Test lounge views with autocomplete
- [ ] Run Playwright tests

### Phase 4: Messages Area (Highest Risk)
- [ ] Extract MessageInput
- [ ] Extract MessageItem
- [ ] Extract GroupChatHeader
- [ ] Extract MessageList
- [ ] Extract ChatMessagesArea (wrapper)
- [ ] Test real-time messaging
- [ ] Test message deletion/pinning
- [ ] Run Playwright tests

### Phase 5: Reusable Components
- [ ] Extract SearchBar
- [ ] Extract AutocompleteDropdown
- [ ] Replace all inline instances
- [ ] Run Playwright tests

### Phase 6: Final Cleanup
- [ ] Remove unused state from Chat.jsx
- [ ] Optimize prop passing
- [ ] Add PropTypes or TypeScript
- [ ] Performance audit with React DevTools
- [ ] Final Playwright test suite
