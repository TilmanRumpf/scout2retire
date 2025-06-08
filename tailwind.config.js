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
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}