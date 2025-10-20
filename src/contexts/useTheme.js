import { useContext, createContext } from 'react';

export const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  // Add darkMode property for compatibility
  return {
    ...context,
    darkMode: context.theme === 'dark'
  };
}