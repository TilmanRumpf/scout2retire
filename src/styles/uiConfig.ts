// src/styles/uiConfig.ts
// Scout2Retire Design Tokens & UI Configuration - Updated 10JUN25
// Fixed: Using scout-accent colors to match Tailwind config

export const colors = {
  // Backgrounds - iOS-optimized dark mode
  page: 'bg-gray-50 dark:bg-gray-950',
  card: 'bg-white dark:bg-gray-900',
  modal: 'bg-white dark:bg-gray-900',
  input: 'bg-white dark:bg-gray-800',
  tabActive: 'bg-scout-accent-500 text-white dark:bg-scout-accent-400',
  tabInactive: 'bg-white dark:bg-gray-800 text-scout-accent-600 dark:text-scout-accent-300',

  // Text - Improved dark mode contrast
  heading: 'text-gray-900 dark:text-gray-50',
  body: 'text-gray-700 dark:text-gray-200',
  hint: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
  accent: 'text-scout-accent-600 dark:text-scout-accent-300',
  brandOrange: 'text-scout-orange-500 dark:text-scout-orange-400',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-scout-accent-600 dark:text-scout-accent-300',

  // Border - iOS-style subtle borders
  border: 'border-gray-200 dark:border-gray-700',
  borderLight: 'border-gray-100 dark:border-gray-800',
  borderActive: 'border-scout-accent-500 dark:border-scout-accent-400',
  borderDanger: 'border-red-500 dark:border-red-400',
  borderSuccess: 'border-scout-accent-400 dark:border-scout-accent-300',

  // Buttons - Toned down dark mode colors
  btnPrimary: 'bg-scout-accent-500 text-white hover:bg-scout-accent-600 dark:bg-scout-accent-400 dark:hover:bg-scout-accent-500 transition-colors',
  btnSecondary: 'bg-scout-accent-100 dark:bg-gray-800 text-scout-accent-700 dark:text-scout-accent-300 hover:bg-scout-accent-200 dark:hover:bg-gray-700 transition-colors',
  btnDanger: 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 transition-colors',
  btnNeutral: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',

  // Toggles - Softer dark mode colors
  toggleOn: 'bg-scout-accent-500 dark:bg-scout-accent-400',
  toggleOff: 'bg-gray-300 dark:bg-gray-700',
  toggleKnob: 'bg-white',

  // Match badges - Balanced dark mode
  badge: 'bg-scout-accent-100 text-scout-accent-800 dark:bg-scout-accent-900/30 dark:text-scout-accent-300',
  matchStrong: 'bg-scout-accent-500 text-white dark:bg-scout-accent-400',
  matchMedium: 'bg-yellow-500 text-white dark:bg-yellow-600',
  matchLow: 'bg-red-500 text-white dark:bg-red-600',

  // Status indicators - Subtle dark mode
  statusSuccess: 'bg-scout-accent-100 text-scout-accent-800 dark:bg-scout-accent-900/20 dark:text-scout-accent-300',
  statusWarning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  statusError: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  statusInfo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',

  // Focus states - iOS-style focus rings
  focusRing: 'focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-50 dark:focus:ring-scout-accent-500',
  focusRingDanger: 'focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 dark:focus:ring-red-500',
  
  // Hover states
  hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-700',
};

export const font = {
  family: `font-sans`, // Uses iOS system font stack from Tailwind
  size: {
    xs: 'text-xs',     // 12px
    sm: 'text-sm',     // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',     // 18px
    xl: 'text-xl',     // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
    '4xl': 'text-4xl', // 36px
  },
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
};

export const layout = {
  spacing: {
    // iOS 8-point grid spacing
    page: 'px-4 py-6',         // Standard page padding: 16px horizontal, 24px vertical
    section: 'py-6 px-4',      // 24px vertical, 16px horizontal
    card: 'p-6',               // 24px
    cardCompact: 'p-4',        // 16px
    field: 'mb-4',             // 16px
    fieldCompact: 'mb-2',      // 8px
    // Additional iOS spacing
    xs: 'p-1',                 // 4px
    sm: 'p-2',                 // 8px
    md: 'p-3',                 // 12px
    lg: 'p-4',                 // 16px
    xl: 'p-6',                 // 24px
    '2xl': 'p-8',              // 32px
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',          // 4px
    DEFAULT: 'rounded',        // 8px
    md: 'rounded-md',          // 10px
    lg: 'rounded-lg',          // 12px
    xl: 'rounded-xl',          // 16px
    '2xl': 'rounded-2xl',      // 20px
    full: 'rounded-full',
  },
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    DEFAULT: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    // Dark mode shadows
    'dark-sm': 'dark:shadow-dark-sm',
    'dark': 'dark:shadow-dark',
    'dark-md': 'dark:shadow-dark-md',
  },
  width: {
    container: 'max-w-4xl mx-auto w-full',
    containerWide: 'max-w-6xl mx-auto w-full',
    containerXL: 'max-w-7xl mx-auto w-full',        // Standard for main app pages
    containerNarrow: 'max-w-2xl mx-auto w-full',
    // Mobile-first widths
    mobile: 'max-w-sm mx-auto w-full',
    tablet: 'max-w-2xl mx-auto w-full',
    desktop: 'max-w-4xl mx-auto w-full',
  },
  logo: {
    // Standard logo sizes for consistent branding
    header: 'h-8',           // 32px - For UnifiedHeader
    headerMobile: 'h-6',     // 24px - For mobile headers
    welcome: 'h-10',         // 40px - For Welcome page
    large: 'h-12',           // 48px - For large displays
    icon: 'h-6 w-6',         // 24px - For icon-only displays
    favicon: 'h-4 w-4',      // 16px - For small inline usage
  }
};

export const animation = {
  // iOS-style timing functions
  transition: 'transition-all duration-200 ease-ios',
  transitionFast: 'transition-all duration-150 ease-ios',
  transitionSlow: 'transition-all duration-300 ease-ios',
  hover: 'transform hover:scale-105 transition-transform duration-200 ease-ios',
  // iOS animations
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  scaleIn: 'animate-scaleIn',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

export const icons = {
  default: 'lucide-react',
  size: {
    xs: 'w-3 h-3',     // 12px
    sm: 'w-4 h-4',     // 16px
    md: 'w-5 h-5',     // 20px
    lg: 'w-6 h-6',     // 24px
    xl: 'w-8 h-8',     // 32px
    '2xl': 'w-10 h-10', // 40px
    // Touch targets (minimum 44px)
    touch: 'w-11 h-11',
  }
};

// Step Navigation Patterns - Updated 10JUN25: Aligned with actual flow
export const stepNavigation = {
  styles: {
    // Container styles
    container: 'mb-8',
    iconRow: 'flex justify-center items-center space-x-4 mb-4',
    labelRow: 'flex justify-center items-center space-x-4',
    
    // Icon styles - Toned down dark mode
    icon: {
      base: 'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
      current: 'bg-scout-accent-500 text-white shadow-lg scale-110 dark:bg-scout-accent-400',
      completed: 'bg-scout-accent-400 text-white hover:bg-scout-accent-500 cursor-pointer hover:scale-105 dark:bg-scout-accent-500 dark:hover:bg-scout-accent-600',
      future: 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
    },
    
    // Label styles - Better contrast
    labels: {
      base: 'text-xs text-center w-12',
      current: 'text-scout-accent-600 dark:text-scout-accent-300 font-semibold',
      completed: 'text-scout-accent-500 dark:text-scout-accent-300',
      future: 'text-gray-400 dark:text-gray-500'
    }
  },
  
  // Different step configurations for different parts of app
  // Updated 10JUN25: Aligned with actual 6-step onboarding flow
  variants: {
    onboarding: {
      steps: [
        { 
          key: 'current_status', 
          label: 'Current Status', 
          path: '/onboarding/current-status',
          icon: 'MapPin'
        },
        { 
          key: 'region_preferences', 
          label: 'Region', 
          path: '/onboarding/region',
          icon: 'Globe'
        },
        { 
          key: 'climate_preferences', 
          label: 'Climate', 
          path: '/onboarding/climate',
          icon: 'CloudSun'
        },
        { 
          key: 'culture_preferences', 
          label: 'Culture', 
          path: '/onboarding/culture',
          icon: 'Users'
        },
        { 
          key: 'hobbies', 
          label: 'Hobbies', 
          path: '/onboarding/hobbies',
          icon: 'Heart'
        },
        { 
          key: 'budget', 
          label: 'Costs', 
          path: '/onboarding/costs',
          icon: 'DollarSign'
        }
      ]
    },
    
    townComparison: {
      steps: [
        { key: 'selection', label: 'Select' },
        { key: 'compare', label: 'Compare' },
        { key: 'analyze', label: 'Analyze' },
        { key: 'decide', label: 'Decide' }
      ]
    },
    
    townDetails: {
      steps: [
        { key: 'overview', label: 'Overview' },
        { key: 'lifestyle', label: 'Lifestyle' },
        { key: 'costs', label: 'Costs' },
        { key: 'requirements', label: 'Requirements' }
      ]
    }
  }
};

// Bottom Navigation Patterns - Updated 21JAN25 for consistency
export const bottomNavigation = {
  // Container configuration - SINGLE SOURCE OF TRUTH
  container: {
    // Base classes for all bottom navs
    base: 'fixed sm:sticky bottom-0 left-0 right-0 sm:relative border-t p-4 sm:mt-6 lg:mt-8',
    
    // Platform-specific backgrounds
    iosBackground: 'ios-navigation-bg', // Blur effect for iOS
    standardBackground: `${colors.card}`, // Regular card background
    
    // Border styling
    border: `${colors.borderLight}`,
    
    // Auto-hide animation classes
    autoHide: {
      visible: 'translate-y-0',
      hidden: 'translate-y-full sm:translate-y-0', // Only hide on mobile
      transition: 'transition-transform duration-300'
    },
    
    // Inner container for content
    innerContainer: 'max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto',
    
    // Button layout
    buttonLayout: 'flex items-center',
    
    // Helper to get full container classes
    getContainerClasses: (isIOS: boolean = false, isVisible: boolean = true) => {
      const background = isIOS ? bottomNavigation.container.iosBackground : bottomNavigation.container.standardBackground;
      const visibility = isVisible ? bottomNavigation.container.autoHide.visible : bottomNavigation.container.autoHide.hidden;
      return `${bottomNavigation.container.base} ${background} ${bottomNavigation.container.border} ${bottomNavigation.container.autoHide.transition} ${visibility}`;
    }
  },
  
  // Button styles (existing)
  styles: {
    container: 'flex justify-between items-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700',
    backButton: 'inline-flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2 transition-all duration-200',
    nextButton: 'inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-scout-accent-500 hover:bg-scout-accent-600 dark:bg-scout-accent-400 dark:hover:bg-scout-accent-500 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
  }
};

// Header/Top Navigation Configuration - Added 02AUG25
export const header = {
  // Heights for different header types
  heights: {
    mobile: 'h-14',        // 56px - Standard mobile header
    desktop: 'h-16',       // 64px - Desktop header
    withSearch: 'h-20',    // 80px - Header with search bar
    compact: 'h-12',       // 48px - Compact header
  },
  
  // Actual pixel values for padding calculations
  heightValues: {
    mobile: 56,
    desktop: 64,
    withSearch: 80,
    compact: 48,
  },
  
  // Content padding to prevent overlap
  contentPadding: {
    mobile: 'pt-14',       // Matches mobile header height
    desktop: 'pt-16',      // Matches desktop header height
    withSearch: 'pt-20',   // Matches header with search
    compact: 'pt-12',      // Matches compact header
  },
  
  // Header styles - using existing color tokens
  styles: {
    container: `${colors.card} ${layout.shadow.sm} sticky top-0 z-30`,
    innerContainer: 'max-w-7xl mx-auto px-4 py-3',
    title: `text-xl font-bold ${colors.heading}`,
    
    // For headers with back buttons
    withBackButton: 'flex items-center justify-between',
    backButton: `p-2 -ml-2 ${layout.radius.lg} ${colors.hoverBg} ${animation.transition}`,
    
    // For headers with actions
    actionButton: `p-2 ${layout.radius.lg} ${colors.hoverBg} ${animation.transition}`,
    actionIcon: `h-6 w-6 ${colors.muted}`,
  },
  
  // Z-index hierarchy
  zIndex: {
    header: 'z-30',           // Main header
    dropdown: 'z-40',         // Dropdowns from header
    mobileMenu: 'z-50',       // Mobile menu overlay
    hamburgerButton: 'z-[60]', // Hamburger button (higher than menu)
  }
};

// Enhanced Form Components - Updated 10JUN25: Match design system
export const components = {
  // Form inputs - Updated with scout-accent theme
  input: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent-600 transition-all duration-200',
  textarea: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent-600 resize-vertical transition-all duration-200',
  select: 'w-full py-2 px-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent-600 transition-all duration-200 text-sm',
  selectActive: 'w-full py-2 px-3 border-2 border-scout-accent-600 dark:border-scout-accent-500 rounded-lg bg-scout-accent-600 dark:bg-scout-accent-500 text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 transition-all duration-200 text-sm',
  
  // Checkboxes and radios - Updated 10JUN25: Scout-accent with proper styling
  checkbox: 'h-4 w-4 text-scout-accent-600 focus:ring-scout-accent-500 focus:ring-offset-0 border-2 border-gray-300 dark:border-gray-600 rounded transition-all duration-200',
  radio: 'h-4 w-4 text-scout-accent-600 focus:ring-scout-accent-500 focus:ring-offset-0 border-2 border-gray-300 dark:border-gray-600 transition-all duration-200',
  
  // Range sliders - Updated 10JUN25: Beautiful scout-accent sliders
  slider: {
    container: 'w-full mb-4',
    track: 'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer',
    fill: 'h-2 bg-scout-accent-600 rounded-full',
    thumb: 'appearance-none h-5 w-5 bg-scout-accent-600 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75',
    // CSS for webkit browsers
    webkit: `
      .slider::-webkit-slider-track {
        height: 8px;
        background: #e5e7eb;
        border-radius: 9999px;
      }
      .dark .slider::-webkit-slider-track {
        background: #374151;
      }
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        background: #8fbc8f;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
      }
      .slider::-webkit-slider-thumb:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
      }
    `
  },
  
  // Toggle switches - Updated 10JUN25: Scout-accent toggles
  toggle: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-scout-accent-500 focus:ring-offset-2',
  toggleKnob: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
  toggleOn: 'bg-scout-accent-500 dark:bg-scout-accent-400',
  toggleOff: 'bg-gray-300 dark:bg-gray-700',
  
  // Button sizes - SINGLE SOURCE OF TRUTH
  buttonSizes: {
    xs: 'py-1 px-2 text-xs',         // 24px height - Absolute minimum
    sm: 'py-1.5 px-2.5 text-sm',     // 32px height - Compact desktop
    default: 'py-2 px-3 text-sm',    // 36px height - STANDARD SIZE
    md: 'py-2.5 px-4 text-sm',       // 44px height - iOS minimum touch
    lg: 'py-3 px-6 text-base',       // 48px height - ONLY when required
  },
  
  // Button variants - Using standard size from buttonSizes.default
  buttonVariants: {
    primary: 'py-2 px-3 rounded-lg border-2 border-transparent text-sm font-medium text-center transition-all duration-200 bg-scout-accent-500 text-white hover:bg-scout-accent-600 dark:bg-scout-accent-400 dark:hover:bg-scout-accent-500 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2',
    secondary: 'py-2 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-center transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-scout-accent-300 dark:hover:border-scout-accent-400 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2',
    selected: 'py-2 px-3 rounded-lg border-2 border-scout-accent-600 text-sm font-medium text-center transition-all duration-200 bg-scout-accent-600 dark:bg-scout-accent-500 text-white',
    unselected: 'py-2 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-center transition-all duration-200 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-scout-accent-300 dark:hover:border-scout-accent-400 focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2'
  },
  
  // File inputs
  fileInput: 'block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-scout-accent-50 file:text-scout-accent-700 hover:file:bg-scout-accent-100',
  
  // Search inputs
  searchInput: 'w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent-600',
  
  // Form groups
  formGroup: 'mb-6',
  formGroupCompact: 'mb-4',
  
  // Labels - Updated 10JUN25: Better spacing and typography
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3',
  labelRequired: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 after:content-["*"] after:ml-0.5 after:text-red-500',
  
  // Help text
  helpText: 'mt-2 text-xs text-gray-500 dark:text-gray-400',
  errorText: 'mt-2 text-xs text-red-600 dark:text-red-400',
  
  // Buttons - Using standard size (py-2 px-3)
  button: 'inline-flex items-center px-3 py-2 border border-transparent rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  buttonPrimary: 'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-scout-accent-500 hover:bg-scout-accent-600 dark:bg-scout-accent-400 dark:hover:bg-scout-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scout-accent-400 transition-colors',
  buttonSecondary: 'inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors',
  
  // Cards
  card: 'bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg',
  cardHeader: 'px-4 py-5 sm:px-6',
  cardBody: 'px-4 py-5 sm:p-6',
  cardFooter: 'px-4 py-4 sm:px-6',
  
  // Modal overlays
  modalOverlay: 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
  modalContainer: 'fixed inset-0 z-10 overflow-y-auto',
  modalPanel: 'relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all',
  
  // Navigation
  nav: 'bg-white dark:bg-gray-800 shadow',
  navItem: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors',
  navItemActive: 'text-scout-accent-600 bg-scout-accent-100 dark:bg-scout-accent-900 px-3 py-2 rounded-md text-sm font-medium',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
  tableHeader: 'bg-gray-50 dark:bg-gray-800',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  tableBody: 'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700',
  tableRow: 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
};

// Financial data display colors - Updated 10JUN25: Scout-accent theme
export const financial = {
  positive: 'text-scout-accent-600 dark:text-scout-accent-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
  highlight: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  currency: 'font-medium text-gray-900 dark:text-white',
  percentage: 'text-sm font-medium',
};

// Progress bars and score indicators - Updated 10JUN25: Scout-accent theme
export const progress = {
  bar: 'bg-scout-accent-200 dark:bg-scout-accent-800',
  fill: 'bg-scout-accent-600 transition-all duration-300',
  track: 'bg-gray-200 dark:bg-gray-700',
  low: 'bg-red-400',
  medium: 'bg-yellow-400', 
  high: 'bg-scout-accent-600',
  complete: 'bg-scout-accent-600',
};

// Form validation states - Updated 10JUN25: Scout-accent theme
export const validation = {
  valid: 'border-scout-accent-400 bg-scout-accent-50 dark:bg-scout-accent-950 dark:border-scout-accent-600',
  invalid: 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-600',
  warning: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600',
  neutral: 'border-gray-300 dark:border-gray-600',
};

// Notification system - Updated 10JUN25: Scout-accent theme
export const notifications = {
  success: 'bg-scout-accent-100 border-scout-accent-400 text-scout-accent-800 dark:bg-scout-accent-900 dark:border-scout-accent-600 dark:text-scout-accent-200',
  error: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
  info: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
};

// Interactive component states - Updated 10JUN25: Scout-accent theme
export const states = {
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'opacity-75 cursor-wait animate-pulse',
  active: 'bg-scout-accent-100 border-scout-accent-400 dark:bg-scout-accent-800 dark:border-scout-accent-600',
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  selected: 'bg-scout-accent-600 text-white',
};

// Responsive breakpoints
export const responsive = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:'
};

// Internationalization utilities
export const i18n = {
  // Auto-detect user's locale from browser/device
  getUserLocale: () => {
    if (typeof navigator !== 'undefined') {
      return navigator.language || navigator.languages?.[0] || 'en-US';
    }
    return 'en-US';
  },

  // Currency formatting based on locale
  formatCurrency: (amount: number, currency = 'USD', locale: string | null = null) => {
    const userLocale = locale || i18n.getUserLocale();
    try {
      return new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Fallback to USD formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  },

  // Number formatting (handles . vs , for decimals)
  formatNumber: (number: number, locale: string | null = null) => {
    const userLocale = locale || i18n.getUserLocale();
    return new Intl.NumberFormat(userLocale).format(number);
  },

  // Temperature conversion and formatting
  temperature: {
    // Convert Celsius to Fahrenheit
    celsiusToFahrenheit: (celsius: number) => (celsius * 9/5) + 32,
    
    // Convert Fahrenheit to Celsius  
    fahrenheitToCelsius: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
    
    // Format temperature based on user preference
    format: (tempCelsius: number, unit = 'auto', locale: string | null = null) => {
      const userLocale = locale || i18n.getUserLocale();
      
      // Auto-detect based on locale (US uses Fahrenheit, most others use Celsius)
      if (unit === 'auto') {
        unit = userLocale.startsWith('en-US') ? 'F' : 'C';
      }
      
      const temp = unit === 'F' ? i18n.temperature.celsiusToFahrenheit(tempCelsius) : tempCelsius;
      return `${Math.round(temp)}°${unit}`;
    }
  },

  // Distance/measurement formatting
  measurement: {
    // Convert kilometers to miles
    kmToMiles: (km: number) => km * 0.621371,
    
    // Convert miles to kilometers
    milesToKm: (miles: number) => miles * 1.60934,
    
    // Format distance based on user preference
    formatDistance: (km: number, unit = 'auto', locale: string | null = null) => {
      const userLocale = locale || i18n.getUserLocale();
      
      // Auto-detect based on locale (US, UK partially use miles)
      if (unit === 'auto') {
        unit = (userLocale.startsWith('en-US') || userLocale.startsWith('en-GB')) ? 'mi' : 'km';
      }
      
      const distance = unit === 'mi' ? i18n.measurement.kmToMiles(km) : km;
      return `${Math.round(distance)} ${unit}`;
    }
  },

  // Date formatting
  formatDate: (date: Date | string, style: 'short' | 'medium' | 'long' = 'medium', locale: string | null = null) => {
    const userLocale = locale || i18n.getUserLocale();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      short: { 
        year: 'numeric' as const, 
        month: 'short' as const, 
        day: 'numeric' as const
      },
      medium: { 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const
      },
      long: { 
        weekday: 'long' as const,
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const
      }
    };
    
    return new Intl.DateTimeFormat(userLocale, options[style]).format(dateObj);
  },

  // Common locale-specific formats
  localeFormats: {
    'en-US': { decimal: '.', thousand: ',', currency: 'USD', temp: 'F', distance: 'mi' },
    'en-GB': { decimal: '.', thousand: ',', currency: 'GBP', temp: 'C', distance: 'mi' },
    'en-CA': { decimal: '.', thousand: ',', currency: 'CAD', temp: 'C', distance: 'km' },
    'en-AU': { decimal: '.', thousand: ',', currency: 'AUD', temp: 'C', distance: 'km' },
    'de-DE': { decimal: ',', thousand: '.', currency: 'EUR', temp: 'C', distance: 'km' },
    'fr-FR': { decimal: ',', thousand: ' ', currency: 'EUR', temp: 'C', distance: 'km' },
    'es-ES': { decimal: ',', thousand: '.', currency: 'EUR', temp: 'C', distance: 'km' },
    'it-IT': { decimal: ',', thousand: '.', currency: 'EUR', temp: 'C', distance: 'km' },
    'pt-BR': { decimal: ',', thousand: '.', currency: 'BRL', temp: 'C', distance: 'km' },
    'ja-JP': { decimal: '.', thousand: ',', currency: 'JPY', temp: 'C', distance: 'km' },
    'ko-KR': { decimal: '.', thousand: ',', currency: 'KRW', temp: 'C', distance: 'km' },
    'zh-CN': { decimal: '.', thousand: ',', currency: 'CNY', temp: 'C', distance: 'km' },
  } as const,

  // Get user's preferred formats
  getUserFormats: (locale: string | null = null) => {
    const userLocale = locale || i18n.getUserLocale();
    return i18n.localeFormats[userLocale as keyof typeof i18n.localeFormats] || i18n.localeFormats['en-US'];
  }
};

// Onboarding Button Standards - Added 21JAN25
// SINGLE SOURCE OF TRUTH for all onboarding buttons
export const onboardingButton = {
  // Standard dimensions - NEVER CHANGE WITHOUT USER APPROVAL
  dimensions: {
    height: 'h-[75px] sm:h-[85px] md:h-[90px]',
    padding: 'p-2 sm:p-3 md:p-4',
    minHeight: 'min-h-[75px] sm:min-h-[85px] md:min-h-[90px]' // For dropdowns
  },
  
  // Typography standards
  typography: {
    title: {
      size: 'text-xs sm:text-sm md:text-base',
      weight: font.weight.semibold,
      selectedColor: 'text-scout-accent-700 dark:text-scout-accent-300',
      unselectedColor: colors.heading
      // Removed truncate - will be applied conditionally only when needed
    },
    subtitle: {
      size: 'text-[10px] sm:text-xs md:text-sm',
      selectedColor: 'text-scout-accent-600 dark:text-scout-accent-400',
      unselectedColor: colors.hint,
      spacing: 'mt-1'
      // Removed truncate - will be applied conditionally only when needed
    }
  },
  
  // Checkmark indicator
  checkmark: {
    position: 'absolute top-1 right-1',
    container: 'w-5 h-5 bg-scout-accent-500 rounded-full flex items-center justify-center',
    icon: 'w-3 h-3 text-white'
  },
  
  // Border and background states
  states: {
    selected: 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md',
    unselected: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/30 hover:border-scout-accent-300 hover:shadow-md'
  },
  
  // Common button classes
  base: `border-2 ${layout.radius.lg} ${animation.transition} text-left relative overflow-hidden cursor-pointer w-full`,
  
  // Hover and active effects
  interactions: 'hover:-translate-y-0.5 active:scale-[0.98]',
  
  // Disabled state
  disabled: 'opacity-50 cursor-not-allowed',
  
  // Helper function to get full button classes
  getButtonClasses: (isSelected: boolean, disabled: boolean = false) => {
    const state = isSelected ? onboardingButton.states.selected : onboardingButton.states.unselected;
    const disabledClass = disabled ? onboardingButton.disabled : onboardingButton.interactions;
    return `${onboardingButton.dimensions.height} ${onboardingButton.dimensions.padding} ${onboardingButton.base} ${state} ${disabledClass}`;
  },
  
  // Helper function for dropdown buttons (with min-height instead of fixed height)
  getDropdownClasses: (isSelected: boolean) => {
    const state = isSelected ? onboardingButton.states.selected : onboardingButton.states.unselected;
    return `${onboardingButton.dimensions.minHeight} ${onboardingButton.dimensions.padding} ${onboardingButton.base} ${state} ${onboardingButton.interactions}`;
  }
};

// Town Card Overlay Configuration - Added 10JAN25
export const townCardOverlay = {
  // Backdrop styling - more transparent as requested
  backdrop: 'bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm shadow-sm',
  
  // Font sizes - unified for consistency
  fontSize: {
    matchScore: 'text-xs',      // Same as appeal statement
    appealStatement: 'text-xs',
    confidence: 'text-xs'
  },
  
  // Font weights
  fontWeight: {
    matchScore: 'font-medium',
    appealStatement: 'font-medium',
    confidence: 'font-normal'
  },
  
  // Colors for match scores
  matchColors: {
    high: 'text-scout-accent-600 dark:text-scout-accent-400',    // 80%+
    medium: 'text-gray-700 dark:text-gray-300',                  // 60-79%
    low: 'text-gray-600 dark:text-gray-400'                      // <60%
  },
  
  // Appeal statement color
  appealColor: 'text-gray-700 dark:text-gray-300',
  
  // Icon button styling
  iconButton: {
    base: 'p-2 rounded-full transition-colors',
    heart: {
      active: 'text-red-500',
      inactive: 'text-gray-600 dark:text-gray-400',
      hover: 'hover:text-red-500'
    },
    location: {
      base: 'text-gray-600 dark:text-gray-400',
      hover: 'hover:text-scout-accent-600 dark:hover:text-scout-accent-400'
    }
  },
  
  // Positioning
  position: {
    topLeft: 'top-3 left-3',
    topRight: 'top-3 right-3',
    bottomLeft: 'bottom-3 left-3',
    bottomRight: 'bottom-3 right-3'
  },
  
  // Border radius
  radius: layout.radius.md
};

export const uiConfig = {
  colors,
  font,
  layout,
  animation,
  icons,
  stepNavigation, // Updated 10JUN25: Fixed step definitions
  bottomNavigation, // Added 10JUN25: Bottom navigation patterns
  header, // Added 02AUG25: Header/top navigation configuration
  components, // Updated 10JUN25: Enhanced form styling
  financial,
  progress,
  validation,
  notifications,
  onboardingButton, // Added 21JAN25: Standardized onboarding button configuration
  townCardOverlay, // Added 10JAN25: Centralized town card overlay styling
  states,
  responsive,
  i18n,
  // Brand-specific configurations - Updated 10JUN25: Using scout-accent
  brand: {
    primary: 'scout-accent-300', // Your main brand color #8fbc8f
    accent: {
      light: 'scout-accent-200',
      medium: 'scout-accent-400',
      dark: 'scout-accent-600',
    }
  }
} as const;

// ===== TYPESCRIPT TYPES =====
export type UIConfig = typeof uiConfig;
export type ColorConfig = typeof colors;
export type FontConfig = typeof font;
export type LayoutConfig = typeof layout;
export type ComponentConfig = typeof components;
export type StepNavigationConfig = typeof stepNavigation;

// Step navigation types
export type OnboardingStep = typeof stepNavigation.variants.onboarding.steps[number];
export type StepKey = OnboardingStep['key'];

// ===== UTILITY FUNCTIONS =====

/**
 * Get onboarding step by key
 * @param stepKey - The step key to find
 * @returns The step object or undefined
 */
export const getStepByKey = (stepKey: StepKey): OnboardingStep | undefined => {
  return uiConfig.stepNavigation.variants.onboarding.steps.find(
    step => step.key === stepKey
  );
};

/**
 * Get onboarding step index
 * @param stepKey - The step key to find
 * @returns The step index or -1 if not found
 */
export const getStepIndex = (stepKey: StepKey): number => {
  return uiConfig.stepNavigation.variants.onboarding.steps.findIndex(
    step => step.key === stepKey
  );
};

/**
 * Get total number of onboarding steps
 * @returns The total number of steps
 */
export const getTotalSteps = (): number => {
  return uiConfig.stepNavigation.variants.onboarding.steps.length;
};

/**
 * Get the next step in the onboarding flow
 * @param currentStep - The current step key
 * @returns The next step object or undefined if at the end
 */
export const getNextStep = (currentStep: StepKey): OnboardingStep | undefined => {
  const currentIndex = getStepIndex(currentStep);
  if (currentIndex === -1 || currentIndex === getTotalSteps() - 1) {
    return undefined;
  }
  return uiConfig.stepNavigation.variants.onboarding.steps[currentIndex + 1];
};

/**
 * Get the previous step in the onboarding flow
 * @param currentStep - The current step key
 * @returns The previous step object or undefined if at the beginning
 */
export const getPreviousStep = (currentStep: StepKey): OnboardingStep | undefined => {
  const currentIndex = getStepIndex(currentStep);
  if (currentIndex <= 0) {
    return undefined;
  }
  return uiConfig.stepNavigation.variants.onboarding.steps[currentIndex - 1];
};

/**
 * Calculate progress percentage for onboarding
 * @param completedSteps - Array of completed step keys
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (completedSteps: StepKey[]): number => {
  const totalSteps = getTotalSteps();
  const completedCount = completedSteps.length;
  return Math.round((completedCount / totalSteps) * 100);
};

/**
 * Combine multiple CSS classes safely
 * @param classes - CSS class strings to combine
 * @returns Combined class string
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get responsive class for different breakpoints
 * @param baseClass - Base CSS class
 * @param breakpoint - Responsive breakpoint ('sm', 'md', 'lg', 'xl')
 * @returns Responsive class string
 */
export const getResponsiveClass = (baseClass: string, breakpoint: keyof typeof responsive): string => {
  return `${uiConfig.responsive[breakpoint]}${baseClass}`;
};

/**
 * Memoized locale detection for performance
 */
let cachedLocale: string | null = null;
export const getCachedLocale = (): string => {
  if (!cachedLocale) {
    cachedLocale = uiConfig.i18n.getUserLocale();
  }
  return cachedLocale;
};

/**
 * Reset cached locale (useful for testing or locale changes)
 */
export const resetLocaleCache = (): void => {
  cachedLocale = null;
};

// Slider formatting utilities - Added 21JUN25
export const sliderFormats = {
  // Convert 1-5 scale to percentage (0-100%)
  percentage: (value: number): string => {
    return `${((value - 1) * 25)}%`;
  },
  
  // Format as rating (e.g., "3/5")
  rating: (value: number, max: number = 5): string => {
    return `${value}/${max}`;
  },
  
  // Format as currency amount
  currency: (value: number, scale: number = 1000): string => {
    const amount = value * scale;
    return i18n.formatCurrency(amount);
  },
  
  // Format as raw value
  raw: (value: number): string => {
    return value.toString();
  },
  
  // Format with custom labels
  labels: (value: number, labels: string[]): string => {
    const index = Math.min(Math.floor(value) - 1, labels.length - 1);
    return labels[index] || value.toString();
  }
};

// Default export for easy importing
export default uiConfig;