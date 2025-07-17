// Helper to generate SVG data URLs for Lucide icons
export function generateIconSvgDataUrl(IconComponent, color, bg) {
  // Create a wrapper div to render the icon
  const wrapper = document.createElement('div');
  wrapper.style.display = 'none';
  document.body.appendChild(wrapper);
  
  // Create the icon element
  const iconContainer = document.createElement('div');
  wrapper.appendChild(iconContainer);
  
  // Render a simple icon SVG
  iconContainer.innerHTML = `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="${bg}"/>
      <g transform="translate(32, 32)">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${getIconPath(IconComponent)}
        </svg>
      </g>
    </svg>
  `;
  
  // Get the SVG content
  const svgElement = iconContainer.querySelector('svg');
  const svgString = new XMLSerializer().serializeToString(svgElement);
  
  // Clean up
  document.body.removeChild(wrapper);
  
  // Convert to data URL
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}

// Get the path data from a Lucide icon
function getIconPath(IconComponent) {
  // Lucide icons have consistent patterns we can use
  // This is a simplified approach that works for most icons
  const iconName = IconComponent.name || '';
  
  // Map of common Lucide icon paths (simplified subset)
  const iconPaths = {
    Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    Waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
    Home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    // Default fallback
    default: '<circle cx="12" cy="12" r="10"/>'
  };
  
  // Try to get the icon path, fallback to default
  return iconPaths[iconName] || iconPaths.default;
}