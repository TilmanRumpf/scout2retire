import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * useChatDataLoaders - All data loading functions for Chat
 * Extracted from Chat.jsx to reduce file size
 */
export function useChatDataLoaders() {
  // Load user's friends
  const loadFriends = async (userId, setFriends) => {
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

      const friendIds = data.map(connection =>
        connection.user_id === userId ? connection.friend_id : connection.user_id
      );

      const { data: friendsData, error: friendsError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: friendIds
      });

      if (friendsError) {
        console.error("Error fetching friends batch:", friendsError);
        const friendsWithoutDetails = data.map(connection => {
          const friendId = connection.user_id === userId ? connection.friend_id : connection.user_id;
          return { ...connection, friend_id: friendId };
        });
        setFriends(friendsWithoutDetails);
        return;
      }

      const friendsMap = {};
      friendsData?.forEach(friend => {
        friendsMap[friend.id] = { id: friend.id, username: friend.username };
      });

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
  const loadGroupChats = async (userId, setGroupChats, loadUnreadCounts) => {
    try {
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

      const threadIds = memberData.map(m => m.thread_id);
      const { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .select('id, topic, is_group, is_public, category, geo_region, geo_country, geo_province, created_by, created_at')
        .in('id', threadIds);

      if (threadError) {
        console.error('Error loading group chat threads:', threadError);
        return;
      }

      const groups = threadData.map(thread => {
        const member = memberData.find(m => m.thread_id === thread.id);
        return {
          ...thread,
          role: member?.role || 'member'
        };
      });

      setGroupChats(groups);

      if (groups.length > 0 && loadUnreadCounts) {
        await loadUnreadCounts(groups);
      }
    } catch (err) {
      console.error('Error loading group chats:', err);
    }
  };

  // Load blocked users
  const loadBlockedUsers = async (setBlockedUsers) => {
    try {
      const { data, error } = await supabase.rpc('get_blocked_users');

      if (error) {
        console.error("Error loading blocked users:", error);
        return;
      }

      const blockedIds = (data || []).map(item => item.blocked_user_id);
      setBlockedUsers(blockedIds);
    } catch (err) {
      console.error("Error loading blocked users:", err);
    }
  };

  // Load pending invitations
  const loadPendingInvitations = async (userId, setPendingInvitations) => {
    try {
      const { data: sentInvites, error: sentError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      const { data: receivedInvites, error: receivedError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (sentError || receivedError) {
        console.error("Error loading invitations:", sentError || receivedError);
        return;
      }

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

  // Load suggested companions
  const loadSuggestedCompanions = async (userId, setCompanions) => {
    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, username, created_at')
        .neq('id', userId)
        .limit(20);

      if (error) {
        console.error("Error loading users:", error);
        toast.error(`Failed to load users: ${error.message}`);
        return;
      }

      const { data: connections, error: connError } = await supabase
        .from('user_connections')
        .select('friend_id, user_id, status')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (connError) {
        console.error("Error loading connections:", connError);
      }

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

      const availableUsers = allUsers?.filter(user => !connectedUserIds.has(user.id)) || [];

      const companions = availableUsers.map(user => ({
        ...user,
        similarity_score: Math.floor(Math.random() * 30) + 70
      }));

      setCompanions(companions);
    } catch (err) {
      console.error("Error loading companions:", err);
    }
  };

  // Load all countries
  const loadAllCountries = async (setAllCountries) => {
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

  // Load user's countries
  const loadUserCountries = async (userFavorites, setUserCountries) => {
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

  // Load all towns
  const loadAllTowns = async (setAllTowns) => {
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
  const loadLikedMembers = async (userId, setLikedMembers) => {
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
  const loadChatFavorites = async (userId, setChatFavorites) => {
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
  const loadCountryLikes = async (userId, setCountryLikes) => {
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

  // Load unread counts
  const loadUnreadCounts = async (threads, user, setUnreadCounts, setUnreadByType, setUnreadByFriend) => {
    try {
      if (!threads || threads.length === 0) return;

      const threadIds = threads.map(t => t.id);

      const { data: counts, error } = await supabase.rpc('get_unread_counts', {
        p_thread_ids: threadIds
      });

      if (error) {
        console.error("Error loading unread counts:", error);
        return;
      }

      const countsMap = {};
      counts?.forEach(({ thread_id, unread_count }) => {
        countsMap[thread_id] = unread_count;
      });

      setUnreadCounts(countsMap);

      let loungeTotal = 0;
      let friendsTotal = 0;
      let townsTotal = 0;
      const friendUnreadMap = {};

      threads.forEach(thread => {
        const unreadCount = countsMap[thread.id] || 0;

        if (thread.town_id) {
          townsTotal += unreadCount;
        } else if (thread.topic === 'Lounge' || thread.retirement_lounge_id) {
          loungeTotal += unreadCount;
        } else {
          friendsTotal += unreadCount;

          if (thread.topic?.startsWith('friend-')) {
            const topicWithoutPrefix = thread.topic.replace('friend-', '');
            const ids = topicWithoutPrefix.split('-');
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
  const markThreadAsRead = async (threadId, setUnreadCounts) => {
    try {
      const { error } = await supabase.rpc('mark_thread_read', {
        p_thread_id: threadId
      });

      if (error) {
        console.error("Error marking thread as read:", error);
        return;
      }

      setUnreadCounts(prev => ({
        ...prev,
        [threadId]: 0
      }));
    } catch (err) {
      console.error("Error marking thread as read:", err);
    }
  };

  // Load messages for a thread
  const loadMessages = async (threadId, markThreadAsRead, setMessages) => {
    try {
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

      const uniqueUserIds = [...new Set(messagesData?.map(m => m.user_id) || [])];

      if (uniqueUserIds.length === 0) {
        setMessages([]);
        return;
      }

      const { data: usersData, error: usersError } = await supabase.rpc('get_users_by_ids', {
        p_user_ids: uniqueUserIds
      });

      if (usersError) {
        console.error('Error fetching users batch:', usersError);
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          user_name: 'Anonymous'
        }));
        setMessages(formattedMessages);
        return;
      }

      const usersMap = {};
      usersData?.forEach(user => {
        usersMap[user.id] = user.username;
      });

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
    loadUnreadCounts,
    markThreadAsRead,
    loadMessages
  };
}
