import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/authUtils';

export default function NotificationBell() {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  console.log('[NotificationBell] Component mounted/rendered. unreadMessagesCount:', unreadMessagesCount);

  useEffect(() => {
    console.log('[NotificationBell] Initial useEffect - calling loadUser');
    loadUser();

    // Listen for auth state changes - fetch counts when user logs in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[NotificationBell] Auth state changed:', event, 'session exists:', !!session);
      if (event === 'SIGNED_IN' && session) {
        loadUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('[NotificationBell] User changed effect. user:', user?.id);
    if (user) {
      console.log('[NotificationBell] User exists, fetching messages');
      fetchUnreadMessages();
      const unsubscribeMessages = setupMessageSubscription();
      return () => {
        unsubscribeMessages();
      };
    } else {
      console.log('[NotificationBell] No user yet');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchUnreadMessages and setupMessageSubscription use user internally

  const loadUser = async () => {
    console.log('[NotificationBell] loadUser called');
    try {
      const { user: currentUser } = await getCurrentUser();
      console.log('[NotificationBell] getCurrentUser result:', currentUser?.id);
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.log('[NotificationBell] No currentUser returned from getCurrentUser');
      }
    } catch (error) {
      console.error('[NotificationBell] Error loading user:', error);
    }
  };


  const fetchUnreadMessages = async () => {
    console.log('[NotificationBell] fetchUnreadMessages called');
    try {
      // CRITICAL: Verify we have an authenticated session FIRST
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[NotificationBell] Session check:', session ? 'Session exists' : 'NO SESSION');

      if (!session) {
        console.log('[NotificationBell] No session - skipping unread message fetch');
        setUnreadMessagesCount(0);
        return;
      }

      // Get all threads with their latest message
      const { data: threads, error: threadsError } = await supabase
        .from('chat_threads')
        .select(`
          id,
          chat_messages!inner(id, created_at, user_id)
        `)
        .order('created_at', { foreignTable: 'chat_messages', ascending: false });

      console.log('[NotificationBell] Threads query result:', { threads, threadsError });

      if (threadsError) {
        console.error('[NotificationBell] Error fetching threads:', threadsError);
        return;
      }

      if (!threads || threads.length === 0) {
        console.log('[NotificationBell] No threads found, setting count to 0');
        setUnreadMessagesCount(0);
        return;
      }

      // Get read status for all threads
      const threadIds = threads.map(t => t.id);
      const { data: readStatuses, error: readError } = await supabase
        .from('thread_read_status')
        .select('thread_id, last_read_message_id')
        .eq('user_id', user.id)
        .in('thread_id', threadIds);

      console.log('[NotificationBell] Read statuses:', readStatuses);

      if (readError) {
        console.error('[NotificationBell] Error fetching read statuses:', readError);
      }

      // Create map of read statuses
      const readStatusMap = {};
      (readStatuses || []).forEach(status => {
        readStatusMap[status.thread_id] = status.last_read_message_id;
      });

      // Count unread messages for each thread
      let totalUnread = 0;
      for (const thread of threads) {
        const lastReadId = readStatusMap[thread.id];

        // Count messages in this thread that are unread
        const { count, error: countError } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .neq('user_id', user.id) // Don't count own messages
          .gte('id', lastReadId ? lastReadId + 1 : 0); // Count from after last read, or all if no read status

        if (!countError && count) {
          totalUnread += count;
        }
      }

      console.log('[NotificationBell] Total unread count calculated:', totalUnread);
      setUnreadMessagesCount(totalUnread);
    } catch (err) {
      console.error('[NotificationBell] Error loading unread messages:', err);
    }
  };

  const setupMessageSubscription = () => {
    const subscription = supabase
      .channel('all_messages_notification_bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Only refresh count if message is from someone else
          if (payload.new.user_id !== user.id) {
            console.log('[NotificationBell] New message received, refreshing counts');
            fetchUnreadMessages();
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
          // Refresh unread counts when user marks threads as read
          fetchUnreadMessages();
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
          // Refresh unread counts when user marks threads as read
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };


  return (
    <div className="relative">
      {/* Bell Icon Button - Navigates to chat */}
      <button
        onClick={() => navigate('/chat')}
        className="relative p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        aria-label="Messages"
      >
        <Bell className="w-5 h-5" />

        {/* Chat Message Badge - Shows unread chat messages count */}
        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
          </span>
        )}
      </button>
    </div>
  );
}