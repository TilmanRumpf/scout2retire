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