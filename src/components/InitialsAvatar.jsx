import { uiConfig } from '../styles/uiConfig';

// Nice, retirement-friendly color palettes
const COLOR_PALETTES = [
  { bg: '#8fbc8f', text: '#ffffff' }, // Scout green
  { bg: '#87CEEB', text: '#1e3a5f' }, // Sky blue
  { bg: '#F4A460', text: '#5d3a1a' }, // Sandy beach
  { bg: '#DDA0DD', text: '#4b0082' }, // Plum
  { bg: '#F0E68C', text: '#8b7355' }, // Khaki
  { bg: '#B0C4DE', text: '#2c3e50' }, // Light steel blue
  { bg: '#FFB6C1', text: '#8b3a3a' }, // Light pink
  { bg: '#98D8C8', text: '#2c5f5d' }, // Mint
  { bg: '#FFDAB9', text: '#8b4513' }, // Peach
  { bg: '#E6E6FA', text: '#483d8b' }, // Lavender
];

export default function InitialsAvatar({ fullName, size = 128, colorIndex = 0 }) {
  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials(fullName);
  const colors = COLOR_PALETTES[colorIndex % COLOR_PALETTES.length];
  const fontSize = size * 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill={colors.bg}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="600"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fill={colors.text}
      >
        {initials}
      </text>
    </svg>
  );
}