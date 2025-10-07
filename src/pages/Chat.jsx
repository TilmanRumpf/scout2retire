import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2, Home } from 'lucide-react';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites } from '../utils/townUtils.jsx';
import { sanitizeChatMessage, MAX_LENGTHS, displaySafeContent } from '../utils/sanitizeUtils';
import { cancelInvitation } from '../utils/companionUtils';
import { sendInvitationEmailViaAuth } from '../utils/emailUtils';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import FriendsSection from '../components/FriendsSection';
import UserActionSheet from '../components/UserActionSheet';
import ReportUserModal from '../components/ReportUserModal';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

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
  const [companions, setCompanions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friendsTabActive, setFriendsTabActive] = useState('friends'); // 'friends' or 'requests'
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

  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true); // Track if this is the first mount
  const navigate = useNavigate();
  const { townId } = useParams();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');
  const tabParam = searchParams.get('tab');
  
  // Load companions when modal opens
  useEffect(() => {
    if (showCompanionsModal && user) {
      console.log("Companions modal opened, loading companions...");
      loadSuggestedCompanions(user.id);
    }
  }, [showCompanionsModal, user]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get current user
        const { user: currentUser, profile: userProfile } = await getCurrentUser();
        if (!currentUser) {
          navigate('/welcome');
          return;
        }
        
        setUser({ ...currentUser, ...userProfile });

        // Fetch user's home town if they have one
        if (userProfile?.hometown) {
          // Extract just the city name (before first comma)
          const cityName = userProfile.hometown.split(',')[0].trim();

          // Try exact match first with city name only
          let { data: homeTownData, error: homeTownError } = await supabase
            .from('towns')
            .select('id, name, country, region')
            .ilike('name', cityName)
            .limit(1);

          // If no exact match, try partial match
          if (!homeTownData || homeTownData.length === 0) {
            const result = await supabase
              .from('towns')
              .select('id, name, country, region')
              .ilike('name', `%${cityName}%`)
              .limit(1);

            homeTownData = result.data;
            homeTownError = result.error;
          }

          if (homeTownData && homeTownData.length > 0 && !homeTownError) {
            setUserHomeTown(homeTownData[0]);
          }
        }

        // Fetch user's favorites
        const { success: favSuccess, favorites: userFavorites } = await fetchFavorites(currentUser.id);
        if (favSuccess) {
          setFavorites(userFavorites);
        }
        
        // Fetch user's friends and pending invitations
        await loadFriends(currentUser.id);
        await loadPendingInvitations(currentUser.id);

        // Load blocked users
        await loadBlockedUsers();

        // Load suggested companions
        await loadSuggestedCompanions(currentUser.id);
        
        // Auto-switch to Requests tab if tab=requests in URL
        if (tabParam === 'requests') {
          setFriendsTabActive('requests');
        }

        // If accessed via notification, scroll to the invitation
        if (invitationId && pendingInvitations.received) {
          const invitation = pendingInvitations.received.find(inv => inv.id === invitationId);
          if (invitation) {
            // Highlight the invitation
            setTimeout(() => {
              const element = document.getElementById(`invitation-${invitationId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                element.classList.add('ring-2', 'ring-scout-accent-500', 'ring-opacity-75');
                setTimeout(() => {
                  element.classList.remove('ring-2', 'ring-scout-accent-500', 'ring-opacity-75');
                }, 3000);
              }
            }, 500);
          }
        }
        
        // Fetch chat threads
        const { data: threadData, error: threadError } = await supabase
          .from('chat_threads')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (threadError) {
          console.error("Thread fetch error:", threadError);
          toast.error("Failed to load chat threads");
        }
        
        setThreads(threadData || []);

        // Load active town chats (towns with messages in last 30 days + favorited towns)
        const townThreads = (threadData || []).filter(t => t.town_id !== null);
        const townIdsWithActivity = [];

        // Get threads with recent messages (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const thread of townThreads) {
          const { data: recentMessages } = await supabase
            .from('chat_messages')
            .select('id')
            .eq('thread_id', thread.id)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .limit(1);

          if (recentMessages && recentMessages.length > 0) {
            townIdsWithActivity.push(thread.town_id);
          }
        }

        // Combine: favorited towns + towns with activity (remove duplicates)
        const allActiveTownIds = [...new Set([
          ...userFavorites.map(f => f.town_id),
          ...townIdsWithActivity
        ])];

        // Fetch town data for all active towns
        if (allActiveTownIds.length > 0) {
          const { success: townSuccess, towns: activeTowns } = await fetchTowns({
            townIds: allActiveTownIds
          });

          if (townSuccess) {
            // Mark which are favorited and add thread_id
            const activeTownChatsData = activeTowns.map(town => {
              const thread = townThreads.find(t => t.town_id === town.id);
              return {
                town_id: town.id,
                thread_id: thread?.id,
                towns: town,
                is_favorited: userFavorites.some(f => f.town_id === town.id)
              };
            });

            // Sort: favorited first, then alphabetically
            activeTownChatsData.sort((a, b) => {
              if (a.is_favorited && !b.is_favorited) return -1;
              if (!a.is_favorited && b.is_favorited) return 1;
              return a.towns.name.localeCompare(b.towns.name);
            });

            setActiveTownChats(activeTownChatsData);

            // Load unread counts for all town threads
            await loadUnreadCounts(townThreads);
          }
        }

        // If townId is provided, load that town and its thread
        if (townId) {
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
          // Default to lounge chat if no town specified
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
  }, [navigate, townId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
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
      
      // Fetch user details for friends
      const friendsWithDetails = await Promise.all(
        (data || []).map(async (connection) => {
          try {
            // Determine which user is the friend (the one that's NOT the current user)
            const friendId = connection.user_id === userId ? connection.friend_id : connection.user_id;

            const { data: friendData, error } = await supabase.rpc('get_user_by_id', { user_id: friendId });
            if (error) {
              console.log("RPC function not available, friend will show without name");
              return { ...connection, friend_id: friendId };
            }
            return {
              ...connection,
              friend_id: friendId,
              friend: friendData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching friend details:", err);
            const friendId = connection.user_id === userId ? connection.friend_id : connection.user_id;
            return { ...connection, friend_id: friendId };
          }
        })
      );
      
      setFriends(friendsWithDetails);
    } catch (err) {
      console.error("Error loading friends:", err);
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
      
      // Fetch user details for sent invitations
      const sentWithDetails = await Promise.all(
        (sentInvites || []).map(async (invite) => {
          try {
            const { data: friendData, error } = await supabase.rpc('get_user_by_id', { user_id: invite.friend_id });
            if (error) {
              console.log("RPC function not available, invitation will show without name");
              return invite;
            }
            return {
              ...invite,
              friend: friendData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching friend details:", err);
            return invite;
          }
        })
      );
      
      // Fetch user details for received invitations
      const receivedWithDetails = await Promise.all(
        (receivedInvites || []).map(async (invite) => {
          try {
            const { data: userData, error } = await supabase.rpc('get_user_by_id', { user_id: invite.user_id });
            if (error) {
              console.log("RPC function not available, invitation will show without name");
              return invite;
            }
            return {
              ...invite,
              user: userData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching user details:", err);
            return invite;
          }
        })
      );
      
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
      
      console.log("All users found:", allUsers?.length || 0, allUsers);
      
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

  // Load unread counts for threads
  const loadUnreadCounts = async (threads) => {
    try {
      if (!threads || threads.length === 0) return;

      const threadIds = threads.map(t => t.id);
      console.log('[Chat] loadUnreadCounts called with threads:', threads.map(t => ({ id: t.id, topic: t.topic })));
      console.log('[Chat] Calling RPC with threadIds:', threadIds);

      // Use RPC function to get unread counts efficiently
      const { data: counts, error } = await supabase.rpc('get_unread_counts', {
        p_thread_ids: threadIds
      });

      if (error) {
        console.error("Error loading unread counts:", error);
        return;
      }

      console.log('[Chat] RPC returned counts:', counts);

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

      console.log('[Chat] Unread totals:', { lounge: loungeTotal, friends: friendsTotal, towns: townsTotal });
      console.log('[Chat] Per-friend unread:', friendUnreadMap);
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

      // Fetch user details for each message using RPC function
      const formattedMessages = await Promise.all(
        (messagesData || []).map(async (msg) => {
          try {
            const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: msg.user_id });
            const userInfo = userData?.[0];
            const username = userInfo?.username || 'Anonymous';
            // Use username for privacy - RPC function returns username only
            return {
              ...msg,
              user_name: username
            };
          } catch (err) {
            console.error('Error fetching user:', err);
            return {
              ...msg,
              user_name: 'Anonymous'
            };
          }
        })
      );

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
  
  // Switch to town chat
  const switchToTownChat = async (town) => {
    try {
      setActiveTown(town);
      setChatType('town');
      setMessages([]);
      
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
    
    console.log("Searching for user with email:", email);
    setInviteLoading(true);
    
    try {
      // Use RPC function to search for user by email
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_user_by_email', { 
          search_email: email.trim().toLowerCase() 
        });
      
      console.log("RPC search result:", { searchResult, searchError });
      
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
      console.log("Found user:", existingUser);
      
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
        
      console.log("Existing connections found:", { sentConnections, receivedConnections, existingConnection });
        
      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        console.log("Found existing connection:", connection);
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
  
  // Delete a chat message
  const deleteMessage = async (messageId) => {
    try {
      const { data, error } = await supabase.rpc('delete_chat_message', {
        p_message_id: messageId
      });

      if (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
        return;
      }

      // Check the response
      if (!data.success) {
        toast.error(data.error || 'Failed to delete message');
        return;
      }

      // Optimistically update the UI
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), deleted_by: user.id }
            : msg
        )
      );

      toast.success('Message deleted');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
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
            : 'Retirement Lounge'
        }
        maxWidth="max-w-7xl"
        showFilters={true}
        filterProps={{
          // Chat search - searches messages, topics, countries, town names
          chatSearchTerm,
          setChatSearchTerm,

          // Filter buttons
          filterChatType,
          setFilterChatType,
          filterCountry,
          setFilterCountry,

          // Available data for search
          messages: messages,
          threads: threads,
          activeTownChats: activeTownChats,
          friends: friends,

          // Unread counts for bubble badges
          unreadByType,

          // Available countries for dropdown
          availableCountries: [...new Set(activeTownChats.map(tc => tc.towns.country).filter(Boolean))].sort(),

          variant: 'chat' // Tell FilterBarV3 to use chat mode
        }}
      />

      <UnifiedErrorBoundary variant="compact"
        fallbackTitle="Chat Error"
        fallbackMessage="We're having trouble loading the chat. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        {/* Spacer for fixed header */}
        <HeaderSpacer hasFilters={true} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {/* Chat navigation - Only show lounge if filter is 'all' or not filtering */}
            {(filterChatType === 'all' || filterChatType === 'lounge') && (
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Chat Options</h2>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={switchToLoungeChat}
                  className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    chatType === 'lounge'
                      ? uiConfig.colors.badge
                      : `${uiConfig.states.hover} ${uiConfig.colors.body}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <div>
                        <div className={`${uiConfig.font.weight.medium}`}>Retirement Lounge</div>
                        <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>General discussion</div>
                      </div>
                    </div>
                    {unreadByType.lounge > 0 && (
                      <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                        {unreadByType.lounge}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
            )}

            {/* Friends & Connections - Only show if filter is 'all' or 'friends' */}
            {(filterChatType === 'all' || filterChatType === 'friends') && (
            <FriendsSection
              friendsTabActive={friendsTabActive}
              setFriendsTabActive={setFriendsTabActive}
              friends={friends}
              pendingInvitations={pendingInvitations}
              acceptInvitation={acceptInvitation}
              declineInvitation={declineInvitation}
              switchToFriendChat={switchToFriendChat}
              chatType={chatType}
              activeFriend={activeFriend}
              setShowInviteModal={setShowInviteModal}
              setInviteMessage={setInviteMessage}
              defaultInviteMessage={defaultInviteMessage}
              setShowCompanionsModal={setShowCompanionsModal}
              refreshFriends={() => loadFriends(user.id)}
              unreadCount={unreadByType.friends}
              unreadByFriend={unreadByFriend}
            />
            )}

            {/* Town Chats - Shows favorited + active towns - Only show if filter is 'all' or 'towns' */}
            {(filterChatType === 'all' || filterChatType === 'towns') && (
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Town Chats</h2>
                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
                      Active conversations & favorites
                    </p>
                  </div>
                  {unreadByType.towns > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                      {unreadByType.towns}
                    </div>
                  )}
                </div>
              </div>

              {activeTownChats.length === 0 && !userHomeTown ? (
                <div className={`p-4 text-center ${uiConfig.colors.hint} ${uiConfig.font.size.sm}`}>
                  <p>No active town chats yet.</p>
                  <a href="/discover" className={`${uiConfig.colors.accent} hover:underline mt-2 inline-block`}>
                    Discover towns
                  </a>
                </div>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 28rem)' }}>
                  {/* Home Town - Always first */}
                  {userHomeTown && (
                    filterCountry === 'all' || userHomeTown.country === filterCountry
                  ) && (
                    <button
                      key={`home-${userHomeTown.id}`}
                      onClick={() => switchToTownChat(userHomeTown)}
                      className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                        chatType === 'town' && activeTown?.id === userHomeTown.id
                          ? uiConfig.colors.badge
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.lg} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                          <Home className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} flex items-center gap-2`}>
                            {userHomeTown.name}
                            <span className={`text-xs ${uiConfig.colors.hint} font-normal`}>
                              (Home)
                            </span>
                          </div>
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            {userHomeTown.country}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Other Town Chats */}
                  {activeTownChats
                    .filter(townChat => {
                      // Don't show home town twice
                      if (userHomeTown && townChat.town_id === userHomeTown.id) {
                        return false;
                      }
                      // Filter by country if selected
                      if (filterCountry !== 'all' && townChat.towns.country !== filterCountry) {
                        return false;
                      }
                      return true;
                    })
                    .map(townChat => (
                    <button
                      key={townChat.town_id}
                      onClick={() => switchToTownChat(townChat.towns)}
                      className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                        chatType === 'town' && activeTown?.id === townChat.town_id
                          ? uiConfig.colors.badge
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.lg} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                          {townChat.is_favorited ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} flex items-center gap-2`}>
                            {townChat.towns.name}
                            {!townChat.is_favorited && (
                              <span className={`${uiConfig.font.size.xs} px-1.5 py-0.5 bg-scout-accent-100 dark:bg-scout-accent-900/30 text-scout-accent-700 dark:text-scout-accent-300 rounded`}>
                                Active
                              </span>
                            )}
                          </div>
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            {townChat.towns.country}
                          </div>
                        </div>
                        {townChat.thread_id && unreadCounts[townChat.thread_id] > 0 && (
                          <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                            {unreadCounts[townChat.thread_id]}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Chat area - Full height on all screens */}
          <div className={`flex-1 min-w-0 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex flex-col`} style={{ height: 'calc(100vh - 10rem)' }}>
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

                          // Debug log for ALL own messages
                          if (isOwnMessage) {
                            console.log('🗑️ DELETE CHECK:', {
                              message_id: message.id,
                              message_preview: message.message?.substring(0, 30),
                              age_minutes: messageAge.toFixed(1),
                              age_hours: (messageAge / 60).toFixed(1),
                              created_at: message.created_at,
                              isDeleted,
                              canDelete,
                              user_id_match: message.user_id === user?.id,
                              message_user_id: message.user_id,
                              current_user_id: user?.id
                            });
                          }

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
        </div>
        </main>
      </UnifiedErrorBoundary>

      {/* Bottom navigation for mobile */}

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
    </div>
  );
}