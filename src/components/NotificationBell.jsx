import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import supabase from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/authUtils';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
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
      console.log('[NotificationBell] User exists, fetching notifications and messages');
      fetchNotifications();
      fetchUnreadMessages();
      const unsubscribe = setupRealtimeSubscription();
      const unsubscribeMessages = setupMessageSubscription();
      return () => {
        unsubscribe();
        unsubscribeMessages();
      };
    } else {
      console.log('[NotificationBell] No user yet');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchNotifications, fetchUnreadMessages, setupRealtimeSubscription, and setupMessageSubscription use user internally

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      
      // Get unread count
      const { data: countData, error: countError } = await supabase
        .rpc('get_unread_notification_count');
      
      if (!countError && countData !== null) {
        setUnreadCount(countData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If notifications table doesn't exist, fallback gracefully
      if (error.code === '42P01') {
        console.log('Notifications table not yet created');
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
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

      // Get all threads
      const { data: threads, error: threadsError } = await supabase
        .from('chat_threads')
        .select('id');

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

      // Get unread counts for all threads
      const threadIds = threads.map(t => t.id);
      console.log('[NotificationBell] Thread IDs:', threadIds);

      const { data: counts, error: countsError } = await supabase.rpc('get_unread_counts', {
        p_thread_ids: threadIds
      });

      console.log('[NotificationBell] RPC get_unread_counts result:', { counts, countsError });

      if (countsError) {
        console.error('[NotificationBell] Error fetching unread counts:', countsError);
        return;
      }

      // Sum all unread counts
      const totalUnread = counts?.reduce((sum, item) => sum + (item.unread_count || 0), 0) || 0;
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
          // Only increment if message is from someone else
          if (payload.new.user_id !== user.id) {
            setUnreadMessagesCount(prev => prev + 1);
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

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Add new notification to the list
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast for new notification
          toast(payload.new.title, {
            icon: getNotificationIcon(payload.new.type),
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_read', { notification_id: notificationId });
      
      if (error) throw error;
      
      if (data) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_read');
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
      );
      setUnreadCount(0);
      
      if (data > 0) {
        toast.success(`Marked ${data} notifications as read`);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_match: '🎯',
      favorite_update: '⭐',
      price_change: '💰',
      new_feature: '✨',
      weekly_digest: '📊',
      friend_activity: '👥',
      system: '🔔'
    };
    return icons[type] || '🔔';
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on link or type
    if (notification.link) {
      navigate(notification.link);
      setShowDropdown(false);
    } else if (notification.town_id) {
      navigate(`/discover?town=${notification.town_id}`);
      setShowDropdown(false);
    } else if (notification.type === 'friend_activity' && notification.related_user_id) {
      navigate('/chat');
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />

        {/* Notification Badge - Combined count of notifications + messages */}
        {/* DEBUG: ALWAYS show badge with counts for debugging */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
          {unreadCount + unreadMessagesCount}
        </span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-sm text-scout-accent-500 hover:text-scout-accent-600 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-pulse">Loading notifications...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you of new matches and updates</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-scout-accent-50/20 dark:bg-scout-accent-400/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-scout-accent-500 rounded-full mt-2" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          {notification.town_id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/discover?town=${notification.town_id}`);
                                setShowDropdown(false);
                              }}
                              className="text-xs text-scout-accent-500 hover:text-scout-accent-600 font-medium"
                            >
                              View Town →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 3 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // TODO: Create a dedicated notifications page
                    toast('Full notifications page coming soon!', { icon: '🚧' });
                  }}
                  className="w-full text-center text-sm text-scout-accent-500 hover:text-scout-accent-600 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}