import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2, Home, Settings, Users, User, MapPin, Pin, ChevronLeft, Plus, Send, MoreVertical, Search, UserPlus, Heart, Star } from 'lucide-react';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { sanitizeChatMessage, MAX_LENGTHS, displaySafeContent } from '../utils/sanitizeUtils';
import { cancelInvitation } from '../utils/companionUtils';
import { sendInvitationEmailViaAuth } from '../utils/emailUtils';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import FriendsSection from '../components/FriendsSection';
import UserActionSheet from '../components/UserActionSheet';
import ReportUserModal from '../components/ReportUserModal';
import GroupChatModal from '../components/GroupChatModal';
import GroupChatEditModal from '../components/GroupChatEditModal';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { useModerationActions } from '../hooks/useModerationActions';
import { useIsMobile } from '../hooks/useMobileDetection';

export default function Chat() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userHomeTown, setUserHomeTown] = useState(null); // User's home town for chat
  const [threads, setThreads] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeTownChats, setActiveTownChats] = useState([]); // Towns with recent activity or favorited
  const [unreadCounts, setUnreadCounts] = useState({}); // { threadId: unreadCount }
  const [unreadByType, setUnreadByType] = useState({ lounge: 0, friends: 0, towns: 0 }); // Unread per chat type
  const [unreadByFriend, setUnreadByFriend] = useState({}); // { friend_id: unreadCount }
  const [chatType, setChatType] = useState('town'); // 'town', 'lounge', 'scout', 'friends'
  const [isTyping, setIsTyping] = useState(false);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [showGroupEditModal, setShowGroupEditModal] = useState(false);
  const [companions, setCompanions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friendsTabActive, setFriendsTabActive] = useState('friends'); // 'friends' or 'requests'
  const [groupChats, setGroupChats] = useState([]);
  const [activeGroupChat, setActiveGroupChat] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const defaultInviteMessage = "Hi! I'm using Scout2Retire to plan my retirement. I've been exploring different retirement destinations and would love to connect with you to share ideas and experiences. Maybe we can help each other find the perfect place to enjoy our next chapter!\n\nLooking forward to chatting with you about our retirement plans.";
  const [pendingInvitations, setPendingInvitations] = useState({ sent: [], received: [] });

  // User action sheet state
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutedUsers, setMutedUsers] = useState(() => {
    const stored = localStorage.getItem('mutedUsers');
    return stored ? JSON.parse(stored) : [];
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showMutedMessages, setShowMutedMessages] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userToReport, setUserToReport] = useState(null);

  // Chat search and filter state
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [filterChatType, setFilterChatType] = useState('all'); // 'all', 'towns', 'friends'
  const [filterCountry, setFilterCountry] = useState('all');

  // Tab-specific search state
  const [loungesSearchTerm, setLoungesSearchTerm] = useState(''); // Country lounge search
  const [townLoungeSearchTerm, setTownLoungeSearchTerm] = useState(''); // Town lounge search
  const [groupsSearchTerm, setGroupsSearchTerm] = useState('');
  const [friendsSearchTerm, setFriendsSearchTerm] = useState('');
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');

  // Mobile-specific state (Phase 1)
  const isMobile = useIsMobile(768); // Use existing mobile detection hook
  const [showChatList, setShowChatList] = useState(true); // true = list view, false = conversation view
  const [showMobileActions, setShowMobileActions] = useState(false); // For bottom action sheet

  // Tab navigation state (all screens)
  const [activeTab, setActiveTab] = useState('lobby'); // 'lobby'|'lounges'|'groups'|'friends'|'favorites'
  const [loungeView, setLoungeView] = useState(null); // null|'retirement'|'country'|'town'
  const [selectedCountry, setSelectedCountry] = useState(null); // For country lounge chat

  // Auto-generated lists
  const [allCountries, setAllCountries] = useState([]); // From towns table
  const [allTowns, setAllTowns] = useState([]); // From towns table
  const [userCountries, setUserCountries] = useState([]); // Countries from favorited towns

  // Likes & Favorites
  const [likedMembers, setLikedMembers] = useState([]); // One-way likes
  const [chatFavorites, setChatFavorites] = useState([]); // Favorited chats
  const [countryLikes, setCountryLikes] = useState([]); // Liked countries
  const [showCountryAutocomplete, setShowCountryAutocomplete] = useState(false); // Show country autocomplete dropdown
  const [showTownAutocomplete, setShowTownAutocomplete] = useState(false); // Show town autocomplete dropdown
  const [countryDropdownPos, setCountryDropdownPos] = useState({ top: 0, left: 0, width: 0 }); // Country dropdown position
  const [townDropdownPos, setTownDropdownPos] = useState({ top: 0, left: 0, width: 0 }); // Town dropdown position

  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true); // Track if this is the first mount
  const countrySearchRef = useRef(null); // Ref for country autocomplete dropdown
  const countryInputRef = useRef(null); // Ref for country search input
  const townSearchRef = useRef(null); // Ref for town autocomplete dropdown
  const townInputRef = useRef(null); // Ref for town search input
  const navigate = useNavigate();
  const { townId, groupId } = useParams();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');
  const tabParam = searchParams.get('tab');

  // Moderation actions hook
  const { deleteMessage: deleteMsgAction, pinMessage: pinMessageAction } = useModerationActions();

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

  // Real-time subscription for chat messages - update unread counts instantly
  useEffect(() => {
    if (!user || threads.length === 0) return;

    const subscription = supabase
      .channel('chat_unread_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Only update counts if message is from someone else
          if (payload.new.user_id !== user.id) {
            // Refresh unread counts for all threads
            loadUnreadCounts(threads);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thread_read_status',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh when user marks threads as read
          loadUnreadCounts(threads);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thread_read_status',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh when user marks threads as read
          loadUnreadCounts(threads);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, threads]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load user's friends
  const loadFriends = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) {
        console.error("Error loading friends:", error);
        return;
      }

      if (!data || data.length === 0) {
        setFriends([]);
        return;
      }

      // PERFORMANCE FIX: Batch user lookups instead of N queries
      // Get unique friend IDs
      const friendIds = data.map(connection =>
        connection.user_id === userId ? connection.friend_id : connection.user_id
      );

      // Fetch all friend details in one query
      const { data: friendsData, error: friendsError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: friendIds
      });

      if (friendsError) {
        console.error("Error fetching friends batch:", friendsError);
        // Fallback without names
        const friendsWithoutDetails = data.map(connection => {
          const friendId = connection.user_id === userId ? connection.friend_id : connection.user_id;
          return { ...connection, friend_id: friendId };
        });
        setFriends(friendsWithoutDetails);
        return;
      }

      // Create lookup map
      const friendsMap = {};
      friendsData?.forEach(friend => {
        friendsMap[friend.id] = { id: friend.id, username: friend.username };
      });

      // Map connections with friend data
      const friendsWithDetails = data.map(connection => {
        const friendId = connection.user_id === userId ? connection.friend_id : connection.user_id;
        return {
          ...connection,
          friend_id: friendId,
          friend: friendsMap[friendId] || null
        };
      });

      setFriends(friendsWithDetails);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  };

  // Load group chats
  const loadGroupChats = async (userId) => {
    try {
      // First get the thread IDs
      const { data: memberData, error: memberError } = await supabase
        .from('group_chat_members')
        .select('thread_id, role')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error loading group chat members:', memberError);
        return;
      }

      if (!memberData || memberData.length === 0) {
        setGroupChats([]);
        return;
      }

      // Then get the thread details
      const threadIds = memberData.map(m => m.thread_id);
      const { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .select('id, topic, is_group, is_public, category, geo_region, geo_country, geo_province, created_by, created_at')
        .in('id', threadIds);

      if (threadError) {
        console.error('Error loading group chat threads:', threadError);
        return;
      }

      // Combine the data
      const groups = threadData.map(thread => {
        const member = memberData.find(m => m.thread_id === thread.id);
        return {
          ...thread,
          role: member?.role || 'member'
        };
      });

      setGroupChats(groups);

      // Load unread counts for group chats
      if (groups.length > 0) {
        await loadUnreadCounts(groups);
      }
    } catch (err) {
      console.error('Error loading group chats:', err);
    }
  };

  // Load blocked users
  const loadBlockedUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_blocked_users');

      if (error) {
        console.error("Error loading blocked users:", error);
        return;
      }

      // Extract just the IDs
      const blockedIds = (data || []).map(item => item.blocked_user_id);
      setBlockedUsers(blockedIds);
    } catch (err) {
      console.error("Error loading blocked users:", err);
    }
  };

  // Load pending invitations
  const loadPendingInvitations = async (userId) => {
    try {
      // Load invitations sent by the user
      const { data: sentInvites, error: sentError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');
        
      // Load invitations received by the user
      const { data: receivedInvites, error: receivedError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');
        
      if (sentError || receivedError) {
        console.error("Error loading invitations:", sentError || receivedError);
        return;
      }
      
      // PERFORMANCE FIX: Batch user lookups for invitations
      // Get all unique user IDs from both sent and received invitations
      const sentUserIds = (sentInvites || []).map(i => i.friend_id);
      const receivedUserIds = (receivedInvites || []).map(i => i.user_id);
      const allUserIds = [...new Set([...sentUserIds, ...receivedUserIds])];

      let usersMap = {};
      if (allUserIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase.rpc('get_users_by_ids', {
          p_user_ids: allUserIds
        });

        if (!usersError && usersData) {
          usersData.forEach(user => {
            usersMap[user.id] = { id: user.id, username: user.username };
          });
        }
      }

      // Map invitations with user data
      const sentWithDetails = (sentInvites || []).map(invite => ({
        ...invite,
        friend: usersMap[invite.friend_id] || null
      }));

      const receivedWithDetails = (receivedInvites || []).map(invite => ({
        ...invite,
        user: usersMap[invite.user_id] || null
      }));

      setPendingInvitations({
        sent: sentWithDetails,
        received: receivedWithDetails
      });
    } catch (err) {
      console.error("Error loading pending invitations:", err);
    }
  };
  
  // Load suggested companions (showing all users for now)
  const loadSuggestedCompanions = async (userId) => {
    try {
      // Get all other users (removing similarity filtering until we have more users)
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, username, created_at')
        .neq('id', userId)
        .limit(20); // Show up to 20 users
        
      if (error) {
        console.error("Error loading users:", error);
        console.error("Error details:", error.message, error.code, error.details);
        toast.error(`Failed to load users: ${error.message}`);
        return;
      }

      // Get existing connections to filter them out
      const { data: connections, error: connError } = await supabase
        .from('user_connections')
        .select('friend_id, user_id, status')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      
      if (connError) {
        console.error("Error loading connections:", connError);
      }

      // Create a set of connected user IDs (only for pending and accepted)
      const connectedUserIds = new Set();
      connections?.forEach(conn => {
        if (conn.status === 'pending' || conn.status === 'accepted') {
          if (conn.user_id === userId) {
            connectedUserIds.add(conn.friend_id);
          } else if (conn.friend_id === userId) {
            connectedUserIds.add(conn.user_id);
          }
        }
      });

      // Filter out already connected users
      const availableUsers = allUsers?.filter(user => !connectedUserIds.has(user.id)) || [];

      // For now, just show all available users without similarity filtering
      const companions = availableUsers.map(user => ({
        ...user,
        similarity_score: Math.floor(Math.random() * 30) + 70 // Random score 70-100 for display
      }));

      setCompanions(companions);
    } catch (err) {
      console.error("Error loading companions:", err);
      console.error("Stack trace:", err.stack);
    }
  };

  // Load all countries (auto-generated from towns table)
  const loadAllCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('country')
        .order('country');

      if (error) {
        console.error("Error loading countries:", error);
        return;
      }

      const unique = [...new Set(data?.map(t => t.country) || [])];
      setAllCountries(unique);
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  };

  // Load user's countries (from favorited towns)
  const loadUserCountries = async (userFavorites) => {
    try {
      if (!userFavorites || userFavorites.length === 0) {
        setUserCountries([]);
        return;
      }

      const townIds = userFavorites.map(f => f.town_id);
      const { data, error } = await supabase
        .from('towns')
        .select('country')
        .in('id', townIds);

      if (error) {
        console.error("Error loading user countries:", error);
        return;
      }

      const unique = [...new Set(data?.map(t => t.country) || [])];
      setUserCountries(unique);
    } catch (err) {
      console.error("Error loading user countries:", err);
    }
  };

  // Load all towns (auto-generated)
  const loadAllTowns = async () => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('id, name, country')
        .order('name');

      if (error) {
        console.error("Error loading towns:", error);
        return;
      }

      setAllTowns(data || []);
    } catch (err) {
      console.error("Error loading towns:", err);
    }
  };

  // Load liked members
  const loadLikedMembers = async (userId) => {
    try {
      const { data: likes, error } = await supabase
        .from('user_likes')
        .select('liked_user_id')
        .eq('user_id', userId);

      if (error) {
        console.error("Error loading likes:", error);
        return;
      }

      if (!likes || likes.length === 0) {
        setLikedMembers([]);
        return;
      }

      // Batch fetch user details
      const userIds = likes.map(l => l.liked_user_id);
      const { data: users, error: usersError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: userIds
      });

      if (usersError) {
        console.error("Error fetching liked users batch:", usersError);
        return;
      }

      setLikedMembers(users || []);
    } catch (err) {
      console.error("Error loading liked members:", err);
    }
  };

  // Load chat favorites
  const loadChatFavorites = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading chat favorites:", error);
        return;
      }

      setChatFavorites(data || []);
    } catch (err) {
      console.error("Error loading chat favorites:", err);
    }
  };

  // Load country likes
  const loadCountryLikes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('country_likes')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error("Error loading country likes:", error);
        return;
      }

      setCountryLikes(data || []);
    } catch (err) {
      console.error("Error loading country likes:", err);
    }
  };

  // Toggle country like
  const toggleCountryLike = async (countryName) => {
    try {
      if (!user) return;

      const isLiked = countryLikes.some(c => c.country_name === countryName);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('country_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('country_name', countryName);

        if (error) {
          console.error("Error unliking country:", error);
          toast.error("Failed to unlike country");
          return;
        }

        setCountryLikes(countryLikes.filter(c => c.country_name !== countryName));
        toast.success(`Removed ${countryName} from likes`);
      } else {
        // Like
        const { error } = await supabase
          .from('country_likes')
          .insert({
            user_id: user.id,
            country_name: countryName
          });

        if (error) {
          console.error("Error liking country:", error);
          toast.error("Failed to like country");
          return;
        }

        const { data: newLike } = await supabase
          .from('country_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('country_name', countryName)
          .single();

        if (newLike) {
          setCountryLikes([...countryLikes, newLike]);
        }
        toast.success(`Added ${countryName} to likes`);
      }
    } catch (err) {
      console.error("Error toggling country like:", err);
      toast.error("An error occurred");
    }
  };

  // Toggle like/unlike member
  const toggleLikeMember = async (memberId) => {
    try {
      if (!user) return;

      const isLiked = likedMembers.some(m => m.id === memberId);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('liked_user_id', memberId);

        if (error) {
          console.error("Error unliking member:", error);
          toast.error("Failed to unlike member");
          return;
        }
      } else {
        // Like
        console.log('Attempting to like member:', { user_id: user.id, liked_user_id: memberId });
        const { error } = await supabase
          .from('user_likes')
          .insert({ user_id: user.id, liked_user_id: memberId });

        if (error) {
          console.error("Error liking member:", error);
          console.error("Error details:", error.message, error.details, error.hint);
          toast.error(`Failed to like member: ${error.message}`);
          return;
        }
      }

      await loadLikedMembers(user.id);
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("An error occurred");
    }
  };

  // Toggle favorite/unfavorite chat
  const toggleFavoriteChat = async (chatType, referenceId, referenceName) => {
    try {
      if (!user) return;

      const isFaved = chatFavorites.some(
        f => f.chat_type === chatType && f.reference_id === referenceId
      );

      if (isFaved) {
        // Unfave
        const { error } = await supabase
          .from('chat_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('chat_type', chatType)
          .eq('reference_id', referenceId);

        if (error) {
          console.error("Error unfavoriting chat:", error);
          toast.error("Failed to unfavorite");
          return;
        }
      } else {
        // Fave
        const { error } = await supabase
          .from('chat_favorites')
          .insert({
            user_id: user.id,
            chat_type: chatType,
            reference_id: referenceId,
            reference_name: referenceName
          });

        if (error) {
          console.error("Error favoriting chat:", error);
          toast.error("Failed to favorite");
          return;
        }
      }

      await loadChatFavorites(user.id);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("An error occurred");
    }
  };

  // Load unread counts for threads
  const loadUnreadCounts = async (threads) => {
    try {
      if (!threads || threads.length === 0) return;

      const threadIds = threads.map(t => t.id);

      // Use RPC function to get unread counts efficiently
      const { data: counts, error } = await supabase.rpc('get_unread_counts', {
        p_thread_ids: threadIds
      });

      if (error) {
        console.error("Error loading unread counts:", error);
        return;
      }

      // Convert array to object: { threadId: count }
      const countsMap = {};
      counts?.forEach(({ thread_id, unread_count }) => {
        countsMap[thread_id] = unread_count;
      });

      setUnreadCounts(countsMap);

      // Calculate per-type totals AND per-friend totals
      let loungeTotal = 0;
      let friendsTotal = 0;
      let townsTotal = 0;
      const friendUnreadMap = {}; // Map of friend_id → unread_count

      threads.forEach(thread => {
        const unreadCount = countsMap[thread.id] || 0;

        if (thread.town_id) {
          townsTotal += unreadCount;
        } else if (thread.topic === 'Lounge' || thread.retirement_lounge_id) {
          loungeTotal += unreadCount;
        } else {
          // Friend chat - extract friend_id from topic
          friendsTotal += unreadCount;

          // Extract friend_id from topic like "friend-{userId}-{friendId}" (sorted IDs)
          if (thread.topic?.startsWith('friend-')) {
            const topicWithoutPrefix = thread.topic.replace('friend-', '');
            const ids = topicWithoutPrefix.split('-');

            // The friend_id is the one that's NOT the current user
            const friendId = ids.find(id => id !== user?.id);
            if (friendId) {
              friendUnreadMap[friendId] = (friendUnreadMap[friendId] || 0) + unreadCount;
            }
          }
        }
      });

      setUnreadByType({ lounge: loungeTotal, friends: friendsTotal, towns: townsTotal });
      setUnreadByFriend(friendUnreadMap);
    } catch (err) {
      console.error("Error loading unread counts:", err);
    }
  };

  // Mark thread as read
  const markThreadAsRead = async (threadId) => {
    try {
      const { error } = await supabase.rpc('mark_thread_read', {
        p_thread_id: threadId
      });

      if (error) {
        console.error("Error marking thread as read:", error);
        return;
      }

      // Update local state - set count to 0 for this thread
      setUnreadCounts(prev => ({
        ...prev,
        [threadId]: 0
      }));
    } catch (err) {
      console.error("Error marking thread as read:", err);
    }
  };

  // Load messages for a thread
  const loadMessages = async (threadId) => {
    try {
      // Mark thread as read when viewing
      await markThreadAsRead(threadId);

      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Messages fetch error:", messagesError);
        toast.error("Failed to load messages");
        return;
      }

      // PERFORMANCE FIX: Batch user lookups instead of N+1 queries
      // Get unique user IDs from all messages
      const uniqueUserIds = [...new Set(messagesData?.map(m => m.user_id) || [])];

      if (uniqueUserIds.length === 0) {
        setMessages([]);
        return;
      }

      // Fetch all users in a single query
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: uniqueUserIds
      });

      if (usersError) {
        console.error('Error fetching users batch:', usersError);
        // Fallback to anonymous if batch fetch fails
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          user_name: 'Anonymous'
        }));
        setMessages(formattedMessages);
        return;
      }

      // Create lookup map for O(1) access
      const usersMap = {};
      usersData?.forEach(user => {
        usersMap[user.id] = user.username;
      });

      // Map messages with user data (no more async operations!)
      const formattedMessages = messagesData.map(msg => ({
        ...msg,
        user_name: usersMap[msg.user_id] || 'Anonymous'
      }));

      setMessages(formattedMessages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load messages");
    }
  };
  
  // Subscribe to new messages
  useEffect(() => {
    if (!activeThread) return;
    
    // Subscribe to new messages in this thread
    const subscription = supabase
      .channel(`chat_messages:thread_id=eq.${activeThread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`
        },
        async (payload) => {
          // Don't add our own messages (they're added optimistically)
          if (payload.new.user_id === user?.id) return;

          // Fetch user details using RPC function
          try {
            const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: payload.new.user_id });
            const userInfo = userData?.[0];

            const formattedMessage = {
              ...payload.new,
              // Use username for privacy - never show email or full name
              user_name: userInfo?.username || 'Anonymous'
            };

            setMessages(prev => [...prev, formattedMessage]);
          } catch (error) {
            console.error("Error fetching user for new message:", error);
            // Add message with Anonymous fallback
            setMessages(prev => [...prev, { ...payload.new, user_name: 'Anonymous' }]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`
        },
        (payload) => {
          // Update message in UI when deleted (or any other update)
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [activeThread, user]);

  // Subscribe to ALL new messages for unread count updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to all chat messages
    const subscription = supabase
      .channel('all_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Only increment unread for messages from other users
          if (payload.new.user_id === user.id) return;

          // Only increment if message is NOT in the currently active thread
          if (activeThread && payload.new.thread_id === activeThread.id) return;

          // Increment unread count for this thread
          const threadId = payload.new.thread_id;
          setUnreadCounts(prev => ({
            ...prev,
            [threadId]: (prev[threadId] || 0) + 1
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeThread]);

  // Scroll to bottom only for NEW messages, not initial load
  useEffect(() => {
    // Skip scrolling on initial mount (when page first loads)
    if (isInitialMount.current) {
      if (messages.length > 0) {
        // We have initial messages loaded, mark as no longer initial mount
        isInitialMount.current = false;
      }
      return; // Don't scroll on initial load
    }
    
    // Only scroll for new messages after initial load
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Watch the full messages array for new additions

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

  // Switch to town chat
  const switchToTownChat = async (town) => {
    try {
      setActiveTown(town);
      setChatType('town');
      setMessages([]);

      // Mobile: Hide chat list, show conversation
      if (isMobile) {
        setShowChatList(false);
      }

      // Find or create thread for this town
      let townThread = threads.find(thread => thread.town_id === town.id);
      
      if (!townThread) {
        // Create new thread for this town
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: town.id,
            topic: town.name,
            created_by: user.id
          }])
          .select();
          
        if (createError) {
          console.error("Create thread error:", createError);
          toast.error("Failed to create town chat");
          return;
        }
        
        townThread = newThread[0];
        setThreads(prev => [townThread, ...prev]);
      }
      
      setActiveThread(townThread);
      
      // Update URL
      navigate(`/chat/${town.id}`, { replace: true });
      
      // Fetch messages for this thread
      await loadMessages(townThread.id);
    } catch (err) {
      console.error("Error switching to town chat:", err);
      toast.error("Failed to load town chat");
    }
  };
  
  // Switch to lounge chat
  const switchToLoungeChat = async () => {
    try {
      setActiveTown(null);
      setChatType('lounge');
      setMessages([]);

      // Mobile: Hide chat list, show conversation
      if (isMobile) {
        setShowChatList(false);
      }

      // Find or create lounge thread
      let loungeThread = threads.find(thread => thread.town_id === null && thread.topic === 'Lounge');
      
      if (!loungeThread) {
        // Create lounge thread
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: 'Lounge',
            created_by: user.id
          }])
          .select();
          
        if (createError) {
          console.error("Create lounge error:", createError);
          toast.error("Failed to create lounge chat");
          return;
        }
        
        loungeThread = newThread[0];
        setThreads(prev => [loungeThread, ...prev]);
      }
      
      setActiveThread(loungeThread);
      
      // Update URL
      navigate('/chat', { replace: true });
      
      // Fetch messages for lounge
      await loadMessages(loungeThread.id);
    } catch (err) {
      console.error("Error switching to lounge chat:", err);
      toast.error("Failed to load lounge chat");
    }
  };

  // Switch to group chat
  const switchToGroupChat = async (group) => {
    try {
      setActiveGroupChat(group);
      setChatType('group');
      setMessages([]);
      setActiveThread(group);

      // Mobile: Hide chat list, show conversation
      if (isMobile) {
        setShowChatList(false);
      }

      // Update URL to show we're in group chat
      navigate(`/chat/group/${group.id}`, { replace: true });

      // Fetch messages for this group thread
      await loadMessages(group.id);
    } catch (err) {
      console.error("Error switching to group chat:", err);
      toast.error("Failed to load group chat");
    }
  };

  // Simple AI responses for lounge chat
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Cost of living queries
    if (message.includes('cost') || message.includes('expensive') || message.includes('budget') || message.includes('afford')) {
      return "Great question about cost of living! Here's what I can tell you:\n\n**Most Affordable Regions:**\n• Southeast Asia: Thailand ($800-1500/mo), Vietnam ($700-1200/mo), Malaysia ($900-1500/mo)\n• Eastern Europe: Bulgaria ($700-1200/mo), Romania ($800-1400/mo)\n• Latin America: Mexico ($1000-1800/mo), Ecuador ($800-1500/mo), Colombia ($900-1600/mo)\n\n**Mid-Range Options:**\n• Portugal ($1500-2500/mo), Spain ($1800-3000/mo)\n• Greece ($1400-2400/mo), Croatia ($1200-2200/mo)\n\n**Higher Cost but High Quality:**\n• France ($2500-4000/mo), Italy ($2000-3500/mo)\n• Australia ($2500-4500/mo), Canada ($2000-3500/mo)\n\nWould you like specific breakdowns for any of these locations?";
    }
    
    // Visa and residency queries
    if (message.includes('visa') || message.includes('permit') || message.includes('residency') || message.includes('stay')) {
      return "I'd be happy to explain retirement visa options!\n\n**Popular Retirement Visas:**\n\n**Portugal D7 Visa**\n• Passive income: €705/month minimum\n• Path to EU residency in 5 years\n• Access to Schengen Area\n\n**Spain Non-Lucrative Visa**\n• Savings requirement: ~€27,000/year\n• Cannot work locally\n• Renewable annually\n\n**Panama Pensionado Program**\n• $1,000/month pension required\n• Many discounts for retirees\n• Fast track to permanent residency\n\n**Mexico Temporary Resident Visa**\n• Income: ~$1,500-2,000/month\n• Valid for up to 4 years\n• Can lead to permanent residency\n\n**Thailand Retirement Visa (O-A)**\n• Age 50+ required\n• 800,000 baht ($22,000) in bank\n• Annual renewal\n\nWhich country's requirements would you like more details about?";
    }
    
    // Healthcare queries
    if (message.includes('healthcare') || message.includes('medical') || message.includes('hospital') || message.includes('doctor') || message.includes('insurance')) {
      return "Healthcare is a crucial consideration for retirement abroad! Here's an overview:\n\n**Top Healthcare Systems for Expats:**\n\n**France** - Often ranked #1 globally\n• Universal coverage after 3 months residency\n• Small co-pays, excellent quality\n• Private insurance: €50-150/month\n\n**Spain & Portugal**\n• High-quality public systems\n• Private insurance: €50-100/month\n• English-speaking doctors in major cities\n\n**Thailand & Malaysia**\n• Medical tourism destinations\n• Modern private hospitals\n• Costs: 30-50% of US prices\n• Insurance: $100-200/month\n\n**Mexico**\n• IMSS public system available\n• Quality private care at low cost\n• Many US-trained doctors\n• Insurance: $50-150/month\n\n**Key Tips:**\n• Most countries require health insurance for visa\n• Pre-existing conditions often covered after waiting period\n• Consider medical evacuation insurance\n\nWould you like specific information about healthcare in a particular country?";
    }
    
    // Weather and climate queries
    if (message.includes('weather') || message.includes('climate') || message.includes('temperature') || message.includes('rain')) {
      return "Let me help you find the perfect climate for your retirement!\n\n**Year-Round Spring Climate:**\n• Canary Islands, Spain (18-24°C)\n• Madeira, Portugal (16-23°C)\n• Kunming, China (15-22°C)\n• Cuenca, Ecuador (14-21°C)\n\n**Mediterranean Climate:**\n• Costa del Sol, Spain\n• Algarve, Portugal\n• Crete, Greece\n• Malta\n\n**Tropical Paradise:**\n• Penang, Malaysia\n• Chiang Mai, Thailand (cooler)\n• Bali, Indonesia (highlands)\n• Costa Rica (Central Valley)\n\n**Four Distinct Seasons:**\n• Tuscany, Italy\n• Provence, France\n• Porto, Portugal\n• Ljubljana, Slovenia\n\n**Dry & Sunny:**\n• Arizona, USA (300+ sunny days)\n• Mendoza, Argentina\n• Perth, Australia\n\nWhat type of climate appeals to you most?";
    }
    
    // Tax queries
    if (message.includes('tax') || message.includes('taxes')) {
      return "Tax planning is essential for retirement abroad! Here's what you should know:\n\n**Tax-Friendly Countries for Retirees:**\n\n**No Tax on Foreign Income:**\n• Panama (territorial tax system)\n• Costa Rica (foreign income exempt)\n• Malaysia (MM2H program)\n• Thailand (foreign income not remitted)\n\n**Low Tax Countries:**\n• Portugal (NHR program - 10 years tax benefits)\n• Greece (7% flat tax option)\n• Italy (7% flat tax in southern regions)\n• Cyprus (various exemptions)\n\n**Important Considerations:**\n• US citizens taxed on worldwide income\n• Check tax treaties to avoid double taxation\n• Some countries tax pensions differently\n• Consider state taxes if keeping US ties\n\n**Recommended Steps:**\n1. Consult international tax advisor\n2. Understand reporting requirements (FBAR, etc.)\n3. Plan your tax residency carefully\n4. Consider timing of move\n\nWould you like specific information about any country's tax system?";
    }
    
    // General recommendations
    if (message.includes('recommend') || message.includes('suggest') || message.includes('best') || message.includes('where should')) {
      return `Based on what you've told me, I'd love to help you find the perfect retirement spot!\n\nTo give you the best recommendations, could you tell me more about:\n• Your monthly budget range?\n• Preferred climate (tropical, temperate, four seasons)?\n• Important factors (healthcare, expat community, culture)?\n• Any countries you're already considering?\n\nIn the meantime, here are some popular choices by budget:\n\n**Budget-Friendly:** Portugal, Mexico, Malaysia\n**Mid-Range:** Spain, Greece, Costa Rica\n**Premium:** France, Australia, Switzerland\n\nWhat matters most to you in your retirement destination?`;
    }
    
    // Default response
    return "That's an interesting question! While I'm continuously learning, I can help you with:\n\n• Cost of living comparisons\n• Visa and residency requirements\n• Healthcare systems overview\n• Climate and weather patterns\n• Tax considerations for expats\n• Specific country information\n\nWhat aspect of retirement abroad would you like to explore? Or feel free to ask about a specific country you're considering!";
  };
  
  // Switch to friend chat
  const switchToFriendChat = async (friend) => {
    try {
      setActiveFriend(friend);
      setChatType('friends');
      setActiveTown(null);
      setMessages([]);

      // Mobile: Hide chat list, show conversation
      if (isMobile) {
        setShowChatList(false);
      }

      // Find or create thread for this friend chat
      // Topic format: friend-{userId}-{friendId} (sorted)
      const sortedTopic = `friend-${[user.id, friend.friend_id].sort().join('-')}`;
      let friendThread = threads.find(thread => thread.topic === sortedTopic);
      
      if (!friendThread) {
        // Create new thread for friend chat
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: sortedTopic,
            created_by: user.id
          }])
          .select();
          
        if (createError) {
          console.error("Create friend thread error:", createError);
          toast.error("Failed to create friend chat");
          return;
        }
        
        friendThread = newThread[0];
        setThreads(prev => [friendThread, ...prev]);
      }
      
      setActiveThread(friendThread);
      
      // Update URL
      navigate(`/chat?friend=${friend.friend_id}`, { replace: true });
      
      // Fetch messages for this thread
      await loadMessages(friendThread.id);
    } catch (err) {
      console.error("Error switching to friend chat:", err);
      toast.error("Failed to load friend chat");
    }
  };
  
  // Send friend request
  const sendFriendRequest = async (targetUserId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending'
        }]);

      if (error) {
        console.error("Error sending friend request:", error);
        toast.error("Failed to send friend request");
        return;
      }

      toast.success("Friend request sent!");
      setShowCompanionsModal(false);

      // Reload companions to update UI
      await loadSuggestedCompanions(user.id);
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error("Failed to send friend request");
    }
  };

  // Create group chat
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

  // Handle user action from UserActionSheet
  const handleUserAction = async (actionId, userId) => {
    switch (actionId) {
      case 'profile':
        navigate(`/profile/${userId}`);
        break;

      case 'message':
        // Find friend connection and open chat
        const friend = friends.find(f => f.friend_id === userId);
        if (friend) {
          setActiveFriend(friend);
          setChatType('friends');
        }
        break;

      case 'addFriend':
        await sendFriendRequest(userId);
        break;

      case 'follow':
        // Follow functionality (to be implemented)
        toast('Follow functionality coming soon', { icon: '🚧' });
        break;

      case 'mute':
        toggleMute(userId);
        break;

      case 'block':
        if (blockedUsers.includes(userId)) {
          await unblockUser(userId);
        } else {
          await blockUser(userId);
        }
        break;

      case 'report':
        setUserToReport({ id: userId, name: selectedUser?.name || 'Unknown' });
        setShowReportModal(true);
        break;

      // Removed: copy and share actions (disabled for now)

      default:
        console.warn('Unknown action:', actionId);
    }
  };

  // Toggle mute for a user
  const toggleMute = (userId) => {
    setMutedUsers(prev => {
      const newMuted = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      localStorage.setItem('mutedUsers', JSON.stringify(newMuted));
      return newMuted;
    });

    const isMuting = !mutedUsers.includes(userId);
    toast.success(isMuting ? 'User muted in this chat' : 'User unmuted');
  };

  // Block user
  const blockUser = async (userId) => {
    try {
      const { error } = await supabase.rpc('block_user', { p_user_id: userId });

      if (error) throw error;

      setBlockedUsers(prev => [...prev, userId]);
      toast.success('User blocked');
    } catch (err) {
      console.error('Error blocking user:', err);
      toast.error('Failed to block user');
    }
  };

  // Unblock user
  const unblockUser = async (userId) => {
    try {
      const { error } = await supabase.rpc('unblock_user', { p_user_id: userId });

      if (error) throw error;

      setBlockedUsers(prev => prev.filter(id => id !== userId));
      toast.success('User unblocked');
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast.error('Failed to unblock user');
    }
  };
  
  // Send invitation by email
  const sendInviteByEmail = async (email) => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInviteLoading(true);

    try {
      // Use RPC function to search for user by email
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_user_by_email', {
          search_email: email.trim().toLowerCase()
        });

      if (searchError) {
        console.error("Search error:", searchError);
        
        // If the function doesn't exist yet, provide instructions
        if (searchError.code === '42883') {
          toast.error("Search function not set up yet. Please run the migration SQL in Supabase.");
        } else {
          toast.error("Error searching for user. Please try again.");
        }
        setInviteLoading(false);
        return;
      }
      
      if (!searchResult || searchResult.length === 0) {
        toast.error("No user found with this email address. Please check the email and ensure they've signed up.");
        setInviteLoading(false);
        return;
      }

      const existingUser = searchResult[0];

      // Check if already connected - check both directions separately for clarity
      const { data: sentConnections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', existingUser.id)
        .neq('status', 'cancelled'); // Exclude cancelled connections
        
      const { data: receivedConnections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('friend_id', user.id)
        .neq('status', 'cancelled'); // Exclude cancelled connections
        
      // Filter to only active connections (pending or accepted)
      const existingConnection = [...(sentConnections || []), ...(receivedConnections || [])]
        .filter(conn => conn.status === 'pending' || conn.status === 'accepted');

      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        if (connection.status === 'accepted') {
          toast.error("You're already connected with this user!");
        } else if (connection.status === 'pending') {
          toast.error("There's already a pending invitation with this user!");
        }
        setInviteLoading(false);
        return;
      }
      
      // Send the invitation with message
      const { error: inviteError } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: existingUser.id,
          status: 'pending',
          message: inviteMessage.trim() || null
        }]);
        
      if (inviteError) {
        console.error("Error sending invitation:", inviteError);
        toast.error("Failed to send invitation");
        setInviteLoading(false);
        return;
      }

      // Create in-app notification for the invited user
      try {
        await supabase.rpc('create_notification', {
          target_user_id: existingUser.id,
          notification_type: 'invitation_received',
          notification_title: `${user.username || 'Someone'} invited you to connect`,
          notification_message: inviteMessage.trim() || 'Connect to chat and share retirement planning ideas',
          notification_link: `/chat?invitation=${inviteData.id}`
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the whole invitation if notification fails
      }

      // Send email notification
      const emailResult = await sendInvitationEmailViaAuth(
        email,
        user,
        inviteMessage.trim()
      );
      
      if (!emailResult.success) {
        console.error("Email error:", emailResult.error);
      }
      
      // Create mailto link as fallback
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        `${user.username || 'Someone'} invited you to Scout2Retire`
      )}&body=${encodeURIComponent(
        `Hi!\n\n${user.username || 'Someone'} has invited you to join Scout2Retire, a personalized retirement planning platform.\n\n` +
        (inviteMessage ? `Personal message from ${user.username || 'Someone'}:\n"${inviteMessage}"\n\n` : '') +
        `Click here to accept the invitation and create your account:\n${window.location.origin}/signup?invite_from=${user.id}\n\n` +
        `With Scout2Retire, you can:\n` +
        `- Discover retirement destinations that match your lifestyle\n` +
        `- Connect with like-minded people planning their retirement\n` +
        `- Compare locations based on cost, climate, culture, and more\n` +
        `- Plan visits and make informed decisions\n\n` +
        `Looking forward to connecting with you!\n\n` +
        `Best regards,\n${user.username || 'Someone'}`
      )}`;
      
      // Show success with mailto option
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Invitation saved!
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  The invitation to {existingUser.username || email} has been recorded.
                </p>
                <div className="mt-3 flex space-x-2">
                  <a
                    href={mailtoLink}
                    className="text-sm font-medium text-scout-accent-600 hover:text-scout-accent-500"
                  >
                    Send email manually
                  </a>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 8000 });
      
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteMessage('');
      
      // Reload invitations
      await loadPendingInvitations(user.id);
      
    } catch (err) {
      console.error("Error sending invitation by email:", err);
      toast.error("An error occurred while sending the invitation");
    } finally {
      setInviteLoading(false);
    }
  };
  
  // Accept invitation
  const acceptInvitation = async (connectionId) => {
    try {
      // Get the invitation details first
      const { data: inviteData } = await supabase
        .from('user_connections')
        .select('user_id')
        .eq('id', connectionId)
        .single();

      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) {
        console.error("Error accepting invitation:", error);
        toast.error("Failed to accept invitation");
        return;
      }

      // Notify the person who sent the invitation
      if (inviteData?.user_id) {
        try {
          await supabase.rpc('create_notification', {
            target_user_id: inviteData.user_id,
            notification_type: 'invitation_accepted',
            notification_title: `${user.username || 'Someone'} accepted your invitation`,
            notification_message: 'You can now chat together!',
            notification_link: `/chat`
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      toast.success("Invitation accepted!");

      // Reload friends and invitations
      await loadFriends(user.id);
      await loadPendingInvitations(user.id);

      // Mark any related notification as read
      try {
        const { data: relatedNotifs } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .or(`type.eq.invitation_received,type.eq.friend_request,type.eq.new_friend_request`)
          .limit(5);

        if (relatedNotifs && relatedNotifs.length > 0) {
          for (const notif of relatedNotifs) {
            await supabase.rpc('mark_notification_read', { notification_id: notif.id });
          }
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }

      // Auto-switch to Friends tab to show the new friend
      setFriendsTabActive('friends');
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error("Failed to accept invitation");
    }
  };
  
  // Decline invitation
  const declineInvitation = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("Error declining invitation:", error);
        toast.error("Failed to decline invitation");
        return;
      }
      
      toast.success("Invitation declined");

      // Reload invitations
      await loadPendingInvitations(user.id);

      // Mark any related notification as read
      try {
        const { data: relatedNotifs } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .or(`type.eq.invitation_received,type.eq.friend_request,type.eq.new_friend_request`)
          .limit(5);

        if (relatedNotifs && relatedNotifs.length > 0) {
          for (const notif of relatedNotifs) {
            await supabase.rpc('mark_notification_read', { notification_id: notif.id });
          }
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    } catch (err) {
      console.error("Error declining invitation:", err);
      toast.error("Failed to decline invitation");
    }
  };
  
  // Cancel sent invitation
  const cancelSentInvitation = async (connectionId) => {
    // Store the invitation to cancel for potential restoration
    const invitationToCancel = pendingInvitations.sent.find(inv => inv.id === connectionId);
    if (!invitationToCancel) return;
    
    // Optimistically update UI
    setPendingInvitations(prev => ({
      ...prev,
      sent: prev.sent.filter(invite => invite.id !== connectionId)
    }));
    
    // Call the utility function
    const { success, error } = await cancelInvitation(connectionId, user.id);
    
    if (!success) {
      // Restore the invitation if cancellation failed
      setPendingInvitations(prev => ({
        ...prev,
        sent: [...prev.sent, invitationToCancel].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
      }));
      
      toast.error("Failed to cancel invitation");
      console.error("Cancel invitation error:", error);
    } else {
      toast.success("Invitation canceled");
    }
  };
  
  // Delete a chat message (with role-based permissions)
  const deleteMessage = async (messageId) => {
    const result = await deleteMsgAction(messageId);

    if (result.success) {
      // Optimistically update the UI
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), deleted_by: user.id }
            : msg
        )
      );
    }
  };

  // Pin/Unpin a chat message (group chats only)
  const handlePinMessage = async (messageId, shouldPin) => {
    const result = await pinMessageAction(messageId, shouldPin);

    if (result.success) {
      // Optimistically update the UI
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                is_pinned: shouldPin,
                pinned_at: shouldPin ? new Date().toISOString() : null,
                pinned_by: shouldPin ? user.id : null
              }
            : msg
        )
      );
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    // Sanitize and validate the message
    const validation = sanitizeChatMessage(messageInput);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    const messageText = validation.sanitized;
    setMessageInput('');
    
    if (chatType === 'scout') {
      // Handle scout AI chat
      const userMessage = {
        id: `user-${Date.now()}`,
        message: messageText,
        user_id: user.id,
        user_name: user.username || 'You',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate AI response with typing delay
      setTimeout(() => {
        const aiResponse = getAIResponse(messageText);
        
        const loungeResponse = {
          id: `lounge-${Date.now()}`,
          message: aiResponse,
          user_id: 'community',
          user_name: 'Community Assistant',
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, loungeResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
      return;
    }
    
    if (!activeThread) {
      toast.error("No active chat selected");
      return;
    }
    
    // Optimistically add message to UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      thread_id: activeThread.id,
      user_id: user.id,
      message: messageText,
      created_at: new Date().toISOString(),
      user_name: user.username || 'You'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      // Add message to database
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          thread_id: activeThread.id,
          user_id: user.id,
          message: messageText
        }])
        .select();
        
      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        toast.error("Failed to send message");
        console.error("Send message error:", error);
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };
  
  // Format date for display
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>Loading chat...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader
        title={
          chatType === 'town' && activeTown
            ? `${activeTown.name} Chat`
            : chatType === 'lounge'
            ? 'Retirement Lounge'
            : chatType === 'friends' && activeFriend
            ? `Chat with ${activeFriend.friend.username || 'Friend'}`
            : chatType === 'group' && activeGroupChat
            ? activeGroupChat.topic || 'Group Chat'
            : 'Retirement Lounge'
        }
        maxWidth="max-w-7xl"
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
            isActive: activeTab === 'lounges',
            onClick: () => {
              if (isMobile && activeTab === 'lounges' && !showChatList) {
                // Toggle: return to list view
                setShowChatList(true);
              } else {
                setActiveTab('lounges');
              }
            }
          },
          {
            id: 'groups',
            label: 'Groups',
            icon: UserPlus,
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
            icon: Heart,
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
            <div className="space-y-4">
              {/* Search Bar */}
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                  <input
                    type="search"
                    placeholder="Search favorites..."
                    value={favoritesSearchTerm}
                    onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                    className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                  />
                </div>
              </div>

              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Lobby</h2>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
                  Your favorited chats
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {chatFavorites.length === 0 ? (
                  <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
                    <p>No favorites yet.</p>
                    <p className={`${uiConfig.font.size.xs} mt-2`}>Tap ⭐ on any chat to add it here!</p>
                  </div>
                ) : (
                  chatFavorites.map(fav => (
                    <div
                      key={fav.id}
                      className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover}`}
                    >
                      <button
                        onClick={() => {
                          // Handle navigation based on chat type
                          if (fav.chat_type === 'friend') {
                            const friendData = friends.find(f => f.friend.id === fav.reference_id);
                            if (friendData) switchToFriendChat(friendData);
                          } else if (fav.chat_type === 'group') {
                            const groupData = groupChats.find(g => g.id === fav.reference_id);
                            if (groupData) switchToGroupChat(groupData);
                          } else if (fav.chat_type === 'town_lounge') {
                            const townData = allTowns.find(t => t.id === fav.reference_id);
                            if (townData) switchToTownChat(townData);
                          } else if (fav.chat_type === 'country_lounge') {
                            setSelectedCountry(fav.reference_name);
                            toast.success(`Opening ${fav.reference_name} lounge`);
                          }
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                            {fav.chat_type === 'friend' && <User className="h-5 w-5" />}
                            {fav.chat_type === 'group' && <Users className="h-5 w-5" />}
                            {fav.chat_type === 'town_lounge' && <Home className="h-5 w-5" />}
                            {fav.chat_type === 'country_lounge' && <MapPin className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className={uiConfig.font.weight.medium}>{fav.reference_name}</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} capitalize`}>
                              {fav.chat_type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleFavoriteChat(fav.chat_type, fav.reference_id, fav.reference_name)}
                        className="p-2"
                        title="Unfavorite"
                      >
                        ⭐
                      </button>
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>
            )}
            {/* ========== END LOBBY TAB ========== */}

            {/* ========== LOUNGES TAB ========== */}
            {activeTab === 'lounges' && (
            <div className="space-y-4">

              {/* Main Lounge List */}
              {!loungeView && (
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
                  <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                    <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Lounges</h2>
                  </div>
                  <div className="p-2 space-y-1">
                    {/* Retirement Lounge */}
                    <button
                      onClick={switchToLoungeChat}
                      className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                        chatType === 'lounge' ? uiConfig.colors.badge : `${uiConfig.states.hover}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          <div>
                            <div className={uiConfig.font.weight.medium}>Retirement Lounge</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>General discussion</div>
                          </div>
                        </div>
                        {unreadByType.lounge > 0 && (
                          <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                            {unreadByType.lounge}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Country Lounge */}
                    <button
                      onClick={() => setLoungeView('country')}
                      className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5" />
                          <div>
                            <div className={uiConfig.font.weight.medium}>Country Lounge</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Chat by country</div>
                          </div>
                        </div>
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </button>

                    {/* Town Lounge */}
                    <button
                      onClick={() => setLoungeView('town')}
                      className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Home className="h-5 w-5" />
                          <div>
                            <div className={uiConfig.font.weight.medium}>Town Lounge</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Chat by town</div>
                          </div>
                        </div>
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Country Lounge Subsection */}
              {loungeView === 'country' && (
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md}`}>
                  <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                    <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Country Lounge</h2>
                  </div>
                  <div className="max-h-96 overflow-y-auto relative">
                    {/* User's Liked Countries */}
                    {countryLikes.length > 0 && (
                      <>
                        <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                          My Countries
                        </div>
                        {countryLikes.map(countryLike => {
                          const country = countryLike.country_name;
                          return (
                            <div
                              key={`liked-${country}`}
                              className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                            >
                              <button
                                onClick={() => {
                                  setSelectedCountry(country);
                                  toast.success(`Opening ${country} lounge`);
                                }}
                                className="flex-1 text-left"
                              >
                                {country}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCountryLike(country);
                                }}
                                className="p-1.5 ml-2"
                                aria-label="Unlike country"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Search Bar - Right after MY COUNTRIES */}
                    <div className={`p-3 sticky top-0 ${uiConfig.colors.card} border-b ${uiConfig.colors.borderLight} z-30`}>
                      <div className="relative" ref={countrySearchRef}>
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                        <input
                          ref={countryInputRef}
                          type="text"
                          placeholder="Search lounges..."
                          value={loungesSearchTerm}
                          onChange={(e) => {
                            setLoungesSearchTerm(e.target.value);
                            if (e.target.value.length > 0) {
                              const rect = e.target.getBoundingClientRect();
                              setCountryDropdownPos({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setShowCountryAutocomplete(true);
                            } else {
                              setShowCountryAutocomplete(false);
                            }
                          }}
                          onFocus={() => {
                            if (loungesSearchTerm.length > 0) {
                              const rect = countryInputRef.current.getBoundingClientRect();
                              setCountryDropdownPos({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setShowCountryAutocomplete(true);
                            }
                          }}
                          autoComplete="off"
                          className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                        />
                      </div>
                    </div>

                    {/* Autocomplete Dropdown - Rendered at document level */}
                    {showCountryAutocomplete && loungesSearchTerm && (
                      <div
                        className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} border ${uiConfig.colors.borderLight} max-h-60 overflow-y-auto`}
                        style={{
                          position: 'fixed',
                          top: `${countryDropdownPos.top}px`,
                          left: `${countryDropdownPos.left}px`,
                          width: `${countryDropdownPos.width}px`,
                          zIndex: 9999
                        }}
                      >
                        {allCountries
                          .filter(country =>
                            country.toLowerCase().includes(loungesSearchTerm.toLowerCase()) &&
                            !countryLikes.some(c => c.country_name === country)
                          )
                          .slice(0, 10) // Show max 10 suggestions
                          .map(country => (
                            <button
                              key={country}
                              onClick={() => {
                                toggleCountryLike(country);
                                setLoungesSearchTerm('');
                                setShowCountryAutocomplete(false);
                                toast.success(`Added ${country} to My Countries`);
                              }}
                              className={`w-full text-left px-4 py-2.5 ${uiConfig.states.hover} ${uiConfig.animation.transition} border-b ${uiConfig.colors.borderLight} last:border-b-0`}
                            >
                              <span className={uiConfig.font.size.sm}>{country}</span>
                            </button>
                          ))
                        }
                        {allCountries.filter(country =>
                          country.toLowerCase().includes(loungesSearchTerm.toLowerCase()) &&
                          !countryLikes.some(c => c.country_name === country)
                        ).length === 0 && (
                          <div className={`px-4 py-3 ${uiConfig.colors.hint} ${uiConfig.font.size.sm} text-center`}>
                            {countryLikes.some(c => c.country_name.toLowerCase().includes(loungesSearchTerm.toLowerCase()))
                              ? "Already in My Countries"
                              : "No countries found"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* All Countries (no header, just list) */}
                    {allCountries
                      .filter(country =>
                        !countryLikes.some(c => c.country_name === country) &&
                        (loungesSearchTerm === '' || country.toLowerCase().includes(loungesSearchTerm.toLowerCase()))
                      )
                      .map(country => {
                        return (
                          <div
                            key={country}
                            className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                          >
                            <button
                              onClick={() => {
                                setSelectedCountry(country);
                                toast.success(`Opening ${country} lounge`);
                              }}
                              className="flex-1 text-left"
                            >
                              {country}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCountryLike(country);
                              }}
                              className="p-1.5 ml-2"
                              aria-label="Like country"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Town Lounge Subsection */}
              {loungeView === 'town' && (
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md}`}>
                  <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                    <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Town Lounge</h2>
                  </div>
                  <div className="max-h-96 overflow-y-auto relative">
                    {/* Favorited Towns */}
                    {favorites.length > 0 && (
                      <>
                        <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                          My Favorite Towns
                        </div>
                        {favorites
                          .map(f => allTowns.find(t => t.id === f.town_id))
                          .filter(Boolean)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(town => (
                            <div
                              key={`fav-${town.id}`}
                              className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                            >
                              <button
                                onClick={() => switchToTownChat(town)}
                                className="flex-1 text-left"
                              >
                                <div className={uiConfig.font.weight.medium}>{town.name}</div>
                                <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const result = await toggleFavorite(user.id, town.id, town.name, town.country);
                                  if (result.success) {
                                    const updatedFavorites = await fetchFavorites(user.id, 'TownLounge');
                                    if (updatedFavorites.success) {
                                      setFavorites(updatedFavorites.favorites);
                                      toast.success(`Removed ${town.name} from favorites`);
                                    }
                                  }
                                }}
                                className="p-1.5 ml-2"
                                aria-label="Unlike town"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                      </>
                    )}

                    {/* Search Bar - Right after MY FAVORITE TOWNS */}
                    <div className={`p-3 sticky top-0 ${uiConfig.colors.card} border-b ${uiConfig.colors.borderLight} z-30`}>
                      <div className="relative" ref={townSearchRef}>
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                        <input
                          ref={townInputRef}
                          type="text"
                          placeholder="Search towns..."
                          value={townLoungeSearchTerm}
                          onChange={(e) => {
                            setTownLoungeSearchTerm(e.target.value);
                            if (e.target.value.length > 0) {
                              const rect = e.target.getBoundingClientRect();
                              setTownDropdownPos({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setShowTownAutocomplete(true);
                            } else {
                              setShowTownAutocomplete(false);
                            }
                          }}
                          onFocus={() => {
                            if (townLoungeSearchTerm.length > 0) {
                              const rect = townInputRef.current.getBoundingClientRect();
                              setTownDropdownPos({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setShowTownAutocomplete(true);
                            }
                          }}
                          autoComplete="off"
                          className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                        />
                      </div>
                    </div>

                    {/* Autocomplete Dropdown - Rendered at document level */}
                    {showTownAutocomplete && townLoungeSearchTerm && (
                      <div
                        className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} border ${uiConfig.colors.borderLight} max-h-60 overflow-y-auto`}
                        style={{
                          position: 'fixed',
                          top: `${townDropdownPos.top}px`,
                          left: `${townDropdownPos.left}px`,
                          width: `${townDropdownPos.width}px`,
                          zIndex: 9999
                        }}
                      >
                        {allTowns
                          .filter(town =>
                            town.name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                            town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase())
                          )
                          .slice(0, 10) // Show max 10 suggestions
                          .map(town => (
                            <button
                              key={town.id}
                              onClick={() => {
                                switchToTownChat(town);
                                setTownLoungeSearchTerm('');
                                setShowTownAutocomplete(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 ${uiConfig.states.hover} ${uiConfig.animation.transition} border-b ${uiConfig.colors.borderLight} last:border-b-0`}
                            >
                              <div className={uiConfig.font.size.sm}>{town.name}</div>
                              <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                            </button>
                          ))
                        }
                        {allTowns.filter(town =>
                          town.name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                          town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className={`px-4 py-3 ${uiConfig.colors.hint} ${uiConfig.font.size.sm} text-center`}>
                            No towns found
                          </div>
                        )}
                      </div>
                    )}

                    {/* All Towns (filtered by search) */}
                    {allTowns
                      .filter(town =>
                        // Exclude favorited towns
                        !favorites.some(f => f.town_id === town.id) &&
                        // Filter by search term
                        (townLoungeSearchTerm === '' ||
                          town.name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                          town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()))
                      )
                      .map(town => (
                        <div
                          key={town.id}
                          className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                        >
                          <button
                            onClick={() => switchToTownChat(town)}
                            className="flex-1 text-left"
                          >
                            <div className={uiConfig.font.weight.medium}>{town.name}</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const result = await toggleFavorite(user.id, town.id, town.name, town.country);
                              if (result.success) {
                                const updatedFavorites = await fetchFavorites(user.id, 'TownLounge');
                                if (updatedFavorites.success) {
                                  setFavorites(updatedFavorites.favorites);
                                  toast.success(`Added ${town.name} to favorites`);
                                }
                              }
                            }}
                            className="p-1.5 ml-2"
                            aria-label="Like town"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            )}
            {/* ========== END LOUNGES TAB ========== */}

            {/* ========== GROUPS TAB ========== */}
            {activeTab === 'groups' && (
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

                {/* Other Groups */}
                {groupChats.filter(g => g.is_public && g.created_by !== user?.id && !g.members?.includes(user?.id)).length > 0 && (
                  <>
                    <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                      Other Groups
                    </div>
                    {groupChats
                      .filter(g => g.is_public && g.created_by !== user?.id && !g.members?.includes(user?.id))
                      .sort((a, b) => (a.topic || '').localeCompare(b.topic || ''))
                      .map(group => (
                        <button
                          key={group.id}
                          onClick={() => switchToGroupChat(group)}
                          className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <span>🌐</span>
                            </div>
                            <div className="flex-1">
                              <div className={uiConfig.font.weight.medium}>{group.topic || 'Untitled Group'}</div>
                              <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                                {group.category || 'General'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </>
                )}

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
            )}
            {/* ========== END GROUPS TAB ========== */}

            {/* ========== FRIENDS TAB ========== */}
            {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                  <input
                    type="search"
                    placeholder="Search friends..."
                    value={friendsSearchTerm}
                    onChange={(e) => setFriendsSearchTerm(e.target.value)}
                    className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                  />
                </div>
              </div>

              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Friends</h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className={`${uiConfig.colors.btnSecondary} px-3 py-1 text-xs ${uiConfig.layout.radius.md}`}
                  >
                    Invite Friend
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* Liked Members */}
                {likedMembers.length > 0 && (
                  <>
                    <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                      Liked Members
                    </div>
                    {likedMembers
                      .sort((a, b) => (a.username || '').localeCompare(b.username || ''))
                      .map(member => (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover}`}
                        >
                          <button
                            onClick={() => {
                              // Find friend data for this member
                              const friendData = friends.find(f => f.friend.id === member.id);
                              if (friendData) {
                                switchToFriendChat(friendData);
                              } else {
                                toast.error("Not yet friends with this member");
                              }
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                                <User className="h-5 w-5" />
                              </div>
                              <div className={uiConfig.font.weight.medium}>{member.username || 'Member'}</div>
                            </div>
                          </button>
                          <button
                            onClick={() => toggleLikeMember(member.id)}
                            className="p-2"
                            title="Unlike"
                          >
                            ❤️
                          </button>
                        </div>
                      ))}
                    <hr className="my-2" />
                  </>
                )}

                {/* Friends */}
                {friends.length > 0 && (
                  <>
                    <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                      Friends
                    </div>
                    {friends
                      .filter(f => !likedMembers.some(lm => lm.id === f.friend.id))
                      .sort((a, b) => (a.friend.username || '').localeCompare(b.friend.username || ''))
                      .map(friend => (
                        <div
                          key={friend.id}
                          className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${
                            chatType === 'friends' && activeFriend?.id === friend.id ? uiConfig.colors.badge : ''
                          }`}
                        >
                          <button
                            onClick={() => switchToFriendChat(friend)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                                <User className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={uiConfig.font.weight.medium}>{friend.friend.username || 'Friend'}</div>
                                  {unreadByFriend[friend.friend_id] > 0 && (
                                    <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                      {unreadByFriend[friend.friend_id]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => toggleLikeMember(friend.friend.id)}
                            className="p-2"
                            title="Like this member"
                          >
                            🤍
                          </button>
                        </div>
                      ))}
                  </>
                )}

                {friends.length === 0 && likedMembers.length === 0 && (
                  <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
                    <p>No friends yet.</p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className={`mt-3 ${uiConfig.colors.btnPrimary} px-4 py-2 ${uiConfig.layout.radius.md}`}
                    >
                      Invite a Friend
                    </button>
                  </div>
                )}
              </div>
              </div>
            </div>
            )}
            {/* ========== END FRIENDS TAB ========== */}

            {/* ========== FAVORITES TAB ========== */}
            {activeTab === 'favorites' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                  <input
                    type="search"
                    placeholder="Search favorites..."
                    value={favoritesSearchTerm}
                    onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                    className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                  />
                </div>
              </div>

              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Favorites</h2>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
                  Your favorited chats
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {chatFavorites.length === 0 ? (
                  <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
                    <p>No favorites yet.</p>
                    <p className={`${uiConfig.font.size.xs} mt-2`}>Tap ⭐ on any chat to add it here!</p>
                  </div>
                ) : (
                  chatFavorites.map(fav => (
                    <div
                      key={fav.id}
                      className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover}`}
                    >
                      <button
                        onClick={() => {
                          // Handle navigation based on chat type
                          if (fav.chat_type === 'friend') {
                            const friendData = friends.find(f => f.friend.id === fav.reference_id);
                            if (friendData) switchToFriendChat(friendData);
                          } else if (fav.chat_type === 'group') {
                            const groupData = groupChats.find(g => g.id === fav.reference_id);
                            if (groupData) switchToGroupChat(groupData);
                          } else if (fav.chat_type === 'town_lounge') {
                            const townData = allTowns.find(t => t.id === fav.reference_id);
                            if (townData) switchToTownChat(townData);
                          } else if (fav.chat_type === 'country_lounge') {
                            setSelectedCountry(fav.reference_name);
                            toast.success(`Opening ${fav.reference_name} lounge`);
                          }
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                            {fav.chat_type === 'friend' && <User className="h-5 w-5" />}
                            {fav.chat_type === 'group' && <Users className="h-5 w-5" />}
                            {fav.chat_type === 'town_lounge' && <Home className="h-5 w-5" />}
                            {fav.chat_type === 'country_lounge' && <MapPin className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className={uiConfig.font.weight.medium}>{fav.reference_name}</div>
                            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} capitalize`}>
                              {fav.chat_type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleFavoriteChat(fav.chat_type, fav.reference_id, fav.reference_name)}
                        className="p-2"
                        title="Unfavorite"
                      >
                        ⭐
                      </button>
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>
            )}
            {/* ========== END FAVORITES TAB ========== */}

          </div>
          )}

          {/* Chat area - Desktop (always) + Mobile (when chat selected) */}
          {(!isMobile || !showChatList) && (
          <div className={`flex-1 min-w-0 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex flex-col`} style={{ height: 'calc(100vh - 10rem)' }}>
            {/* Group Chat Header with Settings */}
            {chatType === 'group' && activeGroupChat && (
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
            )}

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(() => {
                // Filter messages based on muted/blocked users
                const filteredMessages = showMutedMessages
                  ? messages
                  : messages.filter(msg =>
                      !mutedUsers.includes(msg.user_id) &&
                      !blockedUsers.includes(msg.user_id)
                    );

                const hiddenCount = messages.length - filteredMessages.length;

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
                          // Check if message is deleted
                          const isDeleted = message.deleted_at;

                          // Check if message can be deleted (own message, within time window)
                          const now = new Date();
                          const messageTime = new Date(message.created_at);
                          const messageAge = (now - messageTime) / 1000 / 60; // in minutes
                          const DELETE_WINDOW_MINUTES = 15; // 15 minutes

                          const isOwnMessage = message.user_id === user?.id;
                          const withinTimeWindow = messageAge < DELETE_WINDOW_MINUTES;
                          const canDelete = isOwnMessage && !isDeleted && withinTimeWindow;

                          // Check if message can be pinned (group chats only, for now all members can pin)
                          const canPin = chatType === 'group' && !isDeleted;

                          return (
                    <div
                      key={message.id}
                      className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'} ${
                        index > 0 && messages[index - 1].user_id === message.user_id ? 'mt-1' : 'mt-4'
                      }`}
                    >
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
                        {(index === 0 || messages[index - 1].user_id !== message.user_id) && !isDeleted && (
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
                                  setSelectedUser({
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

                        {/* Delete button (visible on mobile, hover-only on desktop) */}
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this message? This cannot be undone.')) {
                                deleteMessage(message.id);
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
                              handlePinMessage(message.id, !message.is_pinned);
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
                        })}
                  {isTyping && chatType === 'scout' && (
                    <div className="flex justify-start">
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
                  </>
                );
              })()}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className={`border-t ${uiConfig.colors.borderLight} p-4`}>
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    maxLength={MAX_LENGTHS.CHAT_MESSAGE}
                    placeholder={`Message ${
                      chatType === 'town' && activeTown 
                        ? activeTown.name + ' chat' 
                        : chatType === 'lounge'
                        ? 'the retirement lounge'
                        : chatType === 'friends' && activeFriend
                        ? activeFriend.friend.username || 'friend'
                        : 'the community'
                    }...`}
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
          </div>
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
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full`}>
            <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
              <div className="flex justify-between items-center">
                <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  Invite a Friend
                </h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    // Keep the message for next time
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
              <p className={`${uiConfig.colors.body} mb-4`}>
                Connect with someone who shares your retirement dreams:
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                sendInviteByEmail(inviteEmail);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                      Friend's Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className={`w-full px-4 py-2 border ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent`}
                      required
                      disabled={inviteLoading}
                    />
                  </div>
                  
                  <div>
                    <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => {
                        setInviteMessage(e.target.value);
                      }}
                      placeholder="Add your personal message here..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:border-transparent resize-none"
                      disabled={inviteLoading}
                    />
                    <div className={`mt-1 text-xs ${uiConfig.colors.hint} text-right`}>
                      {inviteMessage.length}/500
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      // Keep the message for next time
                    }}
                    className={`px-4 py-2 ${uiConfig.colors.btnNeutral} ${uiConfig.layout.radius.md}`}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={inviteLoading || !inviteEmail}
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
              
              {pendingInvitations?.sent && pendingInvitations.sent.length > 0 && (
                <div className={`mt-6 pt-6 border-t ${uiConfig.colors.borderLight}`}>
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-3`}>
                    Pending invitations you've sent:
                  </p>
                  <div className="space-y-2">
                    {pendingInvitations.sent.map(invite => (
                      <div key={invite.id} className={`flex items-center justify-between ${uiConfig.colors.input} p-2 ${uiConfig.layout.radius.md}`}>
                        <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                          {invite.friend?.username || `User ${invite.friend_id?.slice(0, 8)}...`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            Pending
                          </span>
                          <button
                            onClick={() => cancelSentInvitation(invite.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Cancel invitation"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Companions Modal */}
      {showCompanionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full max-h-[80vh] overflow-hidden`}>
            <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
              <div className="flex justify-between items-center">
                <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  Find Companions
                </h2>
                <button
                  onClick={() => setShowCompanionsModal(false)}
                  className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Search box */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  onChange={(e) => {
                    const search = e.target.value.toLowerCase();
                    if (search) {
                      const filtered = companions.filter(c =>
                        c.username?.toLowerCase().includes(search)
                      );
                      setCompanions(filtered);
                    } else {
                      loadSuggestedCompanions(user.id);
                    }
                  }}
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} focus:outline-none focus:ring-2 focus:ring-scout-accent-500`}
                />
              </div>

              {companions.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`${uiConfig.colors.hint} mb-2`}>
                    No users found
                  </p>
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                    Try searching by name or use the "Invite a Friend" button to invite someone by email
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-4`}>
                    Connect with other Scout2Retire members:
                  </p>
                  {companions.map(companion => (
                    <div 
                      key={companion.id} 
                      className={`${uiConfig.colors.input} ${uiConfig.layout.radius.lg} p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                            <span className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium}`}>
                              {companion.username?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                              {companion.username || 'User'}
                            </h3>
                            <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                              {companion.similarity_score}% match
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(companion.id)}
                          className={`px-3 py-1 bg-scout-accent-600 hover:bg-scout-accent-700 text-white ${uiConfig.font.size.sm} ${uiConfig.layout.radius.md} ${uiConfig.animation.transition}`}
                        >
                          Connect
                        </button>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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