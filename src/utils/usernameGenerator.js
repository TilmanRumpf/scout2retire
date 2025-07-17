// Username generation utility for Scout2Retire
// Generates unique, friendly usernames for users 55+

// Word lists for username generation
const wordLists = {
  freeSpirit: [
    'wanderer', 'explorer', 'adventurer', 'nomad', 'voyager',
    'roamer', 'seeker', 'dreamer', 'pathfinder', 'pilgrim',
    'maverick', 'pioneer', 'wayfarer', 'globetrotter', 'journeyer'
  ],
  
  traveller: [
    'traveler', 'tourist', 'visitor', 'backpacker', 'trekker',
    'cruiser', 'jetsetter', 'rambler', 'sightseer', 'tripper',
    'holidayer', 'vacationer', 'excursionist', 'wanderlust', 'roadtripper'
  ],
  
  retirement: [
    'retiree', 'pensioner', 'senior', 'elder', 'veteran',
    'golden', 'leisure', 'freedom', 'relaxed', 'seasoned',
    'wise', 'experienced', 'mature', 'accomplished', 'fulfilled'
  ],
  
  scout: [
    'scout', 'finder', 'hunter', 'searcher', 'detective',
    'investigator', 'researcher', 'discoverer', 'locator', 'tracker',
    'spotter', 'observer', 'surveyor', 'prospector', 'navigator'
  ],
  
  nature: [
    'mountain', 'ocean', 'forest', 'desert', 'valley',
    'river', 'lake', 'beach', 'meadow', 'canyon',
    'sunrise', 'sunset', 'stargazer', 'moonlight', 'sunshine'
  ],
  
  adjectives: [
    'happy', 'sunny', 'peaceful', 'serene', 'calm',
    'wise', 'curious', 'active', 'vibrant', 'cheerful',
    'gentle', 'free', 'bold', 'brave', 'warm',
    'cool', 'bright', 'smart', 'keen', 'ready'
  ]
};

// Get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate a single username
export const generateUsername = () => {
  const patterns = [
    // Pattern 1: Adjective + Noun
    () => {
      const adj = getRandomElement(wordLists.adjectives);
      const category = getRandomElement(['freeSpirit', 'traveller', 'scout', 'nature']);
      const noun = getRandomElement(wordLists[category]);
      return `${adj}${noun}`;
    },
    
    // Pattern 2: Retirement + Noun
    () => {
      const retirement = getRandomElement(wordLists.retirement);
      const category = getRandomElement(['freeSpirit', 'traveller', 'scout', 'nature']);
      const noun = getRandomElement(wordLists[category]);
      return `${retirement}${noun}`;
    },
    
    // Pattern 3: Single word + Number
    () => {
      const allWords = Object.values(wordLists).flat();
      const word = getRandomElement(allWords);
      const number = Math.floor(Math.random() * 99) + 1;
      return `${word}${number}`;
    },
    
    // Pattern 4: Two nouns
    () => {
      const category1 = getRandomElement(['freeSpirit', 'traveller', 'scout', 'nature']);
      const category2 = getRandomElement(['freeSpirit', 'traveller', 'scout', 'nature']);
      const noun1 = getRandomElement(wordLists[category1]);
      const noun2 = getRandomElement(wordLists[category2]);
      return `${noun1}${noun2}`;
    }
  ];
  
  const pattern = getRandomElement(patterns);
  const username = pattern();
  
  // Ensure lowercase and add random number if needed for uniqueness
  const baseUsername = username.toLowerCase();
  const shouldAddNumber = Math.random() > 0.5;
  
  if (shouldAddNumber && !baseUsername.match(/\d+$/)) {
    const number = Math.floor(Math.random() * 999) + 1;
    return `${baseUsername}${number}`;
  }
  
  return baseUsername;
};

// Generate multiple username suggestions
export const generateUsernameSuggestions = (count = 6) => {
  const suggestions = new Set();
  
  // Generate unique suggestions
  while (suggestions.size < count) {
    const username = generateUsername();
    // Ensure reasonable length (8-20 characters)
    if (username.length >= 8 && username.length <= 20) {
      suggestions.add(username);
    }
  }
  
  return Array.from(suggestions);
};

// Validate username format
export const validateUsername = (username) => {
  // Username rules:
  // - 3-30 characters long
  // - Only letters, numbers, and underscores
  // - Must start with a letter
  // - No spaces or special characters
  
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be no more than 30 characters long' };
  }
  
  if (!/^[a-zA-Z]/.test(username)) {
    return { isValid: false, error: 'Username must start with a letter' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Check for offensive words (basic list, can be expanded)
  const bannedWords = ['admin', 'root', 'system', 'scout2retire', 'test'];
  const usernameLower = username.toLowerCase();
  
  for (const banned of bannedWords) {
    if (usernameLower.includes(banned)) {
      return { isValid: false, error: 'Username contains restricted words' };
    }
  }
  
  return { isValid: true };
};

// Format username for display
export const formatUsername = (username) => {
  if (!username) return '';
  return username;
};