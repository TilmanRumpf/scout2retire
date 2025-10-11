import { useEffect } from 'react';
import supabase from '../utils/supabaseClient';

/**
 * useChatSubscriptions - Real-time subscriptions for chat
 * Extracted from Chat.jsx
 */
export function useChatSubscriptions({
  user,
  threads,
  activeThread,
  loadUnreadCounts,
  setMessages,
  messagesEndRef,
  isInitialMount
}) {
  // Subscribe to new messages in active thread
  useEffect(() => {
    if (!activeThread) return;

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
          if (payload.new.user_id === user?.id) return;

          try {
            const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: payload.new.user_id });
            const userInfo = userData?.[0];

            const formattedMessage = {
              ...payload.new,
              user_name: userInfo?.username || 'Anonymous'
            };

            setMessages(prev => [...prev, formattedMessage]);
          } catch (error) {
            console.error("Error fetching user for new message:", error);
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
  }, [activeThread, user, setMessages]);

  // Subscribe to ALL new messages for unread count updates
  useEffect(() => {
    if (!user) return;

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
          if (payload.new.user_id === user.id) return;
          if (activeThread && payload.new.thread_id === activeThread.id) return;

          // This would need setUnreadCounts to be passed
          // For now, we'll trigger a reload
          if (threads.length > 0) {
            loadUnreadCounts(threads);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeThread, threads, loadUnreadCounts]);

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
          if (payload.new.user_id !== user.id) {
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
          loadUnreadCounts(threads);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, threads, loadUnreadCounts]);

  // Scroll to bottom only for NEW messages, not initial load
  useEffect(() => {
    if (isInitialMount.current) {
      if (setMessages.length > 0) {
        isInitialMount.current = false;
      }
      return;
    }

    if (setMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [setMessages, messagesEndRef, isInitialMount]);

  return null; // This hook only manages side effects
}
