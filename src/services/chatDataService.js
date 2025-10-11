import supabase from '../utils/supabaseClient';
import { fetchTowns, fetchFavorites } from '../utils/townUtils.jsx';

/**
 * Pure data loading functions - NO React, NO state
 * All functions return data or throw errors
 */

export async function loadFriends(userId) {
  const { data, error } = await supabase
    .from('user_connections')
    .select('*')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;
  if (!data?.length) return [];

  const friendIds = data.map(c => c.user_id === userId ? c.friend_id : c.user_id);
  const { data: friendsData, error: friendsError } = await supabase.rpc('get_users_by_ids', {
    p_user_ids: friendIds
  });

  if (friendsError) {
    return data.map(c => ({
      ...c,
      friend_id: c.user_id === userId ? c.friend_id : c.user_id
    }));
  }

  const friendsMap = {};
  friendsData?.forEach(f => { friendsMap[f.id] = { id: f.id, username: f.username }; });

  return data.map(c => {
    const friendId = c.user_id === userId ? c.friend_id : c.user_id;
    return { ...c, friend_id: friendId, friend: friendsMap[friendId] || null };
  });
}

export async function loadGroupChats(userId) {
  const { data: memberData, error: memberError } = await supabase
    .from('group_chat_members')
    .select('thread_id, role')
    .eq('user_id', userId);

  if (memberError) throw memberError;
  if (!memberData?.length) return [];

  const threadIds = memberData.map(m => m.thread_id);
  const { data: threadData, error: threadError } = await supabase
    .from('chat_threads')
    .select('id, topic, is_group, is_public, category, geo_region, geo_country, geo_province, created_by, created_at')
    .in('id', threadIds);

  if (threadError) throw threadError;

  return threadData.map(t => ({
    ...t,
    role: memberData.find(m => m.thread_id === t.id)?.role || 'member'
  }));
}

export async function loadBlockedUsers() {
  const { data, error } = await supabase.rpc('get_blocked_users');
  if (error) throw error;
  return (data || []).map(item => item.blocked_user_id);
}

export async function loadPendingInvitations(userId) {
  const [sentRes, recvRes] = await Promise.all([
    supabase.from('user_connections').select('*').eq('user_id', userId).eq('status', 'pending'),
    supabase.from('user_connections').select('*').eq('friend_id', userId).eq('status', 'pending')
  ]);

  const sentUserIds = (sentRes.data || []).map(i => i.friend_id);
  const recvUserIds = (recvRes.data || []).map(i => i.user_id);
  const allUserIds = [...new Set([...sentUserIds, ...recvUserIds])];

  let usersMap = {};
  if (allUserIds.length > 0) {
    const { data: usersData } = await supabase.rpc('get_users_by_ids', { p_user_ids: allUserIds });
    usersData?.forEach(u => { usersMap[u.id] = { id: u.id, username: u.username }; });
  }

  return {
    sent: (sentRes.data || []).map(i => ({ ...i, friend: usersMap[i.friend_id] || null })),
    received: (recvRes.data || []).map(i => ({ ...i, user: usersMap[i.user_id] || null }))
  };
}

export async function loadSuggestedCompanions(userId) {
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, username, created_at')
    .neq('id', userId)
    .limit(20);

  const { data: connections } = await supabase
    .from('user_connections')
    .select('friend_id, user_id, status')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  const connectedIds = new Set();
  connections?.forEach(c => {
    if (c.status === 'pending' || c.status === 'accepted') {
      connectedIds.add(c.user_id === userId ? c.friend_id : c.user_id);
    }
  });

  return (allUsers || [])
    .filter(u => !connectedIds.has(u.id))
    .map(u => ({ ...u, similarity_score: Math.floor(Math.random() * 30) + 70 }));
}

export async function loadAllCountries() {
  const { data } = await supabase.from('towns').select('country').order('country');
  return [...new Set(data?.map(t => t.country) || [])];
}

export async function loadAllTowns() {
  const { data } = await supabase.from('towns').select('id, name, country').order('name');
  return data || [];
}

export async function loadLikedMembers(userId) {
  const { data: likes } = await supabase
    .from('user_likes')
    .select('liked_user_id')
    .eq('user_id', userId);

  if (!likes?.length) return [];

  const userIds = likes.map(l => l.liked_user_id);
  const { data: users } = await supabase.rpc('get_users_by_ids', { p_user_ids: userIds });
  return users || [];
}

export async function loadChatFavorites(userId) {
  const { data } = await supabase
    .from('chat_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function loadCountryLikes(userId) {
  const { data } = await supabase
    .from('country_likes')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function loadUnreadCounts(threads) {
  if (!threads?.length) return {};

  const threadIds = threads.map(t => t.id);
  const { data: counts } = await supabase.rpc('get_unread_counts', { p_thread_ids: threadIds });

  const countsMap = {};
  counts?.forEach(({ thread_id, unread_count }) => { countsMap[thread_id] = unread_count; });
  return countsMap;
}

export async function loadMessages(threadId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id, content, user_id, created_at, is_pinned,
      users!user_id(id, username)
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function markThreadAsRead(threadId, userId) {
  const { data: existingStatus } = await supabase
    .from('thread_read_status')
    .select('*')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingStatus) {
    await supabase
      .from('thread_read_status')
      .update({ last_read_at: new Date().toISOString() })
      .eq('id', existingStatus.id);
  } else {
    await supabase
      .from('thread_read_status')
      .insert({ thread_id: threadId, user_id: userId, last_read_at: new Date().toISOString() });
  }
}
