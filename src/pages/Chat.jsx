import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Home, Users, User, MapPin, UserPlus, Star } from 'lucide-react';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites } from '../utils/townUtils.jsx';
import { formatMessageDate, getAIResponse } from '../utils/chatUtils';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import UserActionSheet from '../components/UserActionSheet';
import ReportUserModal from '../components/ReportUserModal';
import GroupChatModal from '../components/GroupChatModal';
import GroupChatEditModal from '../components/GroupChatEditModal';
import InviteModal from '../components/chat/InviteModal';
import CompanionsModal from '../components/chat/CompanionsModal';
import LobbyTab from '../components/chat/LobbyTab';
import LoungesTab from '../components/chat/LoungesTab';
import GroupsTab from '../components/chat/GroupsTab';
import FriendsTab from '../components/chat/FriendsTab';
import FavoritesTab from '../components/chat/FavoritesTab';
import ChatArea from '../components/chat/ChatArea';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { useModerationActions } from '../hooks/useModerationActions';
import { useIsMobile } from '../hooks/useMobileDetection';
import { useChatState } from '../hooks/useChatState';
import { useChatActions } from '../hooks/useChatActions';
import { useChatDataLoaders } from '../hooks/useChatDataLoaders';
import { useChatSubscriptions } from '../hooks/useChatSubscriptions';
import { useInvitationHandlers } from '../hooks/useInvitationHandlers.jsx';
import { useChatToggles } from '../hooks/useChatToggles';
import { useUserActions } from '../hooks/useUserActions';

export default function Chat() {
  // Extract all state management to custom hook
  const chatState = useChatState();
  const {
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
    unreadCounts, setUnreadCounts,
    unreadByType, setUnreadByType,
    unreadByFriend, setUnreadByFriend,
    chatType, setChatType,
    isTyping, setIsTyping,
    showCompanionsModal, setShowCompanionsModal,
    showGroupChatModal, setShowGroupChatModal,
    showGroupEditModal, setShowGroupEditModal,
    showInviteModal, setShowInviteModal,
    showReportModal, setShowReportModal,
    companions, setCompanions,
    friends, setFriends,
    activeFriend, setActiveFriend,
    friendsTabActive, setFriendsTabActive,
    groupChats, setGroupChats,
    activeGroupChat, setActiveGroupChat,
    pendingInvitations, setPendingInvitations,
    inviteEmail, setInviteEmail,
    inviteMessage, setInviteMessage,
    inviteLoading, setInviteLoading,
    defaultInviteMessage,
    selectedUser, setSelectedUser,
    mutedUsers, setMutedUsers,
    blockedUsers, setBlockedUsers,
    showMutedMessages, setShowMutedMessages,
    userToReport, setUserToReport,
    chatSearchTerm, setChatSearchTerm,
    filterChatType, setFilterChatType,
    filterCountry, setFilterCountry,
    loungesSearchTerm, setLoungesSearchTerm,
    townLoungeSearchTerm, setTownLoungeSearchTerm,
    groupsSearchTerm, setGroupsSearchTerm,
    friendsSearchTerm, setFriendsSearchTerm,
    favoritesSearchTerm, setFavoritesSearchTerm,
    showChatList, setShowChatList,
    showMobileActions, setShowMobileActions,
    activeTab, setActiveTab,
    loungeView, setLoungeView,
    selectedCountry, setSelectedCountry,
    allCountries, setAllCountries,
    allTowns, setAllTowns,
    userCountries, setUserCountries,
    likedMembers, setLikedMembers,
    chatFavorites, setChatFavorites,
    countryLikes, setCountryLikes,
    showCountryAutocomplete, setShowCountryAutocomplete,
    showTownAutocomplete, setShowTownAutocomplete,
    countryDropdownPos, setCountryDropdownPos,
    townDropdownPos, setTownDropdownPos,
    messagesEndRef,
    isInitialMount,
    countrySearchRef,
    countryInputRef,
    townSearchRef,
    townInputRef,
  } = chatState;

  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const { townId, groupId } = useParams();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');
  const tabParam = searchParams.get('tab');

  // Moderation actions hook
  const { deleteMessage: deleteMsgAction, pinMessage: pinMessageAction } = useModerationActions();

  // Data loaders hook - provides all data loading functions
  const dataLoaders = useChatDataLoaders();
  const {
    loadFriends: loadFriendsBase,
    loadGroupChats: loadGroupChatsBase,
    loadBlockedUsers: loadBlockedUsersBase,
    loadPendingInvitations: loadPendingInvitationsBase,
    loadSuggestedCompanions: loadSuggestedCompanionsBase,
    loadAllCountries: loadAllCountriesBase,
    loadUserCountries: loadUserCountriesBase,
    loadAllTowns: loadAllTownsBase,
    loadLikedMembers: loadLikedMembersBase,
    loadChatFavorites: loadChatFavoritesBase,
    loadCountryLikes: loadCountryLikesBase,
    loadUnreadCounts: loadUnreadCountsBase,
    markThreadAsRead: markThreadAsReadBase,
    loadMessages: loadMessagesBase
  } = dataLoaders;

  // Wrapper functions to handle state updates
  const loadFriends = (userId) => loadFriendsBase(userId, setFriends);
  const loadGroupChats = (userId) => loadGroupChatsBase(userId, setGroupChats, loadUnreadCounts);
  const loadBlockedUsers = () => loadBlockedUsersBase(setBlockedUsers);
  const loadPendingInvitations = (userId) => loadPendingInvitationsBase(userId, setPendingInvitations);
  const loadSuggestedCompanions = (userId) => loadSuggestedCompanionsBase(userId, setCompanions);
  const loadAllCountries = () => loadAllCountriesBase(setAllCountries);
  const loadUserCountries = (userFavorites) => loadUserCountriesBase(userFavorites, setUserCountries);
  const loadAllTowns = () => loadAllTownsBase(setAllTowns);
  const loadLikedMembers = (userId) => loadLikedMembersBase(userId, setLikedMembers);
  const loadChatFavorites = (userId) => loadChatFavoritesBase(userId, setChatFavorites);
  const loadCountryLikes = (userId) => loadCountryLikesBase(userId, setCountryLikes);
  const loadUnreadCounts = (threads) => loadUnreadCountsBase(threads, user, setUnreadCounts, setUnreadByType, setUnreadByFriend);
  const markThreadAsRead = (threadId) => markThreadAsReadBase(threadId, setUnreadCounts);
  const loadMessages = (threadId) => loadMessagesBase(threadId, markThreadAsRead, setMessages);

  // Invitation handlers hook
  const invitationHandlers = useInvitationHandlers({
    user,
    loadPendingInvitations,
    loadFriends,
    setFriendsTabActive
  });
  const {
    sendInviteByEmail: sendInviteByEmailBase,
    acceptInvitation,
    declineInvitation,
    cancelSentInvitation: cancelSentInvitationBase,
    sendFriendRequest: sendFriendRequestBase
  } = invitationHandlers;

  // Wrapper functions for invitation handlers
  const sendInviteByEmail = (email) => sendInviteByEmailBase(
    email,
    inviteMessage,
    setInviteLoading,
    setShowInviteModal,
    setInviteEmail,
    setInviteMessage
  );
  const cancelSentInvitation = (connectionId) => cancelSentInvitationBase(
    connectionId,
    pendingInvitations,
    setPendingInvitations
  );
  const sendFriendRequest = (targetUserId) => sendFriendRequestBase(
    targetUserId,
    setShowCompanionsModal,
    loadSuggestedCompanions
  );

  // Chat toggles hook
  const toggles = useChatToggles({
    user,
    loadCountryLikes,
    loadChatFavorites
  });
  const {
    toggleCountryLike,
    toggleFavoriteChat,
    handleCreateGroup: handleCreateGroupBase
  } = toggles;

  // Wrapper for handleCreateGroup with proper parameters
  const handleCreateGroup = async ({ name, category, geographicScope, memberIds, createdBy, isPublic, groupType, invitePolicy, discoverability, groupImageUrl }) => {
    try {
      // Validate Sensitive Private permission
      if (groupType === 'sensitive_private') {
        const { canCreateSensitiveGroups } = await import('../utils/accountTiers');
        if (!canCreateSensitiveGroups(user)) {
          toast.error('Premium tier or higher required to create Sensitive Private groups');
          throw new Error('Insufficient permissions for Sensitive Private groups');
        }
      }

      // Create a new thread for the group chat
      const { data: newThread, error: threadError} = await supabase
        .from('chat_threads')
        .insert([{
          topic: name,
          created_by: createdBy,
          is_group: true,
          is_public: isPublic ?? true,
          category: category,
          geo_region: geographicScope?.region || null,
          geo_country: geographicScope?.country || null,
          geo_province: geographicScope?.province || null,
          group_type: groupType || 'public',
          invite_policy: invitePolicy || 'all_members',
          discoverability: discoverability || (isPublic ? 'searchable' : 'link_only'),
          succession_enabled: groupType !== 'sensitive_private',
          group_image_url: groupImageUrl || null
        }])
        .select()
        .single();

      if (threadError) {
        console.error('Thread creation error:', threadError);
        toast.error(`Database error: ${threadError.message}`);
        throw threadError;
      }

      // Add all selected members to the group
      const groupMembers = memberIds.map(friendId => ({
        thread_id: newThread.id,
        user_id: friendId,
        role: 'member',
        joined_at: new Date().toISOString()
      }));

      // Also add the creator as creator role
      groupMembers.push({
        thread_id: newThread.id,
        user_id: createdBy,
        role: 'creator',
        joined_at: new Date().toISOString()
      });

      const { error: membersError } = await supabase
        .from('group_chat_members')
        .insert(groupMembers);

      if (membersError) {
        console.error('Members insertion error:', membersError);
        toast.error(`Failed to add members: ${membersError.message}`);
        throw membersError;
      }

      toast.success(`Group "${name}" created!`);

      // Switch to the new group chat
      setActiveThread(newThread);
      setActiveGroupChat(newThread);
      setChatType('group');
      await loadGroupChats(createdBy);
      await loadMessages(newThread.id);

    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error(`Failed to create group: ${error.message}`);
      throw error;
    }
  };

  // Load companions when modal opens
  useEffect(() => {
    if (showCompanionsModal && user) {
      loadSuggestedCompanions(user.id);
    }
  }, [showCompanionsModal, user]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const perfStart = performance.now();
        console.log('🚀 [PERF] Chat load started');
        setLoading(true);

        // Get current user
        const t1 = performance.now();
        const { user: currentUser, profile: userProfile } = await getCurrentUser();
        console.log(`⏱️ [PERF] getCurrentUser: ${(performance.now() - t1).toFixed(0)}ms`);
        if (!currentUser) {
          navigate('/welcome');
          return;
        }

        setUser({ ...currentUser, ...userProfile });

        // CRITICAL PATH ONLY: Load threads immediately to show UI
        const t2 = performance.now();
        const { data: threadData, error: threadError } = await supabase
          .from('chat_threads')
          .select('*')
          .order('created_at', { ascending: false });

        if (threadError) {
          console.error("Thread fetch error:", threadError);
          toast.error("Failed to load chat threads");
        }

        setThreads(threadData || []);
        console.log(`⏱️ [PERF] Load threads: ${(performance.now() - t2).toFixed(0)}ms`);

        // Show UI NOW - don't wait for anything else
        setLoading(false);
        console.log(`🎯 [PERF] UI VISIBLE: ${(performance.now() - perfStart).toFixed(0)}ms`);

        // Load everything else in parallel (doesn't block rendering)
        const t3 = performance.now();
        const [
          favResult,
          _friends,
          _groups,
          _invites,
          _blocked,
          _companions,
          _hometown,
          _countries,
          _towns,
          _likes,
          _favorites
        ] = await Promise.all([
          fetchFavorites(currentUser.id),
          loadFriends(currentUser.id),
          loadGroupChats(currentUser.id),
          loadPendingInvitations(currentUser.id),
          loadBlockedUsers(),
          loadSuggestedCompanions(currentUser.id),
          userProfile?.hometown ? (async () => {
            const cityName = userProfile.hometown.split(',')[0].trim();
            const { data } = await supabase
              .from('towns')
              .select('id, name, country, region')
              .ilike('name', cityName)
              .limit(1);
            if (data?.[0]) setUserHomeTown(data[0]);
          })() : Promise.resolve(),
          loadAllCountries(),
          loadAllTowns(),
          loadLikedMembers(currentUser.id),
          loadChatFavorites(currentUser.id),
          loadCountryLikes(currentUser.id)
        ]);

        const { success: favSuccess, favorites: userFavorites } = favResult;
        if (favSuccess) {
          setFavorites(userFavorites);
          // Load user's countries from favorited towns
          await loadUserCountries(userFavorites);
        }
        console.log(`⏱️ [PERF] Parallel loads: ${(performance.now() - t3).toFixed(0)}ms`);

        // Town activity & unread counts (nice-to-have, loads in background)
        const t4 = performance.now();
        const townThreads = (threadData || []).filter(t => t.town_id !== null);
        let townIdsWithActivity = [];

        if (townThreads.length > 0) {
          const threadIds = townThreads.map(t => t.id);
          const { data: activeThreads } = await supabase.rpc('get_threads_with_recent_activity', {
            p_thread_ids: threadIds,
            p_days_ago: 30
          });

          if (activeThreads) {
            const activeThreadIdSet = new Set(activeThreads.map(t => t.thread_id));
            townIdsWithActivity = townThreads
              .filter(t => activeThreadIdSet.has(t.id))
              .map(t => t.town_id);
          }
        }

        const allActiveTownIds = [...new Set([
          ...(userFavorites || []).map(f => f.town_id),
          ...townIdsWithActivity
        ])];

        if (allActiveTownIds.length > 0) {
          const { success: townSuccess, towns: activeTowns } = await fetchTowns({
            townIds: allActiveTownIds
          });

          if (townSuccess) {
            const activeTownChatsData = activeTowns.map(town => {
              const thread = townThreads.find(t => t.town_id === town.id);
              return {
                town_id: town.id,
                thread_id: thread?.id,
                towns: town,
                is_favorited: (userFavorites || []).some(f => f.town_id === town.id)
              };
            });

            activeTownChatsData.sort((a, b) => {
              if (a.is_favorited && !b.is_favorited) return -1;
              if (!a.is_favorited && b.is_favorited) return 1;
              return a.towns.name.localeCompare(b.towns.name);
            });

            setActiveTownChats(activeTownChatsData);
          }
        }

        // Unread counts load last (slowest, least important)
        if (townThreads.length > 0) {
          await loadUnreadCounts(townThreads);
        }
        console.log(`⏱️ [PERF] Towns+badges: ${(performance.now() - t4).toFixed(0)}ms`);
        console.log(`🏁 [PERF] TOTAL: ${(performance.now() - perfStart).toFixed(0)}ms`);

        // Tab switching
        if (tabParam === 'requests') {
          setFriendsTabActive('requests');
        }

        // If groupId is provided, load that group chat
        if (groupId) {
          // Group chats are already loaded by loadGroupChats above
          // Wait a bit for state to update, then find the group
          // Better approach: query directly
          const { data: groupData, error: groupError } = await supabase
            .from('chat_threads')
            .select('id, topic, is_group, is_public, category, geo_region, geo_country, geo_province, created_by, created_at')
            .eq('id', groupId)
            .single();

          if (groupError || !groupData) {
            console.error("Group chat not found:", groupId, groupError);
            toast.error("Group chat not found");
            navigate('/chat', { replace: true });
          } else {
            // Check if user is a member
            const { data: memberCheck } = await supabase
              .from('group_chat_members')
              .select('role')
              .eq('thread_id', groupId)
              .eq('user_id', currentUser.id)
              .single();

            if (!memberCheck) {
              toast.error("You are not a member of this group");
              navigate('/chat', { replace: true });
            } else {
              setActiveGroupChat(groupData);
              setChatType('group');
              setActiveThread(groupData);
              await loadMessages(groupData.id);
            }
          }
        } else if (townId) {
          // Get town data
          const { success, towns } = await fetchTowns({ townIds: [townId] });

          if (success && towns.length > 0) {
            setActiveTown(towns[0]);
            setChatType('town');

            // Find or create thread for this town
            let townThread = threadData?.find(thread => thread.town_id === townId);

            if (!townThread) {
              // Create new thread for this town
              const { data: newThread, error: createError } = await supabase
                .from('chat_threads')
                .insert([{
                  town_id: townId,
                  topic: towns[0].name,
                  created_by: currentUser.id
                }])
                .select();

              if (createError) {
                console.error("Create thread error:", createError);
                toast.error("Failed to create chat thread");
              } else {
                townThread = newThread[0];
                setThreads(prev => [townThread, ...prev]);
              }
            }

            if (townThread) {
              setActiveThread(townThread);
              await loadMessages(townThread.id);
            }
          }
        } else {
          // Default to lounge chat if no town or group specified
          setChatType('lounge');

          // Find or create lounge thread
          let loungeThread = threadData?.find(thread => thread.town_id === null && thread.topic === 'Lounge');

          if (!loungeThread) {
            // Create lounge thread
            const { data: newThread, error: createError } = await supabase
              .from('chat_threads')
              .insert([{
                town_id: null,
                topic: 'Lounge',
                created_by: currentUser.id
              }])
              .select();

            if (createError) {
              console.error("Create lounge error:", createError);
              toast.error("Failed to create lounge chat");
            } else {
              loungeThread = newThread[0];
              setThreads(prev => [loungeThread, ...prev]);
            }
          }

          if (loungeThread) {
            setActiveThread(loungeThread);
            await loadMessages(loungeThread.id);
          }
        }
      } catch (err) {
        console.error("Error loading chat data:", err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, townId, groupId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  // invitationId and pendingInvitations.received are handled within loadData

  // Mark thread as read when user opens it
  useEffect(() => {
    if (activeThread && user) {
      markThreadAsRead(activeThread.id);
    }
  }, [activeThread, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time subscriptions
  useChatSubscriptions({
    user,
    threads,
    activeThread,
    loadUnreadCounts,
    setMessages,
    messagesEndRef,
    isInitialMount
  });

  // Handle click outside autocomplete to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countrySearchRef.current && !countrySearchRef.current.contains(event.target)) {
        setShowCountryAutocomplete(false);
      }
      if (townSearchRef.current && !townSearchRef.current.contains(event.target)) {
        setShowTownAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Use chat actions hook
  const { switchToTownChat, switchToLoungeChat, switchToCountryLoungeChat, switchToGroupChat, switchToFriendChat, handleSendMessage } = useChatActions({
    user,
    threads,
    setThreads,
    setActiveTown,
    setChatType,
    setMessages,
    setActiveThread,
    setActiveGroupChat,
    setActiveFriend,
    setShowChatList,
    messageInput,
    setMessageInput,
    activeThread,
    chatType,
    isTyping,
    setIsTyping,
    isMobile,
    loadMessages,
    markThreadAsRead,
    getAIResponse
  });

  // User actions hook - handles all user interactions
  const userActions = useUserActions({
    user,
    friends,
    mutedUsers,
    setMutedUsers,
    blockedUsers,
    setBlockedUsers,
    likedMembers,
    setMessages,
    setActiveFriend,
    setChatType,
    setUserToReport,
    setShowReportModal,
    selectedUser,
    navigate,
    loadLikedMembers,
    sendFriendRequest,
    deleteMsgAction,
    pinMessageAction
  });
  const { toggleLikeMember, handleUserAction, toggleMute, blockUser, unblockUser, deleteMessage, handlePinMessage } = userActions;

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.background}`}>
        <UnifiedHeader
          currentPage="chat"
          user={user}
          tabs={[
            { id: 'lobby', label: 'Lobby', icon: Home, isActive: false, onClick: () => {} },
            { id: 'lounges', label: 'Lounges', icon: Users, isActive: false, onClick: () => {} },
            { id: 'groups', label: 'Groups', icon: Users, isActive: false, onClick: () => {} },
            { id: 'friends', label: 'Friends', icon: User, isActive: false, onClick: () => {} },
            { id: 'favorites', label: 'Favorites', icon: Star, isActive: false, onClick: () => {} }
          ]}
        />
        <HeaderSpacer hasFilters={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scout-accent-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.background}`}>
      <UnifiedHeader
        currentPage="chat"
        user={user}
        tabs={[
          {
            id: 'lobby',
            label: 'Lobby',
            icon: Home,
            isActive: activeTab === 'lobby',
            onClick: () => {
              if (isMobile && activeTab === 'lobby' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('lobby');
              }
            }
          },
          {
            id: 'lounges',
            label: 'Lounges',
            icon: Users,
            badge: unreadByType.lounge > 0 ? unreadByType.lounge : null,
            isActive: activeTab === 'lounges',
            onClick: () => {
              if (isMobile && activeTab === 'lounges' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('lounges');
                setLoungeView(null);
              }
            }
          },
          {
            id: 'groups',
            label: 'Groups',
            icon: Users,
            isActive: activeTab === 'groups',
            onClick: () => {
              if (isMobile && activeTab === 'groups' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('groups');
              }
            }
          },
          {
            id: 'friends',
            label: 'Friends',
            icon: User,
            badge: unreadByType.friends > 0 ? unreadByType.friends : null,
            isActive: activeTab === 'friends',
            onClick: () => {
              if (isMobile && activeTab === 'friends' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('friends');
              }
            }
          },
          {
            id: 'favorites',
            label: 'Favorites',
            icon: Star,
            isActive: activeTab === 'favorites',
            onClick: () => {
              if (isMobile && activeTab === 'favorites' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('favorites');
              }
            }
          }
        ]}
      />

      <UnifiedErrorBoundary variant="compact"
        fallbackTitle="Chat Error"
        fallbackMessage="We're having trouble loading the chat. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        {/* Spacer for fixed header with tabs row */}
        <HeaderSpacer hasFilters={true} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

          {/* Tab-Based Content - Conditional on mobile */}
          {(showChatList || !isMobile) && (
          <div className="w-full md:w-64 space-y-4">

            {/* ========== LOBBY TAB ========== */}
            {activeTab === 'lobby' && (
              <LobbyTab
                favoritesSearchTerm={favoritesSearchTerm}
                setFavoritesSearchTerm={setFavoritesSearchTerm}
                chatFavorites={chatFavorites}
                friends={friends}
                groupChats={groupChats}
                allTowns={allTowns}
                setSelectedCountry={setSelectedCountry}
                onSwitchToFriendChat={switchToFriendChat}
                onSwitchToGroupChat={switchToGroupChat}
                onSwitchToTownChat={switchToTownChat}
                onToggleFavoriteChat={toggleFavoriteChat}
              />
            )}
            {/* ========== END LOBBY TAB ========== */}

            {/* ========== LOUNGES TAB ========== */}
            {activeTab === 'lounges' && (
              <LoungesTab
                user={user}
                loungeView={loungeView}
                setLoungeView={setLoungeView}
                chatType={chatType}
                activeThread={activeThread}
                activeTown={activeTown}
                unreadByType={unreadByType}
                countryLikes={countryLikes}
                favorites={favorites}
                allCountries={allCountries}
                allTowns={allTowns}
                loungesSearchTerm={loungesSearchTerm}
                setLoungesSearchTerm={setLoungesSearchTerm}
                townLoungeSearchTerm={townLoungeSearchTerm}
                setTownLoungeSearchTerm={setTownLoungeSearchTerm}
                showCountryAutocomplete={showCountryAutocomplete}
                setShowCountryAutocomplete={setShowCountryAutocomplete}
                showTownAutocomplete={showTownAutocomplete}
                setShowTownAutocomplete={setShowTownAutocomplete}
                countryDropdownPos={countryDropdownPos}
                setCountryDropdownPos={setCountryDropdownPos}
                townDropdownPos={townDropdownPos}
                setTownDropdownPos={setTownDropdownPos}
                countrySearchRef={countrySearchRef}
                countryInputRef={countryInputRef}
                townSearchRef={townSearchRef}
                townInputRef={townInputRef}
                setSelectedCountry={setSelectedCountry}
                setFavorites={setFavorites}
                onSwitchToLoungeChat={switchToLoungeChat}
                onSwitchToCountryLoungeChat={switchToCountryLoungeChat}
                onSwitchToTownChat={switchToTownChat}
                onToggleCountryLike={toggleCountryLike}
              />
            )}
            {/* ========== END LOUNGES TAB ========== */}

            {/* ========== GROUPS TAB ========== */}
            {activeTab === 'groups' && (
              <GroupsTab
                user={user}
                groupsSearchTerm={groupsSearchTerm}
                setGroupsSearchTerm={setGroupsSearchTerm}
                groupChats={groupChats}
                chatType={chatType}
                activeGroupChat={activeGroupChat}
                unreadCounts={unreadCounts}
                setShowGroupChatModal={setShowGroupChatModal}
                onSwitchToGroupChat={switchToGroupChat}
              />
            )}
            {/* ========== END GROUPS TAB ========== */}

            {/* ========== FRIENDS TAB ========== */}
            {activeTab === 'friends' && (
              <FriendsTab
                friendsSearchTerm={friendsSearchTerm}
                setFriendsSearchTerm={setFriendsSearchTerm}
                likedMembers={likedMembers}
                friends={friends}
                chatType={chatType}
                activeFriend={activeFriend}
                unreadByFriend={unreadByFriend}
                setShowInviteModal={setShowInviteModal}
                onSwitchToFriendChat={switchToFriendChat}
                onToggleLikeMember={toggleLikeMember}
              />
            )}
            {/* ========== END FRIENDS TAB ========== */}

            {/* ========== FAVORITES TAB ========== */}
            {activeTab === 'favorites' && (
              <FavoritesTab
                favoritesSearchTerm={favoritesSearchTerm}
                setFavoritesSearchTerm={setFavoritesSearchTerm}
                chatFavorites={chatFavorites}
                friends={friends}
                groupChats={groupChats}
                allTowns={allTowns}
                onSwitchToFriendChat={switchToFriendChat}
                onSwitchToGroupChat={switchToGroupChat}
                onSwitchToTownChat={switchToTownChat}
                onToggleFavoriteChat={toggleFavoriteChat}
                setSelectedCountry={setSelectedCountry}
              />
            )}
            {/* ========== END FAVORITES TAB ========== */}

          </div>
          )}

          {/* Chat area - Desktop (always) + Mobile (when chat selected) */}
          {(!isMobile || !showChatList) && (
            <ChatArea
              chatType={chatType}
              activeGroupChat={activeGroupChat}
              activeThread={activeThread}
              messages={messages}
              user={user}
              isTyping={isTyping}
              activeTown={activeTown}
              activeFriend={activeFriend}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              mutedUsers={mutedUsers}
              blockedUsers={blockedUsers}
              showMutedMessages={showMutedMessages}
              setShowMutedMessages={setShowMutedMessages}
              messagesEndRef={messagesEndRef}
              setShowGroupEditModal={setShowGroupEditModal}
              onSendMessage={handleSendMessage}
              onDeleteMessage={deleteMessage}
              onPinMessage={handlePinMessage}
              setSelectedUser={setSelectedUser}
              formatMessageDate={formatMessageDate}
            />
          )}
        </div>
        </main>
      </UnifiedErrorBoundary>

      {/* Bottom navigation for mobile */}

      {/* MOBILE: Action Sheet (Bottom Sheet) */}
      {isMobile && showMobileActions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowMobileActions(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <div className={`fixed left-0 right-0 bottom-0 z-50 ${uiConfig.colors.card} rounded-t-3xl ${uiConfig.layout.shadow.xl} transition-transform duration-300 transform translate-y-0`}>
            {/* Handle Indicator */}
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-8 space-y-2">
              {/* Invite a Friend */}
              <button
                onClick={() => {
                  setShowMobileActions(false);
                  setShowInviteModal(true);
                }}
                className={`w-full flex items-center gap-4 p-4 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} ${uiConfig.animation.transition} active:scale-98`}
              >
                <div className={`w-12 h-12 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                  <UserPlus className="h-6 w-6 text-scout-accent-600 dark:text-scout-accent-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                    Invite a Friend
                  </div>
                  <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                    Connect with someone you know
                  </div>
                </div>
              </button>

              {/* Create Group Chat */}
              <button
                onClick={() => {
                  setShowMobileActions(false);
                  setShowGroupChatModal(true);
                }}
                className={`w-full flex items-center gap-4 p-4 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} ${uiConfig.animation.transition} active:scale-98`}
              >
                <div className={`w-12 h-12 bg-purple-100 dark:bg-purple-900/30 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                    Create Group Chat
                  </div>
                  <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                    Start a new group conversation
                  </div>
                </div>
              </button>

              {/* Browse Towns */}
              <a
                href="/discover"
                onClick={() => setShowMobileActions(false)}
                className={`w-full flex items-center gap-4 p-4 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} ${uiConfig.animation.transition} active:scale-98 block`}
              >
                <div className={`w-12 h-12 bg-green-100 dark:bg-green-900/30 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                    Browse Towns
                  </div>
                  <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                    Discover retirement destinations
                  </div>
                </div>
              </a>

              {/* Cancel Button */}
              <button
                onClick={() => setShowMobileActions(false)}
                className={`w-full p-4 ${uiConfig.layout.radius.lg} ${uiConfig.colors.btnSecondary} ${uiConfig.font.weight.semibold} ${uiConfig.animation.transition} active:scale-98 mt-2`}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Action Sheet */}
      {selectedUser && (
        <UserActionSheet
          userId={selectedUser.id}
          username={selectedUser.name}
          currentUserId={user?.id}
          isFriend={friends.some(f => f.friend_id === selectedUser.id)}
          isBlocked={blockedUsers.includes(selectedUser.id)}
          isMuted={mutedUsers.includes(selectedUser.id)}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={handleUserAction}
        />
      )}

      {/* Report User Modal */}
      {userToReport && (
        <ReportUserModal
          userId={userToReport.id}
          username={userToReport.name}
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setUserToReport(null);
          }}
        />
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        inviteLoading={inviteLoading}
        pendingInvitations={pendingInvitations}
        onSendInvite={sendInviteByEmail}
        onCancelInvitation={cancelSentInvitation}
      />

      {/* Companions Modal */}
      <CompanionsModal
        isOpen={showCompanionsModal}
        onClose={() => setShowCompanionsModal(false)}
        companions={companions}
        setCompanions={setCompanions}
        user={user}
        onLoadSuggestedCompanions={loadSuggestedCompanions}
        onSendFriendRequest={sendFriendRequest}
      />

      {/* Group Chat Modal */}
      <GroupChatModal
        isOpen={showGroupChatModal}
        onClose={() => setShowGroupChatModal(false)}
        friends={friends}
        onCreateGroup={handleCreateGroup}
        currentUser={user}
      />

      {/* Group Chat Edit Modal */}
      <GroupChatEditModal
        isOpen={showGroupEditModal}
        onClose={() => setShowGroupEditModal(false)}
        groupChat={activeGroupChat}
        currentUser={user}
        friends={friends}
        onUpdate={() => user && loadGroupChats(user.id)}
      />
    </div>
  );
}
