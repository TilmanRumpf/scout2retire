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

  // Border
  border: 'border-gray-300 dark:border-gray-600',
  borderLight: 'border-gray-200 dark:border-gray-700',
  borderActive: 'border-green-600',
  borderDanger: 'border-red-600',

  // Buttons
  btnPrimary: 'bg-scout-accent text-white hover:bg-opacity-90',
  btnSecondary: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white',
  btnDanger: 'bg-red-600 hover:bg-red-700 text-white',
  btnNeutral: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',

  // Toggles
  toggleOn: 'bg-green-600',
  toggleOff: 'bg-gray-300 dark:bg-gray-600',
  toggleKnob: 'bg-white dark:bg-gray-200',

  // Match badges
  badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  matchStrong: 'bg-green-600 text-white',
  matchMedium: 'bg-yellow-500 text-white',
  matchLow: 'bg-red-500 text-white',
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
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
  }
};

export const layout = {
  spacing: {
    section: 'py-6 px-4',
    card: 'p-6',
    field: 'mb-4',
  },
  radius: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  width: {
    container: 'max-w-4xl mx-auto w-full',
  }
};

export const icons = {
  default: 'phosphor-react', // All icons pulled from this set
};

export const uiConfig = {
  colors,
  font,
  layout,
  icons,
  // Additional configurations can be added here
};
