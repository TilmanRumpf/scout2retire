// 🎨 Scout2Retire Design Tokens & UI Configuration

export const colors = {
  // Backgrounds
  page: 'bg-gray-50 dark:bg-gray-900',
  card: 'bg-white dark:bg-gray-800',
  modal: 'bg-white dark:bg-gray-800',
  input: 'bg-white dark:bg-gray-700',
  tabActive: 'bg-scout-accent text-white',
  tabInactive: 'bg-white dark:bg-gray-700 text-scout-accent dark:text-white',

  // Text
  heading: 'text-gray-800 dark:text-white',
  body: 'text-gray-700 dark:text-gray-300',
  hint: 'text-gray-500 dark:text-gray-400',
  muted: 'text-gray-400 dark:text-gray-500',
  accent: 'text-scout-accent',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-scout-accent-600 dark:text-scout-accent-400',

  // Border
  border: 'border-gray-300 dark:border-gray-600',
  borderLight: 'border-gray-200 dark:border-gray-700',
  borderActive: 'border-scout-accent',
  borderDanger: 'border-red-600',
  borderSuccess: 'border-scout-accent-400',

  // Buttons
  btnPrimary: 'bg-scout-accent text-white hover:bg-scout-accent-400 transition-colors',
  btnSecondary: 'bg-scout-accent-100 dark:bg-scout-accent-800 text-scout-accent-700 dark:text-scout-accent-200 hover:bg-scout-accent-200 dark:hover:bg-scout-accent-700 transition-colors',
  btnDanger: 'bg-red-600 hover:bg-red-700 text-white transition-colors',
  btnNeutral: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',

  // Toggles
  toggleOn: 'bg-scout-accent',
  toggleOff: 'bg-gray-300 dark:bg-gray-600',
  toggleKnob: 'bg-white dark:bg-gray-200',

  // Match badges - using your sage green palette
  badge: 'bg-scout-accent-100 text-scout-accent-800 dark:bg-scout-accent-900 dark:text-scout-accent-200',
  matchStrong: 'bg-scout-accent text-white',
  matchMedium: 'bg-yellow-500 text-white',
  matchLow: 'bg-red-500 text-white',

  // Status indicators using sage green
  statusSuccess: 'bg-scout-accent-100 text-scout-accent-800 dark:bg-scout-accent-900 dark:text-scout-accent-200',
  statusWarning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  statusError: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  statusInfo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',

  // Focus states
  focusRing: 'focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75',
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
}

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

// 08JUN25: Added missing components object for form elements
export const components = {
  // Form inputs
  input: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent',
  textarea: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent resize-vertical',
  select: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent',
  
  // Checkboxes and radios
  checkbox: 'h-4 w-4 text-scout-accent focus:ring-scout-accent-400 border-gray-300 dark:border-gray-600 rounded',
  radio: 'h-4 w-4 text-scout-accent focus:ring-scout-accent-400 border-gray-300 dark:border-gray-600',
  
  // Range sliders
  slider: 'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full slider-thumb:bg-scout-accent slider-thumb:cursor-pointer',
  
  // Toggle switches
  toggle: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2',
  toggleKnob: 'inline-block h-4 w-4 transform rounded-full bg-white transition',
  
  // File inputs
  fileInput: 'block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-scout-accent-50 file:text-scout-accent-700 hover:file:bg-scout-accent-100',
  
  // Search inputs
  searchInput: 'w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:ring-opacity-75 focus:border-scout-accent',
  
  // Form groups
  formGroup: 'mb-4',
  formGroupCompact: 'mb-2',
  
  // Labels
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  labelRequired: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 after:content-["*"] after:ml-0.5 after:text-red-500',
  
  // Help text
  helpText: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
  errorText: 'mt-1 text-xs text-red-600 dark:text-red-400',
  
  // Buttons
  button: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  buttonPrimary: 'inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium text-white bg-scout-accent hover:bg-scout-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scout-accent-500 transition-colors',
  buttonSecondary: 'inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scout-accent-500 transition-colors',
  
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
  navItemActive: 'text-scout-accent bg-scout-accent-100 dark:bg-scout-accent-900 px-3 py-2 rounded-md text-sm font-medium',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
  tableHeader: 'bg-gray-50 dark:bg-gray-800',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  tableBody: 'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700',
  tableRow: 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
};

// Financial data display colors
export const financial = {
  positive: 'text-scout-accent-600 dark:text-scout-accent-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
  highlight: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  currency: 'font-medium text-gray-900 dark:text-white',
  percentage: 'text-sm font-medium',
};

// Progress bars and score indicators
export const progress = {
  bar: 'bg-scout-accent-200 dark:bg-scout-accent-800',
  fill: 'bg-scout-accent transition-all duration-300',
  track: 'bg-gray-200 dark:bg-gray-700',
  low: 'bg-red-400',
  medium: 'bg-yellow-400', 
  high: 'bg-scout-accent',
  complete: 'bg-scout-accent-600',
};

// Form validation states
export const validation = {
  valid: 'border-scout-accent-400 bg-scout-accent-50 dark:bg-scout-accent-950 dark:border-scout-accent-600',
  invalid: 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-600',
  warning: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600',
  neutral: 'border-gray-300 dark:border-gray-600',
};

// Notification system
export const notifications = {
  success: 'bg-scout-accent-100 border-scout-accent-400 text-scout-accent-800 dark:bg-scout-accent-900 dark:border-scout-accent-600 dark:text-scout-accent-200',
  error: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
  info: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
};

// Interactive component states
export const states = {
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'opacity-75 cursor-wait animate-pulse',
  active: 'bg-scout-accent-100 border-scout-accent-400 dark:bg-scout-accent-800 dark:border-scout-accent-600',
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  selected: 'bg-scout-accent text-white',
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
  formatCurrency: (amount, currency = 'USD', locale = null) => {
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
  formatNumber: (number, locale = null) => {
    const userLocale = locale || i18n.getUserLocale();
    return new Intl.NumberFormat(userLocale).format(number);
  },

  // Temperature conversion and formatting
  temperature: {
    // Convert Celsius to Fahrenheit
    celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
    
    // Convert Fahrenheit to Celsius  
    fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
    
    // Format temperature based on user preference
    format: (tempCelsius, unit = 'auto', locale = null) => {
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
    kmToMiles: (km) => km * 0.621371,
    
    // Convert miles to kilometers
    milesToKm: (miles) => miles * 1.60934,
    
    // Format distance based on user preference
    formatDistance: (km, unit = 'auto', locale = null) => {
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
  formatDate: (date, style = 'medium', locale = null) => {
    const userLocale = locale || i18n.getUserLocale();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      short: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      },
      medium: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      },
      long: { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
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
  },

  // Get user's preferred formats
  getUserFormats: (locale = null) => {
    const userLocale = locale || i18n.getUserLocale();
    return i18n.localeFormats[userLocale] || i18n.localeFormats['en-US'];
  }
};

export const uiConfig = {
  colors,
  font,
  layout,
  animation,
  icons,
  components, // 08JUN25: Added components to main export
  financial,
  progress,
  validation,
  notifications,
  states,
  i18n,
  // Brand-specific configurations
  brand: {
    primary: 'scout-accent',
    sage: {
      light: 'scout-accent-200',
      medium: 'scout-accent-300', // Your main brand color
      dark: 'scout-accent-600',
    }
  }
};