import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/authUtils';

export default function NotificationBell() {
  const [pendingCount, setPendingCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('NotificationBell component mounted');
    loadNotifications();
    setupRealtimeSubscription();
  }, []);

  const loadNotifications = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (!currentUser) return;
      
      setUser(currentUser);
      
      // Load pending invitations received
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name
          )
        `)
        .eq('friend_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setInvitations(data);
        setPendingCount(data.length);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const setupRealtimeSubscription = async () => {
    const { user: currentUser } = await getCurrentUser();
    if (!currentUser) return;

    // Subscribe to changes in user_connections
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_connections',
          filter: `friend_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Notification received:', payload);
          // Reload notifications when changes occur
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleViewInvitation = (invitation) => {
    setShowDropdown(false);
    // Navigate to chat page with the invitation highlighted
    navigate(`/chat?invitation=${invitation.id}`);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Notification Badge */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
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
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Notifications
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {invitations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No new notifications
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleViewInvitation(invitation)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-scout-accent-100 dark:bg-scout-accent-900 rounded-full flex items-center justify-center">
                        <span className="text-scout-accent-700 dark:text-scout-accent-300 font-medium">
                          {invitation.user?.full_name?.charAt(0) || invitation.user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {invitation.user?.full_name || invitation.user?.email || 'Someone'} wants to connect
                        </p>
                        {invitation.message && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            "{invitation.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {invitations.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/chat');
                  }}
                  className="w-full text-center text-sm text-scout-accent-600 hover:text-scout-accent-700 font-medium"
                >
                  View all in Chat
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}