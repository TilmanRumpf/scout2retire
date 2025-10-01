/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Keep existing green colors for backward compatibility
        // (in case they're used elsewhere in your codebase)
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Your new Scout2Retire brand colors - beautiful sage green!
        'scout-accent': {
          50: '#f2f7f2',   // Almost white with sage tint
          100: '#e0edde',  // Very light sage - great for backgrounds
          200: '#c2dac0',  // Light sage - subtle borders, hover states
          300: '#8fbc8f',  // Your Scout2Retire brand color - actions, buttons
          400: '#689f6a',  // Medium sage - great for secondary actions
          500: '#47824b',  // Darker sage - text on light backgrounds
          600: '#346738',  // Dark sage - strong contrast
          700: '#2a522f',  // Very dark sage - active states
          800: '#234226',  // Almost black sage
          900: '#1d3720',  // Deepest sage
          950: '#101e13',  // Nearly black with sage undertone
          DEFAULT: '#8fbc8f', // Makes bg-scout-accent work perfectly
        },
        // Scout2Retire brand orange - used for the "2" in logo
        'scout-orange': {
          50: '#fef5f0',   // Lightest orange tint
          100: '#fde8db',  // Very light orange
          200: '#fcceb7',  // Light orange
          300: '#faad8d',  // Medium-light orange
          400: '#f88864',  // Medium orange
          500: '#f66527',  // Scout2Retire brand orange - the "2"
          600: '#e04d0f',  // Darker orange
          700: '#bc3d08',  // Deep orange
          800: '#993208',  // Very dark orange
          900: '#7a2909',  // Darkest orange
          DEFAULT: '#f66527', // Makes text-scout-orange work
        },
        // Progress/In-Progress colors - warm peach/coral based on #FBB982
        'scout-progress': {
          50:  '#FEF5ED',  // Lightest - almost white with hint of peach
          100: '#FDE6D6',  // Very light peach - backgrounds
          200: '#FBD4B4',  // Light peach - progress bars
          300: '#FBB982',  // Your base color - borders
          400: '#F9A05C',  // Slightly deeper - hover states
          500: '#F78B3F',  // Medium coral - text/icons
          600: '#E57230',  // Deeper coral - active states
          700: '#C45A24',  // Dark coral - dark mode
          800: '#9A461E',  // Very dark
          900: '#7A3819',  // Darkest
          DEFAULT: '#FBB982', // Makes bg-scout-progress work
        },
        // Navigation colors - sage tones for hamburger menu
        'scout-nav': {
          50:  '#F5F7F5',  // Lightest sage
          100: '#E8EDE8',  // Very light sage
          200: '#D3DED3',  // Light sage
          300: '#B3C6B3',  // Soft sage
          400: '#9BB89B',  // Light-medium sage
          500: '#8FAF8F',  // Medium sage - main hamburger color
          600: '#7A9A7A',  // Darker sage - hover
          700: '#658565',  // Deep sage - active
          800: '#4F684F',  // Very dark sage
          900: '#3F523F',  // Darkest sage
          DEFAULT: '#8FAF8F', // Makes text-scout-nav work
        },
        // Dark mode optimized colors
        gray: {
          // iOS-style grays for dark mode
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      spacing: {
        // iOS 8-point grid system
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '18': '72px', // Added for specific needs
        '15': '60px', // Touch target helper
        '11': '44px', // iOS minimum touch target
      },
      screens: {
        // Mobile-first breakpoints
        'xs': '375px',   // iPhone SE
        'sm': '428px',   // iPhone 14 Pro Max
        'md': '768px',   // iPad Portrait
        'lg': '1024px',  // iPad Landscape
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large Desktop
      },
      fontFamily: {
        // iOS system font stack
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
        // Google Fonts
        'kalam': ['Kalam', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'dancing': ['Dancing Script', 'cursive'],
        'pacifico': ['Pacifico', 'cursive'],
        'satisfy': ['Satisfy', 'cursive'],
        'caveat': ['Caveat', 'cursive'],
      },
      fontSize: {
        // iOS Dynamic Type scale
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      borderRadius: {
        // iOS-style radii
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        // iOS-style shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
        'none': 'none',
        // Dark mode shadows
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark': '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        // iOS-style animations
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      transitionTimingFunction: {
        // iOS spring animations
        'ios': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}