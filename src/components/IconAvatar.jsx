import { LUCIDE_RETIREMENT_ICONS } from '../utils/lucideRetirementIcons';

export default function IconAvatar({ iconData, size = 128 }) {
  // Parse icon data from string format
  let category, iconName, color, bg;
  
  if (typeof iconData === 'string' && iconData.startsWith('icon:')) {
    // Format: "icon:category:iconName:color:bg"
    const parts = iconData.split(':');
    category = parts[1];
    iconName = parts[2];
    color = parts[3] || '#8fbc8f';
    bg = parts[4] || '#F5F5F5';
  } else {
    // Fallback to initials
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2} fill="#8fbc8f" />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={size * 0.4}>
          ?
        </text>
      </svg>
    );
  }
  
  const IconComponent = LUCIDE_RETIREMENT_ICONS[category]?.[iconName];
  
  if (!IconComponent) {
    // Fallback if icon not found
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2} fill={bg} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.4}>
          {iconName.charAt(0).toUpperCase()}
        </text>
      </svg>
    );
  }
  
  // Calculate icon size (about 50% of total size)
  const iconSize = size * 0.5;
  const iconOffset = (size - iconSize) / 2;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2} fill={bg} />
      <g transform={`translate(${iconOffset}, ${iconOffset})`}>
        <IconComponent size={iconSize} color={color} strokeWidth={1.5} />
      </g>
    </svg>
  );
}