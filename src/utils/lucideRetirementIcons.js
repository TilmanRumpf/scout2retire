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