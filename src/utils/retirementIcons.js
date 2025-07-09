// Retirement-themed SVG icons - compact and efficient
// Each icon is a simple SVG path that can be rendered at any size

export const RETIREMENT_ICONS = {
  // Beach & Coastal Living (30 icons)
  beach: {
    umbrella: 'M12 2C6.48 2 2 6.48 2 12h20c0-5.52-4.48-10-10-10zm0 18c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z',
    wave: 'M2 12c2-2 5-2 7 0s5 2 7 0 5-2 7 0v8H2v-8z',
    palm: 'M12 2L7 7l5 5-2 10h4l-2-10 5-5z',
    shell: 'M12 2C8 2 5 5 5 9s7 11 7 11 7-7 7-11-3-7-7-7z',
    sailboat: 'M12 2v10l8-5zm0 10v10m-4 0h8',
    lighthouse: 'M10 2h4v20h-4zm-2 8h8v2h-8zm0 4h8v2h-8z',
    sandcastle: 'M8 22h8v-6h-8zm2-8h4v-4h-4zm-4 8h16',
    starfish: 'M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z',
    anchor: 'M12 2v16m-6-8c0 3.3 2.7 6 6 6s6-2.7 6-6m-6-8a2 2 0 100 4',
    sunset: 'M12 16m-4 0a4 4 0 108 0 4 4 0 10-8 0M2 16h20M4 12h2m12 0h2M6 8h1m10 0h1',
  },

  // Mountain & Nature (30 icons)
  mountain: {
    peak: '<path d="M2 20l7-14 5 10 8-14v18z"/>',
    hiking: '<circle cx="12" cy="4" r="2"/><path d="M12 6v10m-3-7l3 3 3-3m-6 10v4"/>',
    cabin: '<path d="M12 2L2 12h4v10h12V12h4z"/><rect x="8" y="14" width="4" height="8"/>',
    tree: '<path d="M12 2l-5 8h3l-4 6h5v6h2v-6h5l-4-6h3z"/>',
    lake: '<ellipse cx="12" cy="16" rx="10" ry="4"/><path d="M2 16v4c0 2.2 4.5 4 10 4s10-1.8 10-4v-4"/>',
    campfire: '<path d="M12 2c-2 4-4 6-4 10a4 4 0 008 0c0-4-2-6-4-10z"/><path d="M8 20h8m-6 2h4"/>',
    tent: '<path d="M12 2L2 18h20z"/><path d="M12 2v16m-5-8h10"/>',
    backpack: '<rect x="8" y="4" width="8" height="12" rx="2"/><path d="M10 2v4m4-4v4m-6 4h8"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/><path d="M16 8l-4 4-4 4 4-4z"/>',
    binoculars: '<circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5"/><path d="M12 7v10"/>',
  },

  // Wine & Dining (30 icons)
  wine: {
    glass: '<path d="M12 2v7c0 2.2-1.8 4-4 4h8c-2.2 0-4-1.8-4-4V2m0 11v9m-4 0h8"/>',
    bottle: '<rect x="9" y="8" width="6" height="10"/><path d="M10 8V2h4v6"/>',
    grapes: '<circle cx="10" cy="10" r="2"/><circle cx="14" cy="10" r="2"/><circle cx="12" cy="14" r="2"/><circle cx="8" cy="14" r="2"/><circle cx="16" cy="14" r="2"/>',
    cheese: '<path d="M2 12l10-8v8c0 2.2 1.8 4 4 4h6v6H2z"/>',
    corkscrew: '<path d="M12 2v8c0 1.1-.9 2-2 2h4c-1.1 0-2-.9-2-2V2m0 10v10"/>',
    vineyard: '<path d="M12 2v10m-4-6h8m-8 4h8"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><path d="M2 22h20"/>',
    barrel: '<ellipse cx="12" cy="12" r="8" ry="10"/><path d="M4 8h16m-16 8h16"/>',
    picnic: '<path d="M2 20h20l-2-8H4z"/><path d="M12 12V8m-4 4l1-4m8 4l-1-4"/>',
    diningTable: '<rect x="2" y="10" width="20" height="2"/><path d="M4 12v8m16-8v8"/>',
    chef: '<circle cx="12" cy="8" r="4"/><path d="M8 12h8c0 2.2-1.8 4-4 4s-4-1.8-4-4z"/>',
  },

  // Hobbies & Activities (30 icons)
  hobbies: {
    golf: '<circle cx="12" cy="20" r="2"/><path d="M12 2v18m-2-16l4 2v4l-4-2z"/>',
    fishing: '<path d="M2 12h10m10 0c0 5.5-4.5 10-10 10"/><circle cx="12" cy="12" r="2"/>',
    gardening: '<path d="M12 2v10m-4-6l4 4 4-4"/><path d="M8 12c0 2.2 1.8 4 4 4s4-1.8 4-4"/><path d="M12 16v6"/>',
    painting: '<rect x="4" y="2" width="16" height="16"/><path d="M8 18v4m8-4v4m-12 0h16"/>',
    reading: '<path d="M2 4h9v16H2z"/><path d="M13 4h9v16h-9z"/><path d="M11 12h2"/>',
    photography: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    music: '<path d="M12 2v16"/><ellipse cx="9" cy="18" rx="3" ry="2"/><path d="M12 2l8 2v10"/>',
    dancing: '<circle cx="12" cy="5" r="2"/><path d="M12 7v6m-3-3l3 3 3-3m-6 6l3 3m0 0l3-3"/>',
    pottery: '<path d="M8 4h8v4c0 2.2-1.8 4-4 4s-4-1.8-4-4V4z"/><path d="M6 12h12v6c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-6z"/>',
    knitting: '<path d="M4 4l16 16m0-16L4 20m8-16v16"/>',
  },

  // Travel & Exploration (30 icons)
  travel: {
    airplane: '<path d="M12 2l4 7h5l-9 4v7l-2-2-2 2v-7l-9-4h5z"/>',
    suitcase: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 8V4h8v4m-10 4h12"/>',
    passport: '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="10" r="3"/>',
    map: '<path d="M2 6v14l6-3 8 3 6-3V3l-6 3-8-3z"/>',
    camera: '<rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="13" r="3"/><rect x="9" y="5" width="6" height="3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
    rv: '<rect x="2" y="10" width="18" height="8" rx="2"/><path d="M10 10V6h8v4"/><circle cx="6" cy="20" r="2"/><circle cx="16" cy="20" r="2"/>',
    cruise: '<path d="M2 18h20v2c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-2z"/><path d="M6 18V8h12v10m-9-6h6"/>',
    trainTicket: '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v8m16-8v8m-11-4h2"/>',
    roadTrip: '<path d="M2 12h20m-18-4l2 4-2 4m16-8l2 4-2 4m-8-8v8"/>',
  },

  // Social & Community (30 icons)
  social: {
    friends: '<circle cx="8" cy="6" r="3"/><circle cx="16" cy="6" r="3"/><path d="M8 9c-3 0-5 2-5 5v4h10v-4c0-3-2-5-5-5z"/><path d="M16 9c-3 0-5 2-5 5v4h10v-4c0-3-2-5-5-5z"/>',
    chat: '<path d="M4 4h16v12H8l-4 4v-4H4z"/><path d="M8 8h8m-8 4h5"/>',
    club: '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 8h4m-4 4h4m-4 4h4"/>',
    volunteer: '<path d="M12 2C6 2 2 6 2 10c0 8 10 12 10 12s10-4 10-12c0-4-4-8-10-8z"/>',
    meeting: '<circle cx="12" cy="8" r="3"/><path d="M6 21v-2c0-2 2-4 6-4s6 2 6 4v2"/>',
    party: '<path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M8 16h8m-6 4h4"/>',
    library: '<rect x="4" y="2" width="4" height="18"/><rect x="10" y="2" width="4" height="18"/><rect x="16" y="2" width="4" height="18"/>',
    cafe: '<path d="M6 4h10v8c0 2.2-1.8 4-4 4s-4-1.8-4-4V4z"/><path d="M16 6h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2"/><path d="M4 20h14"/>',
    museum: '<path d="M12 2L2 8v2h20V8z"/><rect x="4" y="10" width="2" height="8"/><rect x="9" y="10" width="2" height="8"/><rect x="13" y="10" width="2" height="8"/><rect x="18" y="10" width="2" height="8"/><path d="M2 18h20v4H2z"/>',
    theater: '<path d="M2 4h20v14H2z"/><path d="M6 8h12m-12 4h12m-12 4h8"/>',
  },

  // Wellness & Health (30 icons)
  wellness: {
    yoga: '<circle cx="12" cy="5" r="2"/><path d="M12 7v8m-4-6l4 2 4-2m-8 10v-4h8v4"/>',
    spa: '<circle cx="12" cy="12" r="3"/><path d="M12 2c-4 0-8 2-8 6s4 6 8 6 8-2 8-6-4-6-8-6z"/>',
    meditation: '<circle cx="12" cy="8" r="3"/><path d="M12 11c-3 0-6 2-6 5v4h12v-4c0-3-3-5-6-5z"/><path d="M8 16l-2 2m8-2l2 2"/>',
    walking: '<circle cx="12" cy="4" r="2"/><path d="M12 6v8m-3-6l3 3 3-3m-6 8v6m0 0l-2-2m2 2l2-2"/>',
    swimming: '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="12" cy="8" r="2"/><path d="M10 10l2 2 2-2"/>',
    cycling: '<circle cx="8" cy="16" r="6"/><circle cx="16" cy="16" r="6"/><path d="M8 16l4-8 4 8m-8-4h8"/>',
    tai_chi: '<circle cx="12" cy="12" r="10"/><path d="M12 2a5 5 0 000 10 5 5 0 000 10"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="17" r="2" fill="white"/>',
    nutrition: '<path d="M12 2C8 2 5 5 5 9c0 6 7 11 7 11s7-5 7-11c0-4-3-7-7-7z"/><path d="M12 6v8"/>',
    massage: '<ellipse cx="12" cy="12" rx="8" ry="4"/><path d="M6 8c0-2 2-4 6-4s6 2 6 4"/>',
    sauna: '<rect x="4" y="8" width="16" height="12"/><path d="M8 12h8m-8 4h8"/><path d="M12 4v4"/>',
  },

  // Learning & Culture (30 icons)
  culture: {
    language: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 12h8m-4-6v12"/>',
    cooking: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8m-3-6h6"/>',
    history: '<path d="M12 2v20"/><path d="M12 2c-4 0-8 2-8 6v4c0 4 4 6 8 6s8-2 8-6V8c0-4-4-6-8-6z"/>',
    art: '<rect x="4" y="4" width="16" height="12"/><path d="M8 20h8l-2-4h-4z"/>',
    crafts: '<path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/>',
    writing: '<path d="M3 17l4-10 4 10m-7-3h6"/><path d="M14 7h7m-7 5h7m-7 5h5"/>',
    music_class: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M9 10h6"/>',
    photography_class: '<rect x="6" y="6" width="12" height="8"/><circle cx="12" cy="10" r="2"/><path d="M2 18h20"/>',
    ceramics: '<path d="M8 2h8v4c0 2-2 4-4 4s-4-2-4-4V2z"/><ellipse cx="12" cy="16" rx="6" ry="4"/>',
    woodworking: '<rect x="4" y="8" width="16" height="8"/><path d="M8 4l-4 4m12-4l4 4m-10 8v4"/>',
  },

  // Finance & Planning (30 icons)
  finance: {
    retirement_fund: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 4"/>',
    budget: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h5"/>',
    investment: '<path d="M2 20l6-6 4 4 8-12"/><path d="M14 6h6v6"/>',
    savings: '<path d="M5 12c0-4 3-7 7-7s7 3 7 7v8H5v-8z"/><path d="M12 8v8"/>',
    pension: '<path d="M12 2L2 7v6c0 5 3 9 10 11 7-2 10-6 10-11V7z"/><path d="M12 8v8"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><rect x="8" y="6" width="8" height="3"/><rect x="8" y="12" width="3" height="3"/><rect x="13" y="12" width="3" height="3"/><rect x="8" y="17" width="3" height="3"/><rect x="13" y="17" width="3" height="3"/>',
    coin: '<circle cx="12" cy="12" r="10"/><path d="M12 6v12m-3-9h6m-6 6h6"/>',
    wallet: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="14" r="2"/>',
    chart: '<rect x="4" y="4" width="16" height="16"/><path d="M8 16v-6m4 6v-8m4 8v-4"/>',
    advisor: '<circle cx="12" cy="8" r="3"/><path d="M9 15c0-1.7 1.3-3 3-3s3 1.3 3 3v5H9v-5z"/><path d="M6 20h12"/>',
  },

  // Home & Lifestyle (30 icons)
  lifestyle: {
    downsizing: '<rect x="8" y="8" width="12" height="12"/><rect x="4" y="4" width="8" height="8" stroke-dasharray="2,2"/>',
    condo: '<rect x="4" y="4" width="16" height="16"/><rect x="8" y="14" width="4" height="6"/><rect x="8" y="8" width="3" height="3"/><rect x="13" y="8" width="3" height="3"/>',
    tiny_house: '<path d="M12 2L4 10v10h16V10z"/><rect x="9" y="14" width="6" height="6"/>',
    renovation: '<path d="M14 2l8 8-10 10-8-8z"/><path d="M4 14l4 4"/>',
    declutter: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><path d="M16 16l4 4m0-4l-4 4"/>',
    security: '<path d="M12 2L4 7v6c0 4 3 7 8 9 5-2 8-5 8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    accessibility: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="2"/><path d="M12 10v8m-3-5h6"/>',
    pet_friendly: '<path d="M12 2c-2 0-4 2-4 4 0 4 4 6 4 6s4-2 4-6c0-2-2-4-4-4z"/><circle cx="7" cy="14" r="2"/><circle cx="17" cy="14" r="2"/><circle cx="7" cy="20" r="2"/><circle cx="17" cy="20" r="2"/>',
    garden_home: '<rect x="6" y="10" width="12" height="10"/><path d="M12 2L6 10h12z"/><path d="M2 20h4m12 0h4"/>',
    smart_home: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>',
  }
};

// Function to generate SVG with custom colors
export function generateIcon(category, name, color = '#8fbc8f', size = 64) {
  const iconPath = RETIREMENT_ICONS[category]?.[name];
  if (!iconPath) return null;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">${iconPath}</svg>`;
}

// Get all icons as a flat array for easy selection
export function getAllIcons() {
  const icons = [];
  Object.keys(RETIREMENT_ICONS).forEach(category => {
    Object.keys(RETIREMENT_ICONS[category]).forEach(name => {
      icons.push({
        category,
        name,
        id: `${category}_${name}`,
        path: RETIREMENT_ICONS[category][name]
      });
    });
  });
  return icons;
}

// Preset avatar combinations with nice colors
export const AVATAR_PRESETS = [
  // Beach themes
  { icon: 'beach_umbrella', color: '#4682B4', bg: '#F0F8FF' },
  { icon: 'beach_wave', color: '#20B2AA', bg: '#E0FFFF' },
  { icon: 'beach_palm', color: '#228B22', bg: '#F0FFF0' },
  { icon: 'beach_sunset', color: '#FF6347', bg: '#FFF5EE' },
  { icon: 'beach_sailboat', color: '#1E90FF', bg: '#F0F8FF' },
  
  // Mountain themes
  { icon: 'mountain_peak', color: '#8B7355', bg: '#FAEBD7' },
  { icon: 'mountain_hiking', color: '#228B22', bg: '#F5FFFA' },
  { icon: 'mountain_cabin', color: '#8B4513', bg: '#FFF8DC' },
  { icon: 'mountain_tree', color: '#2E8B57', bg: '#F0FFF0' },
  { icon: 'mountain_lake', color: '#4682B4', bg: '#E6F3FF' },
  
  // Wine & dining
  { icon: 'wine_glass', color: '#722F37', bg: '#FFF0F5' },
  { icon: 'wine_bottle', color: '#8B0000', bg: '#FFE4E1' },
  { icon: 'wine_grapes', color: '#9370DB', bg: '#F8F4FF' },
  { icon: 'wine_cheese', color: '#DAA520', bg: '#FFFACD' },
  { icon: 'wine_picnic', color: '#FF69B4', bg: '#FFF0F5' },
  
  // Add more presets for each category...
];