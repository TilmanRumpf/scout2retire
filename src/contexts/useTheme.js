import { useContext, createContext } from 'react';

export const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}