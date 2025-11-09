// Updated QuickNav.jsx - FIXED 09JUN25: REMOVED ALL FUCKING ICONS
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { getCurrentUser, signOut } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import '../styles/fonts.css';
import SearchModal from './search/SearchModal';

const QuickNav = React.memo(function QuickNav({ isOpen: propIsOpen, onClose }) {
  // Use props if provided, otherwise manage state internally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Auto-expand admin section when on admin pages
  const isOnAdminPage = location.pathname.startsWith('/admin');

  // Initialize adminExpanded from localStorage, or auto-expand if on admin page
  const [adminExpanded, setAdminExpanded] = useState(() => {
    const stored = localStorage.getItem('s2r_admin_expanded');
    if (stored !== null) {
      return stored === 'true' || isOnAdminPage;
    }
    return isOnAdminPage;
  });

  const scrollContainerRef = useRef(null);

  // Note: Removed location change effect as it was causing immediate closes

  // Auto-scroll to top when menu opens
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Update admin expanded state when navigating to/from admin pages
  useEffect(() => {
    if (isOnAdminPage && !adminExpanded) {
      setAdminExpanded(true);
    }
  }, [isOnAdminPage]);

  // Persist adminExpanded state to localStorage
  useEffect(() => {
    localStorage.setItem('s2r_admin_expanded', String(adminExpanded));
  }, [adminExpanded]);

  // Load user and check for pending invitations and unread messages
  // PERFORMANCE FIX: Only load once, ignore duplicate auth events
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return; // Already loaded
    hasLoadedRef.current = true;
    loadUserAndInvites();
    loadUnreadMessages();

    // Listen for auth state changes - ONLY respond to SIGNED_IN once
    let hasSignedIn = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !hasSignedIn) {
        hasSignedIn = true;
        loadUserAndInvites();
        loadUnreadMessages();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const loadUnreadMessages = async () => {
    // DISABLED: chat_threads query causing 500 errors (RLS policy issue)
    // Temporarily disabled to prevent console errors
    setUnreadMessagesCount(0);
  };

  const loadUserAndInvites = async () => {
    try {
      const { user: currentUser, profile } = await getCurrentUser();
      if (currentUser && profile) {
        // Check if user is admin from database profile - check both old and new fields
        const hasAdminRole = profile.admin_role === 'executive_admin' ||
                             profile.admin_role === 'assistant_admin';
        const hasLegacyAdmin = profile.is_admin === true;
        setIsAdmin(hasAdminRole || hasLegacyAdmin);

        // Also track if user is specifically an executive admin
        setIsExecutiveAdmin(profile.admin_role === 'executive_admin');

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
                        <p className={`text-sm ${uiConfig.colors.hint}`}>{senderName} wants to connect</p>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = '/chat';
                          toast.dismiss(t.id);
                        }}
                        className={`ml-4 text-sm font-medium ${uiConfig.colors.accent} hover:opacity-80 ${uiConfig.animation.transition}`}
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
        handleClose();
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
  }, [isOpen, handleClose]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClose]);

  // FIXED 09JUN25: Clean navigation items - NO MORE SVG ICON BULLSHIT
  const navItems = [
    { path: 'search', label: 'Search', isModal: true, special: true },
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
      {/* Hamburger toggle button - only show when QuickNav manages its own state and menu is closed */}
      {propIsOpen === undefined && !isOpen && (
        <button
          onClick={() => setInternalIsOpen(!internalIsOpen)}
          className={`nav-toggle fixed top-3 right-3 ${uiConfig.header.zIndex.hamburgerButton} p-2 ${uiConfig.layout.radius.md} ${uiConfig.colors.card} ${uiConfig.layout.shadow.md}`}
          aria-label="Open menu"
        >
          {/* Hamburger icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${uiConfig.colors.heading}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/30 ${uiConfig.header.zIndex.dropdown} ${uiConfig.animation.transition}`}
          onClick={handleClose}
        />
      )}

      {/* Slide-out navigation menu with highest z-index */}
      <div
        className={`nav-menu fixed top-0 h-full ${uiConfig.colors.card} ${uiConfig.layout.shadow.lg} ${uiConfig.header.zIndex.mobileMenu} w-64 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          right: 0
        }}
      >
        {/* Fixed Header */}
        <div className="px-3 sm:px-4 border-b border-gray-200 dark:border-gray-700" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="h-12 sm:h-14 flex items-center justify-between">
            <h2 className={`text-lg sm:text-xl font-bold ${uiConfig.colors.heading} s2r-logo`}>
              Scout<span className={uiConfig.colors.brandOrange}>2</span>Retire
            </h2>
            {/* Gear icon for admin panel - only visible for admins */}
            {isAdmin && (
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className={`p-1.5 -mr-1 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${uiConfig.colors.hoverBg}`}
                aria-label="Toggle admin menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${adminExpanded ? 'text-scout-orange-500' : uiConfig.colors.muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
          <nav className="space-y-0.5 sm:space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path && item.label !== 'Preferences';

              // Handle search modal
              if (item.isModal) {
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setSearchModalOpen(true);
                      handleClose();
                    }}
                    className={`w-full flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${uiConfig.colors.hoverBg} text-left`}
                  >
                    <span className={`font-medium ${item.special ? 'text-scout-orange-500' : ''}`}>
                      🔍 {item.label}
                    </span>
                  </button>
                );
              }

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
                    className={`w-full flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${uiConfig.colors.hoverBg} text-left`}
                  >
                    <span className={`font-medium ${item.special ? 'text-scout-orange-500' : ''}`}>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    isActive
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : item.special
                      ? uiConfig.colors.hoverBg
                      : `${uiConfig.colors.body} ${uiConfig.colors.hoverBg}`
                  }`}
                >
                  {/* FIXED 09JUN25: REMOVED span with mr-3 and item.icon - NO MORE ICONS! */}
                  <span className={`font-medium ${item.special ? 'text-scout-orange-500' : ''}`}>{item.label}</span>
                  {/* Show badge for pending invitations + unread messages on Chat */}
                  {item.path === '/chat' && (pendingInvitesCount + unreadMessagesCount) > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold ${uiConfig.colors.btnDanger} rounded-full`}>
                      {(pendingInvitesCount + unreadMessagesCount) > 9 ? '9+' : (pendingInvitesCount + unreadMessagesCount)}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Admin Section - Only visible for admin users and when expanded */}
            {isAdmin && adminExpanded && (
              <>
                <div className={`border-t ${uiConfig.colors.border} my-2 sm:my-4`}></div>
                <div className={`px-2 sm:px-3 py-1 sm:py-2 text-base sm:text-xl font-bold s2r-logo`}>
                  S<span className={uiConfig.colors.brandOrange}>2</span>R Admin
                </div>
                <Link
                  to="/admin/towns-manager"
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    location.pathname === '/admin/towns-manager'
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : `${uiConfig.colors.hoverBg}`
                  }`}
                >
                  <span className="font-medium text-scout-orange-500">Towns-Manager</span>
                </Link>
                <Link
                  to="/admin/region-manager"
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    location.pathname === '/admin/region-manager'
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : `${uiConfig.colors.hoverBg}`
                  }`}
                >
                  <span className="font-medium text-scout-orange-500">Region-Manager</span>
                </Link>
                {/* Algorithm Manager - Only visible for executive admins */}
                {isExecutiveAdmin && (
                  <Link
                    to="/admin/algorithm"
                    className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                      location.pathname === '/admin/algorithm'
                        ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                        : `${uiConfig.colors.hoverBg}`
                    }`}
                  >
                    <span className="font-medium text-scout-orange-500">Algorithm Manager</span>
                  </Link>
                )}
                <Link
                  to="/admin/paywall"
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    location.pathname === '/admin/paywall'
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : `${uiConfig.colors.hoverBg}`
                  }`}
                >
                  <span className="font-medium text-scout-orange-500">User Manager & Paywall</span>
                </Link>
                <Link
                  to="/admin/data-verification"
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    location.pathname === '/admin/data-verification'
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : `${uiConfig.colors.hoverBg}`
                  }`}
                >
                  <span className="font-medium text-scout-orange-500">Data Verification</span>
                </Link>
                <Link
                  to="/admin/templates"
                  className={`flex items-center justify-between p-2 sm:p-3 text-sm sm:text-base ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    location.pathname === '/admin/templates'
                      ? `${uiConfig.colors.success} ${uiConfig.colors.statusSuccess}`
                      : `${uiConfig.colors.hoverBg}`
                  }`}
                >
                  <span className="font-medium text-scout-orange-500">Template Manager</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Fixed Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm ${uiConfig.colors.muted} text-center`}>
            &copy; 2025 Scout2Retire
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

    </>
  );
});

export default QuickNav;