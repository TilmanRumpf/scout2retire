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
          300: '#8fbc8f',  // Your main brand color - perfect balance!
          400: '#689f6a',  // Medium sage - great for secondary actions
          500: '#47824b',  // Darker sage - text on light backgrounds
          600: '#346738',  // Dark sage - strong contrast
          700: '#2a522f',  // Very dark sage - active states
          800: '#234226',  // Almost black sage
          900: '#1d3720',  // Deepest sage
          950: '#101e13',  // Nearly black with sage undertone
          DEFAULT: '#8fbc8f', // Makes bg-scout-accent work perfectly
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}