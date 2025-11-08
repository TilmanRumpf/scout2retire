import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { fetchTowns, fetchFavorites } from '../utils/townUtils.jsx';
import toast from 'react-hot-toast';
import { cancelInvitation } from '../utils/companionUtils';
import { sanitizeChatMessage } from '../utils/sanitizeUtils';
import { sendInvitationEmailViaAuth } from '../utils/emailUtils';

/**
 * useChatOperations - All chat operation handlers
 * Extracted from Chat.jsx to reduce file size
 */
export function useChatOperations(chatState, user, navigate, isMobile) {
  const {
    setFriends, setGroupChats, setBlockedUsers, setPendingInvitations,
    setCompanions, setAllCountries, setUserCountries, setAllTowns,
    setLikedMembers, setChatFavorites, setCountryLikes, setUnreadCounts,
    setUnreadByType, setUnreadByFriend, setMessages, setActiveThread,
    setActiveTown, setChatType, setActiveGroupChat, setActiveFriend,
    setFavorites, setSelectedCountry, setMessageInput, messagesEndRef,
    activeThread, threads, chatFavorites, messages, activeTown, chatType,
    messageInput, activeGroupChat, activeFriend, friends, groupChats,
    allTowns, userHomeTown, isInitialMount, countryLikes, likedMembers,
    countrySearchRef, setShowCountryAutocomplete, townSearchRef, setShowTownAutocomplete,
    setThreads, setShowChatList, blockedUsers, mutedUsers, pendingInvitations,
    selectedUser, setFriendsTabActive, setInviteEmail, setInviteLoading,
    setInviteMessage, setIsTyping, setMutedUsers, setShowCompanionsModal,
    setShowInviteModal, setShowReportModal, setUserToReport, inviteMessage
  } = chatState;

  // Helper function to format message timestamps
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
        .select('id, town_name, country')
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
            topic: town.town_name,
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
    if (message.includes('cost') || message.includes('expensive') || message.includes('costs') || message.includes('afford')) {
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
      return `Based on what you've told me, I'd love to help you find the perfect retirement spot!\n\nTo give you the best recommendations, could you tell me more about:\n• Your monthly cost range?\n• Preferred climate (tropical, temperate, four seasons)?\n• Important factors (healthcare, expat community, culture)?\n• Any countries you're already considering?\n\nIn the meantime, here are some popular choices by cost:\n\n**Cost-Effective:** Portugal, Mexico, Malaysia\n**Mid-Range:** Spain, Greece, Costa Rica\n**Premium:** France, Australia, Switzerland\n\nWhat matters most to you in your retirement destination?`;
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

  return {
    loadFriends,
    loadGroupChats,
    loadBlockedUsers,
    loadPendingInvitations,
    loadSuggestedCompanions,
    loadAllCountries,
    loadUserCountries,
    loadAllTowns,
    loadLikedMembers,
    loadChatFavorites,
    loadCountryLikes,
    toggleCountryLike,
    toggleLikeMember,
    toggleFavoriteChat,
    loadUnreadCounts,
    markThreadAsRead,
    loadMessages,
    switchToTownChat,
    switchToLoungeChat,
    switchToGroupChat,
    getAIResponse,
    switchToFriendChat,
    sendFriendRequest,
    handleCreateGroup,
    handleUserAction,
    toggleMute,
    blockUser,
    unblockUser,
    sendInviteByEmail,
    acceptInvitation,
    declineInvitation,
    cancelSentInvitation,
    deleteMessage,
    handlePinMessage,
    handleSendMessage,
    formatMessageDate
  };
}
