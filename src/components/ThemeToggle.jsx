import { useTheme } from '../contexts/useTheme';

export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
<button
  onClick={toggleTheme}
  className="p-4 bg-red-500 hover:bg-blue-500 text-white rounded-lg text-lg font-bold"
>
  TOGGLE THEME (hover me)
</button>
  );
}