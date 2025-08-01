// Updated QuickNav.jsx - FIXED 09JUN25: REMOVED ALL FUCKING ICONS
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { getCurrentUser, signOut } from '../utils/authUtils';
import toast from 'react-hot-toast';
import '../styles/fonts.css';

export default function QuickNav({ isOpen: propIsOpen, onClose }) {
  // Use props if provided, otherwise manage state internally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  // Note: Removed location change effect as it was causing immediate closes

  // Load user and check for pending invitations
  useEffect(() => {
    loadUserAndInvites();
  }, []);

  const loadUserAndInvites = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        
        // Check for pending invitations
        const { data, error } = await supabase
          .from('user_connections')
          .select('id')
          .eq('friend_id', currentUser.id)
          .eq('status', 'pending');
        
        if (!error && data) {
          setPendingInvitesCount(data.length);
        }
        
        // Set up real-time subscription for new invitations
        const subscription = supabase
          .channel('user_invitations')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_connections',
              filter: `friend_id=eq.${currentUser.id}`
            },
            async (payload) => {
              if (payload.new.status === 'pending') {
                setPendingInvitesCount(prev => prev + 1);
                
                // Get sender's name for the toast
                try {
                  const { data: senderData } = await supabase.rpc('get_user_by_id', { 
                    user_id: payload.new.user_id 
                  });
                  const senderName = senderData?.[0]?.full_name || senderData?.[0]?.email || 'Someone';
                  
                  // Show toast notification
                  toast((t) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Friend Request!</p>
                        <p className="text-sm text-gray-600">{senderName} wants to connect</p>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = '/chat';
                          toast.dismiss(t.id);
                        }}
                        className="ml-4 text-sm font-medium text-scout-accent-500 hover:text-scout-accent-600"
                      >
                        View
                      </button>
                    </div>
                  ), {
                    duration: 6000,
                    icon: '👥',
                  });
                } catch (error) {
                  console.error('Error getting sender info:', error);
                }
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_connections',
              filter: `friend_id=eq.${currentUser.id}`
            },
            (payload) => {
              // If invitation was accepted/declined, decrease count
              if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
                setPendingInvitesCount(prev => Math.max(0, prev - 1));
              }
            }
          )
          .subscribe();
        
        return () => {
          subscription.unsubscribe();
        };
      }
    } catch (error) {
      console.error('Error loading user or invites:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      // Check if click is outside the nav and not on the toggle button
      if (!event.target.closest('.nav-menu') && 
          !event.target.closest('.nav-toggle')) {
        if (onClose) {
          onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    // Add listener after a small delay to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]); // onClose is stable and only changes if parent component changes

  // FIXED 09JUN25: Clean navigation items - NO MORE SVG ICON BULLSHIT
  const navItems = [
    { path: '/daily', label: 'Today' },
    { path: '/discover', label: 'Discover' },
    { path: '/favorites', label: 'Favorites' },
    { path: '/compare', label: 'Compare' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/chat', label: 'Chat' },
    { path: '/scotty', label: 'Scotty AI', special: true },
    { path: '/journal', label: 'Journal' },
    { path: '/profile', label: 'Profile' },
    { path: '/onboarding/current-status', label: 'Preferences', special: true },
    { path: 'logout', label: 'Logout', special: true }
  ];

  return (
    <>
      {/* Hamburger toggle button - only show when QuickNav manages its own state */}
      {propIsOpen === undefined && (
        <button
          onClick={() => setInternalIsOpen(!internalIsOpen)}
          className="nav-toggle fixed top-3 right-3 z-[100] p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            // X icon when menu is open
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon when menu is closed
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          style={{ zIndex: 10000 }}
          onClick={handleClose}
        />
      )}

      {/* Slide-out navigation menu with highest z-index */}
      <div
        className="nav-menu fixed top-0 h-full bg-white dark:bg-gray-800 shadow-lg w-64"
        style={{ 
          zIndex: 10001,
          right: isOpen ? '0' : '-256px',
          transition: 'right 0.3s ease-in-out'
        }}
      >
        <div className="px-4 pb-6">
          <div className="h-9 flex items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white s2r-logo">
              Scout<span style={{ color: '#f66527' }}>2</span>Retire
            </h2>
          </div>
          <nav className="space-y-1 mt-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path && item.label !== 'Preferences';
              
              // Handle logout as a button instead of Link
              if (item.path === 'logout') {
                return (
                  <button
                    key={item.path}
                    onClick={async () => {
                      const result = await signOut();
                      if (result.success) {
                        navigate('/welcome');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  >
                    <span className={`font-medium ${item.special ? 'text-[#f66527]' : ''}`}>{item.label}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                    isActive
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : item.special
                      ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* FIXED 09JUN25: REMOVED span with mr-3 and item.icon - NO MORE ICONS! */}
                  <span className={`font-medium ${item.special ? 'text-[#f66527]' : ''}`}>{item.label}</span>
                  {/* Show badge for pending invitations on Chat */}
                  {item.path === '/chat' && pendingInvitesCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {pendingInvitesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              &copy; 2025 Scout2Retire
            </div>
          </div>
        </div>
      </div>

    </>
  );
}