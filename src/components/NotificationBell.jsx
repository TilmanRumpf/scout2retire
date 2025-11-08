import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/authUtils';

const NotificationBell = React.memo(function NotificationBell() {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // PERFORMANCE FIX: Only load once
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadUser();

    // Listen for auth state changes - ONLY respond once
    let hasSignedIn = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !hasSignedIn) {
        hasSignedIn = true;
        loadUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      // DISABLED: chat_threads query causing 500 errors (RLS policy issue)
      // fetchUnreadMessages();
      // const unsubscribeMessages = setupMessageSubscription();
      // return () => {
      //   unsubscribeMessages();
      // };

      // Set to 0 to avoid HTTP errors in console
      setUnreadMessagesCount(0);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchUnreadMessages and setupMessageSubscription use user internally

  const loadUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('[NotificationBell] Error loading user:', error);
    }
  };


  const fetchUnreadMessages = async () => {
    try {
      // CRITICAL: Verify we have an authenticated session FIRST
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUnreadMessagesCount(0);
        return;
      }

      // Get all thread IDs (simplified query to avoid 500 errors from complex joins)
      const { data: threads, error: threadsError } = await supabase
        .from('chat_threads')
        .select('id');

      if (threadsError) {
        // Silent error handling: RLS policy may have issues
        // Gracefully fail without console spam - chat is optional feature
        setUnreadMessagesCount(0);
        return;
      }

      if (!threads || threads.length === 0) {
        setUnreadMessagesCount(0);
        return;
      }

      // Use the database function to get unread counts (more efficient)
      const threadIds = threads.map(t => t.id);
      const { data: unreadCounts, error: unreadError } = await supabase
        .rpc('get_unread_counts', { p_thread_ids: threadIds });

      if (unreadError) {
        // Silent error handling: RPC function may not exist
        // Gracefully set to 0 without console spam
        setUnreadMessagesCount(0);
        return;
      }

      // Sum up all unread counts
      let totalUnread = 0;
      (unreadCounts || []).forEach(item => {
        totalUnread += item.unread_count || 0;
      });

      setUnreadMessagesCount(totalUnread);
    } catch (err) {
      // Silent error handling: Catch-all for unexpected errors
      // Set to 0 to avoid broken UI
      setUnreadMessagesCount(0);
    }
  };

  const setupMessageSubscription = () => {
    if (!user) return () => {};

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
});

export default NotificationBell;