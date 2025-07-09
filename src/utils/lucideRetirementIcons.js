import * as Icons from 'lucide-react';

// Map of retirement-themed icons using Lucide React
export const LUCIDE_RETIREMENT_ICONS = {
  beach: {
    sun: Icons.Sun,
    waves: Icons.Waves,
    palmTree: Icons.Palmtree,
    fish: Icons.Fish,
    sailboat: Icons.Sailboat,
    anchor: Icons.Anchor,
    sunset: Icons.Sunset,
    umbrella: Icons.Umbrella,
    shell: Icons.Shell,
    cocktail: Icons.Wine,
    sunglasses: Icons.Sunglasses,
    lifebuoy: Icons.LifeBuoy,
    wind: Icons.Wind,
    cloud: Icons.Cloud,
    rainbow: Icons.Rainbow,
  },
  
  mountain: {
    mountain: Icons.Mountain,
    tree: Icons.Trees,
    tent: Icons.Tent,
    campfire: Icons.Flame,
    compass: Icons.Compass,
    map: Icons.Map,
    backpack: Icons.Backpack,
    binoculars: Icons.Binoculars,
    camera: Icons.Camera,
    hiking: Icons.PersonStanding,
    sunrise: Icons.Sunrise,
    snowflake: Icons.Snowflake,
    thermometer: Icons.Thermometer,
    flashlight: Icons.Flashlight,
    navigation: Icons.Navigation,
  },
  
  wine: {
    wine: Icons.Wine,
    grapes: Icons.Grape,
    utensils: Icons.Utensils,
    coffee: Icons.Coffee,
    beer: Icons.Beer,
    martini: Icons.Martini,
    chefHat: Icons.ChefHat,
    soup: Icons.Soup,
    cake: Icons.Cake,
    pizza: Icons.Pizza,
    croissant: Icons.Croissant,
    cherry: Icons.Cherry,
    wheat: Icons.Wheat,
    sandwich: Icons.Sandwich,
    popcorn: Icons.Popcorn,
  },
  
  hobbies: {
    golf: Icons.Flag,
    fishing: Icons.FishSymbol,
    garden: Icons.Flower,
    paint: Icons.Palette,
    book: Icons.Book,
    music: Icons.Music,
    gamepad: Icons.Gamepad2,
    puzzle: Icons.Puzzle,
    camera: Icons.Camera,
    pen: Icons.PenTool,
    brush: Icons.Brush,
    scissors: Icons.Scissors,
    dice: Icons.Dices,
    trophy: Icons.Trophy,
    medal: Icons.Medal,
  },
  
  travel: {
    plane: Icons.Plane,
    train: Icons.Train,
    car: Icons.Car,
    bus: Icons.Bus,
    ship: Icons.Ship,
    globe: Icons.Globe,
    luggage: Icons.Luggage,
    passport: Icons.CreditCard,
    ticket: Icons.Ticket,
    map: Icons.MapPin,
    hotel: Icons.Hotel,
    landmark: Icons.Landmark,
    compass2: Icons.Compass,
    route: Icons.Route,
    fuel: Icons.Fuel,
  },
  
  social: {
    users: Icons.Users,
    heart: Icons.Heart,
    message: Icons.MessageCircle,
    phone: Icons.Phone,
    video: Icons.Video,
    gift: Icons.Gift,
    party: Icons.PartyPopper,
    handshake: Icons.Handshake,
    smile: Icons.Smile,
    calendar: Icons.Calendar,
    mail: Icons.Mail,
    share: Icons.Share2,
    thumbsUp: Icons.ThumbsUp,
    star: Icons.Star,
    sparkles: Icons.Sparkles,
  },
  
  wellness: {
    heart: Icons.HeartPulse,
    activity: Icons.Activity,
    accessibility: Icons.Accessibility,
    brain: Icons.Brain,
    dumbbell: Icons.Dumbbell,
    yoga: Icons.PersonStanding,
    apple: Icons.Apple,
    pill: Icons.Pill,
    shield: Icons.ShieldCheck,
    sun: Icons.Sun,
    moon: Icons.Moon,
    watch: Icons.Watch,
    leaf: Icons.Leaf,
    droplet: Icons.Droplet,
    stethoscope: Icons.Stethoscope,
  },
  
  culture: {
    library: Icons.Library,
    graduation: Icons.GraduationCap,
    languages: Icons.Languages,
    theater: Icons.Clapperboard,
    museum: Icons.Building,
    art: Icons.Paintbrush,
    music: Icons.Music2,
    mic: Icons.Mic,
    radio: Icons.Radio,
    tv: Icons.Tv,
    bookOpen: Icons.BookOpen,
    newspaper: Icons.Newspaper,
    pencil: Icons.Pencil,
    glasses: Icons.Glasses,
    award: Icons.Award,
  },
  
  finance: {
    wallet: Icons.Wallet,
    piggyBank: Icons.PiggyBank,
    calculator: Icons.Calculator,
    chart: Icons.TrendingUp,
    coins: Icons.Coins,
    creditCard: Icons.CreditCard,
    receipt: Icons.Receipt,
    bank: Icons.Building2,
    lock: Icons.Lock,
    shield: Icons.Shield,
    dollarSign: Icons.DollarSign,
    briefcase: Icons.Briefcase,
    lineChart: Icons.LineChart,
    pieChart: Icons.PieChart,
    percent: Icons.Percent,
  },
  
  lifestyle: {
    home: Icons.Home,
    building: Icons.Building,
    key: Icons.Key,
    bed: Icons.Bed,
    sofa: Icons.Sofa,
    lamp: Icons.Lamp,
    pet: Icons.Cat,
    dog: Icons.Dog,
    plant: Icons.Flower2,
    tools: Icons.Wrench,
    lightbulb: Icons.Lightbulb,
    wifi: Icons.Wifi,
    tv2: Icons.Tv2,
    armchair: Icons.Armchair,
    bird: Icons.Bird,
  }
};

// Get all icons as a flat array for selection
export function getAllLucideIcons() {
  const icons = [];
  Object.keys(LUCIDE_RETIREMENT_ICONS).forEach(category => {
    Object.keys(LUCIDE_RETIREMENT_ICONS[category]).forEach(name => {
      icons.push({
        category,
        name,
        id: `${category}_${name}`,
        Component: LUCIDE_RETIREMENT_ICONS[category][name]
      });
    });
  });
  return icons;
}

// Color presets for avatars
export const AVATAR_COLORS = {
  iconColors: [
    '#8fbc8f', // Scout green
    '#4682B4', // Steel blue
    '#20B2AA', // Light sea green
    '#DAA520', // Goldenrod
    '#CD853F', // Peru
    '#BC8F8F', // Rosy brown
    '#9370DB', // Medium purple
    '#FF6347', // Tomato
    '#48D1CC', // Medium turquoise
    '#F4A460', // Sandy brown
    '#DDA0DD', // Plum
    '#87CEEB', // Sky blue
    '#98FB98', // Pale green
    '#FFB6C1', // Light pink
    '#F0E68C', // Khaki
    '#B0C4DE', // Light steel blue
  ],
  backgroundColors: [
    '#FFFFFF', // White
    '#F5F5F5', // Light gray
    '#E8F5E9', // Light green
    '#E3F2FD', // Light blue
    '#FFF3E0', // Light orange
    '#FCE4EC', // Light pink
    '#F3E5F5', // Light purple
    '#E0F2F1', // Light teal
    '#FFF8DC', // Cornsilk
    '#F0F8FF', // Alice blue
    '#F5FFFA', // Mint cream
    '#FFFAF0', // Floral white
  ]
};

// Preset combinations that look great
export const ICON_PRESETS = [
  // Beach themes
  { category: 'beach', icon: 'sun', color: '#FF6347', bg: '#FFF3E0', name: 'Sunset Beach' },
  { category: 'beach', icon: 'waves', color: '#20B2AA', bg: '#E0F2F1', name: 'Ocean Waves' },
  { category: 'beach', icon: 'palmTree', color: '#228B22', bg: '#E8F5E9', name: 'Tropical Paradise' },
  { category: 'beach', icon: 'sailboat', color: '#4682B4', bg: '#E3F2FD', name: 'Sailing Life' },
  { category: 'beach', icon: 'shell', color: '#DDA0DD', bg: '#F3E5F5', name: 'Seashell Collector' },
  
  // Mountain themes
  { category: 'mountain', icon: 'mountain', color: '#8B7355', bg: '#FFF8DC', name: 'Mountain Peak' },
  { category: 'mountain', icon: 'tree', color: '#228B22', bg: '#E8F5E9', name: 'Forest Explorer' },
  { category: 'mountain', icon: 'tent', color: '#CD853F', bg: '#FFF3E0', name: 'Happy Camper' },
  { category: 'mountain', icon: 'sunrise', color: '#FF6347', bg: '#FCE4EC', name: 'Morning Hiker' },
  { category: 'mountain', icon: 'compass', color: '#4682B4', bg: '#E3F2FD', name: 'Trail Navigator' },
  
  // Wine & Dining
  { category: 'wine', icon: 'wine', color: '#722F37', bg: '#FCE4EC', name: 'Wine Enthusiast' },
  { category: 'wine', icon: 'coffee', color: '#8B4513', bg: '#FFF8DC', name: 'Coffee Lover' },
  { category: 'wine', icon: 'chefHat', color: '#DAA520', bg: '#FFF3E0', name: 'Master Chef' },
  { category: 'wine', icon: 'pizza', color: '#FF6347', bg: '#FFF3E0', name: 'Pizza Friday' },
  { category: 'wine', icon: 'croissant', color: '#DAA520', bg: '#FFFAF0', name: 'French Breakfast' },
  
  // Hobbies
  { category: 'hobbies', icon: 'book', color: '#8B4513', bg: '#FFF8DC', name: 'Book Worm' },
  { category: 'hobbies', icon: 'music', color: '#9370DB', bg: '#F3E5F5', name: 'Music Lover' },
  { category: 'hobbies', icon: 'paint', color: '#FF6347', bg: '#FCE4EC', name: 'Artist Soul' },
  { category: 'hobbies', icon: 'garden', color: '#228B22', bg: '#E8F5E9', name: 'Green Thumb' },
  { category: 'hobbies', icon: 'trophy', color: '#DAA520', bg: '#FFF3E0', name: 'Champion' },
  
  // Travel
  { category: 'travel', icon: 'plane', color: '#4682B4', bg: '#E3F2FD', name: 'World Traveler' },
  { category: 'travel', icon: 'globe', color: '#20B2AA', bg: '#E0F2F1', name: 'Globe Trotter' },
  { category: 'travel', icon: 'luggage', color: '#CD853F', bg: '#FFF8DC', name: 'Ready to Go' },
  { category: 'travel', icon: 'landmark', color: '#8B7355', bg: '#FFFAF0', name: 'Culture Seeker' },
  { category: 'travel', icon: 'route', color: '#48D1CC', bg: '#E0F2F1', name: 'Road Tripper' },
  
  // Social
  { category: 'social', icon: 'heart', color: '#FF6347', bg: '#FCE4EC', name: 'Warm Heart' },
  { category: 'social', icon: 'users', color: '#4682B4', bg: '#E3F2FD', name: 'Community Builder' },
  { category: 'social', icon: 'party', color: '#FF69B4', bg: '#FCE4EC', name: 'Party Host' },
  { category: 'social', icon: 'smile', color: '#FFB6C1', bg: '#FFF3E0', name: 'Happy Retiree' },
  { category: 'social', icon: 'sparkles', color: '#DDA0DD', bg: '#F3E5F5', name: 'Shine Bright' },
  
  // Wellness
  { category: 'wellness', icon: 'yoga', color: '#9370DB', bg: '#F3E5F5', name: 'Yoga Master' },
  { category: 'wellness', icon: 'heart', color: '#FF6347', bg: '#FCE4EC', name: 'Healthy Heart' },
  { category: 'wellness', icon: 'apple', color: '#228B22', bg: '#E8F5E9', name: 'Healthy Eater' },
  { category: 'wellness', icon: 'sun', color: '#FFD700', bg: '#FFF3E0', name: 'Sunshine' },
  { category: 'wellness', icon: 'leaf', color: '#8fbc8f', bg: '#E8F5E9', name: 'Natural Living' },
  
  // Culture
  { category: 'culture', icon: 'library', color: '#8B4513', bg: '#FFF8DC', name: 'Library Regular' },
  { category: 'culture', icon: 'graduation', color: '#4682B4', bg: '#E3F2FD', name: 'Lifelong Learner' },
  { category: 'culture', icon: 'art', color: '#9370DB', bg: '#F3E5F5', name: 'Art Appreciator' },
  { category: 'culture', icon: 'music', color: '#FF6347', bg: '#FCE4EC', name: 'Concert Goer' },
  { category: 'culture', icon: 'glasses', color: '#48D1CC', bg: '#E0F2F1', name: 'Wise Scholar' },
  
  // Finance
  { category: 'finance', icon: 'piggyBank', color: '#FFB6C1', bg: '#FCE4EC', name: 'Smart Saver' },
  { category: 'finance', icon: 'chart', color: '#228B22', bg: '#E8F5E9', name: 'Growth Minded' },
  { category: 'finance', icon: 'shield', color: '#4682B4', bg: '#E3F2FD', name: 'Secure Future' },
  { category: 'finance', icon: 'briefcase', color: '#8B4513', bg: '#FFF8DC', name: 'Professional' },
  { category: 'finance', icon: 'dollarSign', color: '#228B22', bg: '#E8F5E9', name: 'Financial Free' },
  
  // Lifestyle
  { category: 'lifestyle', icon: 'home', color: '#8fbc8f', bg: '#E8F5E9', name: 'Homebody' },
  { category: 'lifestyle', icon: 'dog', color: '#CD853F', bg: '#FFF8DC', name: 'Dog Lover' },
  { category: 'lifestyle', icon: 'pet', color: '#DDA0DD', bg: '#F3E5F5', name: 'Cat Person' },
  { category: 'lifestyle', icon: 'plant', color: '#228B22', bg: '#E8F5E9', name: 'Plant Parent' },
  { category: 'lifestyle', icon: 'lightbulb', color: '#FFD700', bg: '#FFF3E0', name: 'Bright Ideas' },
];

// Function to get a random preset
export function getRandomPreset() {
  return ICON_PRESETS[Math.floor(Math.random() * ICON_PRESETS.length)];
}

// Function to get presets by category
export function getPresetsByCategory(category) {
  return ICON_PRESETS.filter(preset => preset.category === category);
}