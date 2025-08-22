import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Heart, 
  Calendar, 
  User,
  Search,
  MessageCircle,
  BookOpen,
  Settings
} from 'lucide-react';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/daily', icon: Home, label: 'Daily' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/comparison', icon: MapPin, label: 'Compare' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/scotty', icon: Settings, label: 'Scotty' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="mobile-nav-container">
      <style>{`
        .mobile-nav-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, 
            rgba(255, 255, 255, 0.98), 
            rgba(255, 255, 255, 0.95)
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding: 8px;
          z-index: 50;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          max-width: 500px;
          margin: 0 auto;
        }

        .nav-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 4px;
          min-height: 48px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .nav-button:active {
          transform: scale(0.95);
        }

        .nav-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }

        .nav-button.active .nav-icon,
        .nav-button.active .nav-label {
          color: white;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          margin-bottom: 2px;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          color: #6b7280;
          transition: color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* 360×800 (Small Android) - Most restrictive */
        @media (max-width: 360px) {
          .mobile-nav-container {
            padding: 6px 4px;
          }
          
          .nav-grid {
            gap: 5px;
          }
          
          .nav-button {
            padding: 8px 2px;
            min-height: 44px;
            border-radius: 10px;
          }
          
          .nav-icon {
            width: 18px;
            height: 18px;
          }
          
          .nav-label {
            font-size: 10px;
          }
        }

        /* 361-389px (Transition zone) */
        @media (min-width: 361px) and (max-width: 389px) {
          .mobile-nav-container {
            padding: 7px 5px;
          }
          
          .nav-grid {
            gap: 6px;
          }
          
          .nav-button {
            padding: 9px 3px;
            min-height: 46px;
          }
          
          .nav-label {
            font-size: 11px;
          }
        }

        /* 390×844 (iPhone 12/13/14) */
        @media (min-width: 390px) and (max-width: 392px) {
          .mobile-nav-container {
            padding: 8px 6px;
          }
          
          .nav-grid {
            gap: 7px;
          }
          
          .nav-button {
            padding: 10px 4px;
            min-height: 48px;
          }
          
          .nav-icon {
            width: 20px;
            height: 20px;
          }
          
          .nav-label {
            font-size: 12px;
          }
        }

        /* 393×873 (iPhone 15 Pro) */
        @media (min-width: 393px) and (max-width: 411px) {
          .mobile-nav-container {
            padding: 8px 7px;
          }
          
          .nav-grid {
            gap: 8px;
          }
          
          .nav-button {
            padding: 11px 5px;
            min-height: 50px;
          }
          
          .nav-icon {
            width: 21px;
            height: 21px;
          }
          
          .nav-label {
            font-size: 12px;
            font-weight: 500;
          }
        }

        /* 412×915 (Larger Android) */
        @media (min-width: 412px) and (max-width: 428px) {
          .mobile-nav-container {
            padding: 10px 8px;
          }
          
          .nav-grid {
            gap: 9px;
          }
          
          .nav-button {
            padding: 12px 6px;
            min-height: 52px;
          }
          
          .nav-icon {
            width: 22px;
            height: 22px;
            margin-bottom: 3px;
          }
          
          .nav-label {
            font-size: 13px;
            font-weight: 500;
          }
        }

        /* 428px+ (iPhone 14 Pro Max and larger) */
        @media (min-width: 428px) {
          .mobile-nav-container {
            padding: 10px;
          }
          
          .nav-grid {
            gap: 10px;
          }
          
          .nav-button {
            padding: 12px 8px;
            min-height: 54px;
          }
          
          .nav-icon {
            width: 24px;
            height: 24px;
            margin-bottom: 4px;
          }
          
          .nav-label {
            font-size: 13px;
            font-weight: 600;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .mobile-nav-container {
            background: linear-gradient(to top, 
              rgba(17, 24, 39, 0.98), 
              rgba(17, 24, 39, 0.95)
            );
            border-top-color: rgba(255, 255, 255, 0.1);
          }
          
          .nav-button {
            background: rgba(31, 41, 55, 0.8);
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .nav-button.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .nav-icon:not(.active .nav-icon),
          .nav-label:not(.active .nav-label) {
            color: #9ca3af;
          }
        }

        /* Landscape orientation adjustments */
        @media (orientation: landscape) and (max-height: 500px) {
          .mobile-nav-container {
            padding: 4px;
          }
          
          .nav-button {
            min-height: 40px;
            padding: 6px 2px;
          }
          
          .nav-icon {
            width: 16px;
            height: 16px;
            margin-bottom: 1px;
          }
          
          .nav-label {
            font-size: 10px;
          }
        }

        /* Safe area insets for modern phones */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .mobile-nav-container {
            padding-bottom: calc(8px + env(safe-area-inset-bottom));
          }
        }

        /* Hover effects for devices with hover capability */
        @media (hover: hover) {
          .nav-button:hover {
            background: rgba(99, 102, 241, 0.05);
            border-color: rgba(99, 102, 241, 0.2);
          }
          
          .nav-button:hover .nav-icon,
          .nav-button:hover .nav-label {
            color: #6366f1;
          }
          
          .nav-button.active:hover {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          }
        }

        /* Accessibility: High contrast mode */
        @media (prefers-contrast: high) {
          .nav-button {
            border-width: 2px;
          }
          
          .nav-label {
            font-weight: 600;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .nav-button {
            transition: none;
          }
        }
      `}</style>

      <nav className="nav-grid" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`nav-button ${active ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="nav-icon" aria-hidden="true" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;