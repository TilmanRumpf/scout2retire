import { useState, useRef } from 'react';

/**
 * Custom hook to manage all chat-related state
 * Extracted from Chat.jsx to reduce component complexity
 */
export function useChatState() {
  // Core chat state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userHomeTown, setUserHomeTown] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeTownChats, setActiveTownChats] = useState([]);

  // Unread counts
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unreadByType, setUnreadByType] = useState({ lounge: 0, friends: 0, towns: 0 });
  const [unreadByFriend, setUnreadByFriend] = useState({});

  // Chat type and UI state
  const [chatType, setChatType] = useState('town');
  const [isTyping, setIsTyping] = useState(false);

  // Modal states
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [showGroupEditModal, setShowGroupEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Social features
  const [companions, setCompanions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friendsTabActive, setFriendsTabActive] = useState('friends');
  const [groupChats, setGroupChats] = useState([]);
  const [activeGroupChat, setActiveGroupChat] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState({ sent: [], received: [] });

  // Invitation state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const defaultInviteMessage = "Hi! I'm using Scout2Retire to plan my retirement. I've been exploring different retirement destinations and would love to connect with you to share ideas and experiences. Maybe we can help each other find the perfect place to enjoy our next chapter!\n\nLooking forward to chatting with you about our retirement plans.";

  // User moderation state
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutedUsers, setMutedUsers] = useState(() => {
    const stored = localStorage.getItem('mutedUsers');
    return stored ? JSON.parse(stored) : [];
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showMutedMessages, setShowMutedMessages] = useState(false);
  const [userToReport, setUserToReport] = useState(null);

  // Search and filter state
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [filterChatType, setFilterChatType] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');

  // Tab-specific search state
  const [loungesSearchTerm, setLoungesSearchTerm] = useState('');
  const [townLoungeSearchTerm, setTownLoungeSearchTerm] = useState('');
  const [groupsSearchTerm, setGroupsSearchTerm] = useState('');
  const [friendsSearchTerm, setFriendsSearchTerm] = useState('');
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');

  // Mobile state
  const [showChatList, setShowChatList] = useState(true);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('lobby');
  const [loungeView, setLoungeView] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Auto-generated lists
  const [allCountries, setAllCountries] = useState([]);
  const [allTowns, setAllTowns] = useState([]);
  const [userCountries, setUserCountries] = useState([]);

  // Likes & Favorites
  const [likedMembers, setLikedMembers] = useState([]);
  const [chatFavorites, setChatFavorites] = useState([]);
  const [countryLikes, setCountryLikes] = useState([]);
  const [showCountryAutocomplete, setShowCountryAutocomplete] = useState(false);
  const [showTownAutocomplete, setShowTownAutocomplete] = useState(false);
  const [countryDropdownPos, setCountryDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [townDropdownPos, setTownDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Refs
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);
  const countrySearchRef = useRef(null);
  const countryInputRef = useRef(null);
  const townSearchRef = useRef(null);
  const townInputRef = useRef(null);

  return {
    // Core chat state
    loading, setLoading,
    user, setUser,
    userHomeTown, setUserHomeTown,
    threads, setThreads,
    activeTown, setActiveTown,
    activeThread, setActiveThread,
    messages, setMessages,
    messageInput, setMessageInput,
    favorites, setFavorites,
    activeTownChats, setActiveTownChats,

    // Unread counts
    unreadCounts, setUnreadCounts,
    unreadByType, setUnreadByType,
    unreadByFriend, setUnreadByFriend,

    // Chat type and UI
    chatType, setChatType,
    isTyping, setIsTyping,

    // Modals
    showCompanionsModal, setShowCompanionsModal,
    showGroupChatModal, setShowGroupChatModal,
    showGroupEditModal, setShowGroupEditModal,
    showInviteModal, setShowInviteModal,
    showReportModal, setShowReportModal,

    // Social features
    companions, setCompanions,
    friends, setFriends,
    activeFriend, setActiveFriend,
    friendsTabActive, setFriendsTabActive,
    groupChats, setGroupChats,
    activeGroupChat, setActiveGroupChat,
    pendingInvitations, setPendingInvitations,

    // Invitations
    inviteEmail, setInviteEmail,
    inviteMessage, setInviteMessage,
    inviteLoading, setInviteLoading,
    defaultInviteMessage,

    // User moderation
    selectedUser, setSelectedUser,
    mutedUsers, setMutedUsers,
    blockedUsers, setBlockedUsers,
    showMutedMessages, setShowMutedMessages,
    userToReport, setUserToReport,

    // Search and filters
    chatSearchTerm, setChatSearchTerm,
    filterChatType, setFilterChatType,
    filterCountry, setFilterCountry,
    loungesSearchTerm, setLoungesSearchTerm,
    townLoungeSearchTerm, setTownLoungeSearchTerm,
    groupsSearchTerm, setGroupsSearchTerm,
    friendsSearchTerm, setFriendsSearchTerm,
    favoritesSearchTerm, setFavoritesSearchTerm,

    // Mobile
    showChatList, setShowChatList,
    showMobileActions, setShowMobileActions,

    // Tab navigation
    activeTab, setActiveTab,
    loungeView, setLoungeView,
    selectedCountry, setSelectedCountry,

    // Auto-generated lists
    allCountries, setAllCountries,
    allTowns, setAllTowns,
    userCountries, setUserCountries,

    // Likes & Favorites
    likedMembers, setLikedMembers,
    chatFavorites, setChatFavorites,
    countryLikes, setCountryLikes,
    showCountryAutocomplete, setShowCountryAutocomplete,
    showTownAutocomplete, setShowTownAutocomplete,
    countryDropdownPos, setCountryDropdownPos,
    townDropdownPos, setTownDropdownPos,

    // Refs
    messagesEndRef,
    isInitialMount,
    countrySearchRef,
    countryInputRef,
    townSearchRef,
    townInputRef,
  };
}
