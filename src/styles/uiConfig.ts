// Scout2Retire Design Tokens & UI Configuration - Updated 09JUN25
// UPDATED: Added phosphor icons for all 7 onboarding steps

export const colors = {
  // Backgrounds
  page: 'bg-gray-50 dark:bg-gray-900',
  card: 'bg-white dark:bg-gray-800',
  modal: 'bg-white dark:bg-gray-800',
  input: 'bg-white dark:bg-gray-700',
  tabActive: 'bg-sage-600 text-white',
  tabInactive: 'bg-white dark:bg-gray-700 text-sage-600 dark:text-white',

  // Text
  heading: 'text-gray-800 dark:text-white',
  body: 'text-gray-700 dark:text-gray-300',
  hint: 'text-gray-500 dark:text-gray-400',
  muted: 'text-gray-400 dark:text-gray-500',
  accent: 'text-sage-600',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-sage-600 dark:text-sage-400',

  // Border - Updated 09JUN25: Using sage green accents
  border: 'border-gray-300 dark:border-gray-600',
  borderLight: 'border-gray-200 dark:border-gray-700',
  borderActive: 'border-sage-600',
  borderDanger: 'border-red-600',
  borderSuccess: 'border-sage-400',

  // Buttons - Updated 09JUN25: Sage green theme
  btnPrimary: 'bg-sage-600 text-white hover:bg-sage-700 transition-colors',
  btnSecondary: 'bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-200 hover:bg-sage-200 dark:hover:bg-sage-700 transition-colors',
  btnDanger: 'bg-red-600 hover:bg-red-700 text-white transition-colors',
  btnNeutral: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',

  // Toggles - Updated 09JUN25: Sage green
  toggleOn: 'bg-sage-600',
  toggleOff: 'bg-gray-300 dark:bg-gray-600',
  toggleKnob: 'bg-white dark:bg-gray-200',

  // Match badges - Updated 09JUN25: Using sage green palette
  badge: 'bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200',
  matchStrong: 'bg-sage-600 text-white',
  matchMedium: 'bg-yellow-500 text-white',
  matchLow: 'bg-red-500 text-white',

  // Status indicators - Updated 09JUN25: Using sage green
  statusSuccess: 'bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200',
  statusWarning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  statusError: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  statusInfo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',

  // Focus states - Updated 09JUN25: Sage green focus rings
  focusRing: 'focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75',
  focusRingDanger: 'focus:ring-2 focus:ring-red-400 focus:ring-opacity-75',
};

export const font = {
  family: `'Inter', system-ui, sans-serif`,
  size: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
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
    section: 'py-6 px-4',
    card: 'p-6',
    cardCompact: 'p-4',
    field: 'mb-4',
    fieldCompact: 'mb-2',
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },
  width: {
    container: 'max-w-4xl mx-auto w-full',
    containerWide: 'max-w-6xl mx-auto w-full',
    containerNarrow: 'max-w-2xl mx-auto w-full',
  }
};

export const animation = {
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  hover: 'transform hover:scale-105 transition-transform duration-200',
  pulse: 'animate-pulse',
};

export const icons = {
  default: 'phosphor-react', // All icons pulled from this set
  size: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }
};

// Step Navigation Patterns - Updated 09JUN25: Added phosphor icons for all 7 steps
export const stepNavigation = {
  styles: {
    // Container styles
    container: 'mb-8',
    iconRow: 'flex justify-center items-center space-x-4 mb-4',
    labelRow: 'flex justify-center items-center space-x-4',
    
    // Icon styles
    icon: {
      base: 'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
      current: 'bg-sage-600 text-white shadow-lg scale-110',
      completed: 'bg-sage-500 text-white hover:bg-sage-600 cursor-pointer hover:scale-105',
      future: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
    },
    
    // Label styles
    labels: {
      base: 'text-xs text-center w-12',
      current: 'text-sage-600 dark:text-sage-400 font-semibold',
      completed: 'text-sage-500 dark:text-sage-400',
      future: 'text-gray-400 dark:text-gray-500'
    }
  },
  
  // Different step configurations for different parts of app
  // UPDATED 09JUN25: Added phosphor icons for all 7 onboarding steps
  variants: {
    onboarding: {
      steps: [
        { 
          key: 'current_status', 
          label: 'Current Status', 
          path: '/onboarding/current-status',
          icon: 'map-pin'
        },
        { 
          key: 'region_preferences', 
          label: 'Region', 
          path: '/onboarding/region',
          icon: 'globe'
        },
        { 
          key: 'climate_preferences', 
          label: 'Climate', 
          path: '/onboarding/climate',
          icon: 'cloud-sun'
        },
        { 
          key: 'culture_preferences', 
          label: 'Culture', 
          path: '/onboarding/culture',
          icon: 'users-three'
        },
        { 
          key: 'hobbies', 
          label: 'Hobbies', 
          path: '/onboarding/hobbies',
          icon: 'currency-dollar'
        },
        { 
          key: 'administration', 
          label: 'Healthcare', 
          path: '/onboarding/healthcare',
          icon: 'ambulance'
        },
        { 
          key: 'budget', 
          label: 'Administration', 
          path: '/onboarding/administration',
          icon: 'building-office'
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

// Bottom Navigation Patterns - Added 09JUN25
export const bottomNavigation = {
  styles: {
    container: 'flex justify-between items-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700',
    backButton: 'inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 transition-all duration-200',
    nextButton: 'inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
  }
};

// Enhanced Form Components - Updated 09JUN25: Match screenshot design
export const components = {
  // Form inputs - Updated with sage green theme
  input: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75 focus:border-sage-600 transition-all duration-200',
  textarea: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75 focus:border-sage-600 resize-vertical transition-all duration-200',
  select: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75 focus:border-sage-600 transition-all duration-200',
  
  // Checkboxes and radios - Updated 09JUN25: Sage green with proper styling
  checkbox: 'h-4 w-4 text-sage-600 focus:ring-sage-500 focus:ring-offset-0 border-2 border-gray-300 dark:border-gray-600 rounded transition-all duration-200',
  radio: 'h-4 w-4 text-sage-600 focus:ring-sage-500 focus:ring-offset-0 border-2 border-gray-300 dark:border-gray-600 transition-all duration-200',
  
  // Range sliders - Updated 09JUN25: Beautiful sage green sliders matching screenshot
  slider: {
    container: 'w-full mb-4',
    track: 'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer',
    fill: 'h-2 bg-sage-600 rounded-full',
    thumb: 'appearance-none h-5 w-5 bg-sage-600 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75',
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
        background: #10b981;
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
  
  // Toggle switches - Updated 09JUN25: Sage green toggles
  toggle: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2',
  toggleKnob: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
  toggleOn: 'bg-sage-600',
  toggleOff: 'bg-gray-300 dark:bg-gray-600',
  
  // Button variants - Updated 09JUN25: Sage green theme
  buttonVariants: {
    primary: 'py-3 px-4 rounded-lg border-2 border-transparent text-sm font-medium text-center transition-all duration-200 bg-sage-600 text-white hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2',
    secondary: 'py-3 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-medium text-center transition-all duration-200 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2',
    selected: 'py-3 px-4 rounded-lg border-2 border-sage-600 text-sm font-medium text-center transition-all duration-200 bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300',
    unselected: 'py-3 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-center transition-all duration-200 text-gray-700 dark:text-gray-300 hover:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2'
  },
  
  // File inputs
  fileInput: 'block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage-50 file:text-sage-700 hover:file:bg-sage-100',
  
  // Search inputs
  searchInput: 'w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75 focus:border-sage-600',
  
  // Form groups
  formGroup: 'mb-6',
  formGroupCompact: 'mb-4',
  
  // Labels - Updated 09JUN25: Better spacing and typography
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3',
  labelRequired: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 after:content-["*"] after:ml-0.5 after:text-red-500',
  
  // Help text
  helpText: 'mt-2 text-xs text-gray-500 dark:text-gray-400',
  errorText: 'mt-2 text-xs text-red-600 dark:text-red-400',
  
  // Buttons
  button: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  buttonPrimary: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 transition-colors',
  buttonSecondary: 'inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 transition-colors',
  
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
  navItemActive: 'text-sage-600 bg-sage-100 dark:bg-sage-900 px-3 py-2 rounded-md text-sm font-medium',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
  tableHeader: 'bg-gray-50 dark:bg-gray-800',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  tableBody: 'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700',
  tableRow: 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
};

// Financial data display colors - Updated 09JUN25: Sage green theme
export const financial = {
  positive: 'text-sage-600 dark:text-sage-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
  highlight: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  currency: 'font-medium text-gray-900 dark:text-white',
  percentage: 'text-sm font-medium',
};

// Progress bars and score indicators - Updated 09JUN25: Sage green theme
export const progress = {
  bar: 'bg-sage-200 dark:bg-sage-800',
  fill: 'bg-sage-600 transition-all duration-300',
  track: 'bg-gray-200 dark:bg-gray-700',
  low: 'bg-red-400',
  medium: 'bg-yellow-400', 
  high: 'bg-sage-600',
  complete: 'bg-sage-600',
};

// Form validation states - Updated 09JUN25: Sage green theme
export const validation = {
  valid: 'border-sage-400 bg-sage-50 dark:bg-sage-950 dark:border-sage-600',
  invalid: 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-600',
  warning: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600',
  neutral: 'border-gray-300 dark:border-gray-600',
};

// Notification system - Updated 09JUN25: Sage green theme
export const notifications = {
  success: 'bg-sage-100 border-sage-400 text-sage-800 dark:bg-sage-900 dark:border-sage-600 dark:text-sage-200',
  error: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
  info: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
};

// Interactive component states - Updated 09JUN25: Sage green theme
export const states = {
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'opacity-75 cursor-wait animate-pulse',
  active: 'bg-sage-100 border-sage-400 dark:bg-sage-800 dark:border-sage-600',
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  selected: 'bg-sage-600 text-white',
};

// Internationalization utilities (unchanged - working well)
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

export const uiConfig = {
  colors,
  font,
  layout,
  animation,
  icons,
  stepNavigation, // Updated 09JUN25: Added phosphor icons to all 7 steps
  bottomNavigation, // Added 09JUN25: Bottom navigation patterns
  components, // Updated 09JUN25: Enhanced form styling
  financial,
  progress,
  validation,
  notifications,
  states,
  i18n,
  // Brand-specific configurations - Updated 09JUN25: Using sage green
  brand: {
    primary: 'sage-600',
    sage: {
      light: 'sage-200',
      medium: 'sage-400',
      dark: 'sage-600',
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
export const getResponsiveClass = (baseClass: string, breakpoint: keyof typeof uiConfig.responsive): string => {
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

// Default export for easy importing
export default uiConfig;