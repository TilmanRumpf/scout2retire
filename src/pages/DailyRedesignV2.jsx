import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import DailyTownCard from '../components/DailyTownCard';
import { fetchFavorites } from '../utils/townUtils';
import { saveJournalEntry } from '../utils/journalUtils';
import { sanitizeJournalEntry, MAX_LENGTHS } from '../utils/sanitizeUtils';
import PageErrorBoundary from '../components/PageErrorBoundary';
import QuickNav from '../components/QuickNav';
import SimpleImage from '../components/SimpleImage';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import supabase from '../utils/supabaseClient';
import { 
  MapPin, TrendingUp, DollarSign, Cloud, Users, 
  Heart, Compass, Book, MessageSquare, Calendar,
  ArrowRight, RefreshCw, Bell, Sparkles
} from 'lucide-react';

export default function DailyRedesignV2() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [recentTowns, setRecentTowns] = useState([]);
  const [savedLocationsUpdates, setSavedLocationsUpdates] = useState([]);
  const [todaysInspiration, setTodaysInspiration] = useState(null);
  const [inspirationTowns, setInspirationTowns] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user: currentUser, profile } = await getCurrentUser();
        if (currentUser && profile) {
          setUser(profile);
          setUserId(currentUser.id);
          
          // Fetch favorites
          const { success, favorites: userFavorites } = await fetchFavorites(currentUser.id);
          if (success) {
            setFavorites(userFavorites);
            // Mock saved locations updates for now
            if (userFavorites.length > 0) {
              setSavedLocationsUpdates(userFavorites.slice(0, 3).map(fav => ({
                ...fav,
                update: getRandomUpdate()
              })));
            }
          }
          
          // Fetch recently added towns (mock for now - would come from API)
          fetchRecentTowns();
          
          // Set today's regional inspiration
          const inspiration = getDailyInspiration();
          setTodaysInspiration(inspiration);
          
          // Fetch towns for today's inspiration
          if (inspiration) {
            fetchInspirationTowns(inspiration.region);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Mock function to get random updates for saved locations
  const getRandomUpdate = () => {
    const updates = [
      { type: 'cost', text: 'Housing costs down 3% this month', icon: DollarSign, color: 'text-green-600' },
      { type: 'weather', text: 'Perfect 72°F average this week', icon: Cloud, color: 'text-blue-600' },
      { type: 'community', text: 'New retirement community opening', icon: Users, color: 'text-purple-600' },
      { type: 'market', text: '5 new homes listed this week', icon: TrendingUp, color: 'text-scout-accent-600' },
    ];
    return updates[Math.floor(Math.random() * updates.length)];
  };

  // Mock function to fetch recent towns
  const fetchRecentTowns = async () => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) {
        setRecentTowns(data);
      }
    } catch (err) {
      console.error("Error fetching recent towns:", err);
    }
  };

  // Fetch towns for today's inspiration region
  const fetchInspirationTowns = async (regionName) => {
    try {
      let query = supabase.from('towns').select('*');
      
      // Check if it's a broader region or a specific country
      if (regionName === 'Europe') {
        // Define European countries in the database
        const europeanCountries = [
          'Portugal', 'Spain', 'France', 'Italy', 'Greece', 
          'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
          'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
          'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
          'Slovakia', 'Romania', 'Bulgaria', 'Turkey'
        ];
        query = query.in('country', europeanCountries);
      } else if (regionName === 'Central America') {
        // Define Central American countries
        const centralAmericanCountries = [
          'Costa Rica', 'Panama', 'Nicaragua', 'Guatemala', 
          'Belize', 'Honduras', 'El Salvador'
        ];
        query = query.in('country', centralAmericanCountries);
      } else {
        // It's a specific country name
        query = query.eq('country', regionName);
      }
      
      // For regions, get more towns and ensure variety
      const limit = (regionName === 'Europe' || regionName === 'Central America') ? 20 : 6;
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("Error fetching inspiration towns:", error);
      } else if (data) {
        // For regions, try to get variety by selecting from different countries
        if (regionName === 'Europe' || regionName === 'Central America') {
          const townsByCountry = {};
          data.forEach(town => {
            if (!townsByCountry[town.country]) {
              townsByCountry[town.country] = [];
            }
            townsByCountry[town.country].push(town);
          });
          
          // Select up to 6 towns, preferring variety across countries
          const selectedTowns = [];
          const countries = Object.keys(townsByCountry);
          let countryIndex = 0;
          
          while (selectedTowns.length < 6 && selectedTowns.length < data.length) {
            const country = countries[countryIndex % countries.length];
            if (townsByCountry[country] && townsByCountry[country].length > 0) {
              selectedTowns.push(townsByCountry[country].shift());
            }
            countryIndex++;
          }
          
          setInspirationTowns(selectedTowns);
        } else {
          // For single countries, just use the first 6
          setInspirationTowns(data.slice(0, 6));
        }
      }
    } catch (err) {
      console.error("Error fetching inspiration towns:", err);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalEntry.trim()) {
      toast.error('Please write something in your journal');
      return;
    }

    if (!userId) {
      toast.error('User not found. Please log in again.');
      return;
    }

    const validation = sanitizeJournalEntry(journalEntry);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSavingJournal(true);
    try {
      const { success, error } = await saveJournalEntry(
        userId,
        validation.sanitized,
        null
      );

      if (success) {
        toast.success('Journal entry saved!');
        setJournalEntry('');
      } else {
        toast.error(`Failed to save journal entry: ${error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving journal:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setSavingJournal(false);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get daily regional inspiration
  const getDailyInspiration = (random = false) => {
    const inspirations = [
      {
        title: "Harbor towns and seafood?",
        description: "Historic port cellars age world-famous wines while riverside restaurants serve the Atlantic's daily catch. Climb medieval streets to viewpoints where the city spreads below in terracotta and blue.",
        region: "Portugal",
        image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80", // Porto's iconic Dom Luis bridge and port wine cellars
        link: "/discover?country=Portugal"
      },
      {
        title: "Authentic Spanish living?",
        description: "Orange groves surround traditional pueblos where plaza life defines the daily rhythm. Extended family lunches, afternoon siestas, and evening strolls create a lifestyle focused on community and connection.",
        region: "Spain",
        image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80", // Valencia's City of Arts and Sciences
        link: "/discover?country=Spain"
      },
      {
        title: "French Riviera dreaming?",
        description: "Medieval hilltop towns offer spectacular vistas where Alps meet azure Mediterranean. Morning markets showcase regional produce while coastal paths connect charming villages perfect for exploration.",
        region: "France",
        image: "https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=800&q=80", // Nice's famous Promenade des Anglais
        link: "/discover?country=France"
      },
      {
        title: "Italian dolce vita?",
        description: "Rolling hills dotted with cypress trees lead to medieval towns where life unfolds at a perfect pace. Local trattorias serve regional specialties while sunset turns vineyard-covered valleys golden.",
        region: "Italy",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", // Lucca's famous city walls and towers
        link: "/discover?country=Italy"
      },
      {
        title: "Greek island paradise?",
        description: "Whitewashed villages cascade toward sapphire seas where traditional life continues unchanged. Fresh feta, local wine, and grilled fish define meals shared in tavernas overlooking endless Aegean views.",
        region: "Greece",
        image: "https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=800&q=80", // Crete's iconic pink sand beach of Balos
        link: "/discover?country=Greece"
      },
      {
        title: "Turkish coastal charm?",
        description: "Ancient harbors meet modern marinas where East meets West in perfect harmony. Enjoy fresh seafood by turquoise waters while exploring a culture that bridges continents with warmth and hospitality.",
        region: "Turkey",
        image: "https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=800&q=80", // Antalya's harbor with mountains
        link: "/discover?country=Turkey"
      },
      {
        title: "Mexican beach life?",
        description: "Caribbean waters lap white sand beaches while colonial architecture adds historic charm. Fresh ceviche, cold margaritas, and year-round sunshine create the perfect retirement paradise.",
        region: "Mexico",
        image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80", // Playa del Carmen beach and turquoise water
        link: "/discover?country=Mexico"
      },
      {
        title: "Costa Rica pura vida?",
        description: "Rainforest meets ocean where wildlife thrives and expats find their paradise. Sustainable living, fresh tropical fruits, and the famous 'pura vida' lifestyle await in this Central American gem.",
        region: "Costa Rica",
        image: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&q=80", // Tamarindo beach sunset
        link: "/discover?country=Costa Rica"
      },
      {
        title: "Panama mountain escape?",
        description: "Cool mountain towns offer spring-like weather year-round with stunning valley views. Coffee plantations, hiking trails, and a thriving expat community create an ideal retirement haven.",
        region: "Panama",
        image: "https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80", // Boquete's famous volcanic landscape
        link: "/discover?country=Panama"
      },
      {
        title: "Ecuador colonial charm?",
        description: "UNESCO World Heritage cities blend indigenous culture with Spanish colonial architecture. Affordable living, perfect climate, and rich cultural experiences define life in the Andes.",
        region: "Ecuador",
        image: "https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=800&q=80", // Cuenca's iconic blue domed cathedral
        link: "/discover?country=Ecuador"
      },
      {
        title: "Colombian renaissance?",
        description: "Modern cities nestled in eternal spring valleys offer world-class healthcare and vibrant culture. Coffee culture, friendly locals, and dramatic mountain views create an exciting retirement option.",
        region: "Colombia",
        image: "https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=800&q=80", // Medellín's modern skyline with mountains
        link: "/discover?country=Colombia"
      },
      {
        title: "Thai temple towns?",
        description: "Ancient temples dot modern cities where street food culture thrives and costs stay low. Buddhist traditions, tropical climate, and world-renowned hospitality make retirement truly special.",
        region: "Thailand",
        image: "https://images.unsplash.com/photo-1598981457915-aea220950616?w=800&q=80", // Chiang Mai's Doi Suthep temple
        link: "/discover?country=Thailand"
      },
      {
        title: "Malaysian melting pot?",
        description: "Colonial architecture meets modern amenities in cities where cultures blend seamlessly. Excellent healthcare, diverse cuisine, and English-speaking environment simplify the transition to expat life.",
        region: "Malaysia",
        image: "https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800&q=80", // Penang's George Town street art
        link: "/discover?country=Malaysia"
      },
      {
        title: "Dutch waterways and cycling?",
        description: "Charming canal towns where bicycles outnumber cars and water shapes daily life. Excellent healthcare, progressive culture, and flat landscapes perfect for active retirees seeking European sophistication.",
        region: "Netherlands",
        image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80", // Amsterdam canals iconic view
        link: "/discover?country=Netherlands"
      },
      {
        title: "European variety?",
        description: "From Mediterranean beaches to Alpine villages, Europe offers endless retirement possibilities. Rich history, excellent healthcare, and diverse cultures create opportunities for every lifestyle.",
        region: "Europe",
        image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80", // European variety
        link: "/discover?region=Europe"
      },
      {
        title: "Baltic charm awaits?",
        description: "Art nouveau architecture meets vibrant cultural life in walkable historic centers. EU membership ensures quality healthcare while costs remain refreshingly low compared to Western Europe.",
        region: "Latvia",
        image: "https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=800&q=80", // Riga's Art Nouveau district
        link: "/discover?country=Latvia"
      },
      {
        title: "Hidden Alpine gem?",
        description: "Europe's best-kept secret combines Mediterranean warmth with Alpine beauty. Pristine nature, excellent healthcare, and a relaxed pace of life in one of Europe's safest capitals.",
        region: "Slovenia",
        image: "https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=800&q=80", // Ljubljana castle and river
        link: "/discover?country=Slovenia"
      },
      {
        title: "Adriatic paradise?",
        description: "Crystal-clear waters meet ancient Roman architecture along dramatic coastlines. EU membership, affordable living, and over 1,000 islands create endless exploration opportunities.",
        region: "Croatia",
        image: "https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=800&q=80", // Split waterfront
        link: "/discover?country=Croatia"
      },
      {
        title: "Southeast Asian discovery?",
        description: "Modern cities blend French colonial charm with Vietnamese tradition. Incredible cuisine, warm hospitality, and coastal beauty offer retirement at a fraction of Western costs.",
        region: "Vietnam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80", // Da Nang Dragon Bridge
        link: "/discover?country=Vietnam"
      },
      {
        title: "Latin American adventure?",
        description: "Colonial cities, beach towns, and mountain retreats offer affordable luxury across two continents. Rich cultures, warm climates, and welcoming communities define retirement south of the border.",
        region: "Central America",
        image: "https://images.unsplash.com/photo-1512813498716-3e640fed3f39?w=800&q=80", // Central American colonial
        link: "/discover?region=Central America"
      }
    ];
    
    // Use day of year to rotate through inspirations, or random if requested
    if (random) {
      return inspirations[Math.floor(Math.random() * inspirations.length)];
    } else {
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      return inspirations[dayOfYear % inspirations.length];
    }
  };

  // Get retirement timeline with years, months, and days
  const getRetirementTimeline = () => {
    if (!user || !user.retirement_year_estimate) {
      return "Planning your retirement";
    }
    
    const now = new Date();
    const retirementDate = new Date(user.retirement_year_estimate, 0, 1);
    
    // If date is in the past, show retired
    if (retirementDate <= now) {
      return "Enjoying retirement";
    }

    // Calculate years
    let years = retirementDate.getFullYear() - now.getFullYear();
    let months = retirementDate.getMonth() - now.getMonth();
    let days = retirementDate.getDate() - now.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(retirementDate.getFullYear(), retirementDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Build the string
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    
    return parts.length > 0 ? `Retiring in ${parts.join(', ')}` : "Retiring soon";
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading your daily discoveries...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Simplified Header */}
      <header className={`${uiConfig.colors.card} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${uiConfig.colors.heading}`}>
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Explorer'}
              </h1>
              <p className={`text-sm ${uiConfig.colors.body} mt-1`}>
                {getRetirementTimeline()}
              </p>
            </div>
            <Link to="/profile" className={`p-2 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.full}`}>
              <Bell className={`${uiConfig.icons.size.md} ${uiConfig.colors.body}`} />
            </Link>
          </div>
        </div>
      </header>

      <PageErrorBoundary
        fallbackTitle="Dashboard Error"
        fallbackMessage="We're having trouble loading your dashboard. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {/* Split Section: Featured Town and Today's Inspiration */}
          <section className="grid lg:grid-cols-2 gap-6">
            {/* Left: Featured Town */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
                  Featured Town
                </h2>
                <button 
                  onClick={() => window.location.reload()}
                  className={`flex items-center gap-1 text-sm ${uiConfig.colors.accent} hover:underline`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Show Another
                </button>
              </div>
              <DailyTownCard />
            </div>

            {/* Right: Today's Inspiration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
                  Today's Inspiration
                </h2>
                <button 
                  onClick={() => {
                    const newInspiration = getDailyInspiration(true);
                    setTodaysInspiration(newInspiration);
                    if (newInspiration) {
                      fetchInspirationTowns(newInspiration.region);
                    }
                  }}
                  className={`flex items-center gap-1 text-sm ${uiConfig.colors.accent} hover:underline`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Show Another
                </button>
              </div>
              {todaysInspiration && (
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
                  {/* Clean image without text overlay */}
                  <Link to={todaysInspiration.link} className="block relative h-48">
                    <SimpleImage
                      src={todaysInspiration.image}
                      alt={todaysInspiration.region}
                      className="w-full h-full object-cover"
                      fallbackIcon={MapPin}
                      fallbackIconSize={48}
                    />
                  </Link>
                  
                  {/* Content section with all text - matching DailyTownCard padding */}
                  <div className="p-5">
                    {/* Header matching DailyTownCard format */}
                    <div className="flex justify-between items-baseline mb-3">
                      <div>
                        <h3 className={`text-lg md:text-xl font-semibold ${uiConfig.colors.heading} mb-1`}>{todaysInspiration.title}</h3>
                        <p className={`text-sm ${uiConfig.colors.body}`}>{todaysInspiration.region}</p>
                      </div>
                    </div>
                    
                    {/* Description section - responsive height */}
                    <div className={`mb-4 ${uiConfig.colors.body} text-sm md:text-base leading-relaxed`}>
                      <p className="min-h-[4rem] md:min-h-[4.5rem]">
                        {todaysInspiration.description}
                      </p>
                    </div>

                    {/* Towns in this region - matching preferences style */}
                    <div className={`text-sm ${uiConfig.colors.body} mb-2`}>
                      Towns in {todaysInspiration.region}:
                    </div>
                    
                    {/* Towns list */}
                    <div className="mb-5">
                      {inspirationTowns.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {inspirationTowns.map((town) => (
                            <Link
                              key={town.id}
                              to={`/discover?town=${town.id}`}
                              className={`text-xs px-2 py-1 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                            >
                              {town.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-xs ${uiConfig.colors.body}`}>Loading towns...</p>
                      )}
                    </div>
                    
                    {/* Action buttons matching DailyTownCard */}
                    <div className="flex justify-between items-center">
                      <Link 
                        to={todaysInspiration.link}
                        className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
                      >
                        Explore Region
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(todaysInspiration.region + ', Europe')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${uiConfig.colors.success} text-sm hover:underline`}
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Updates & Discoveries */}
            <div className="space-y-8">
              {/* Updates from Saved Locations */}
              {savedLocationsUpdates.length > 0 && (
                <section>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Updates from Your Favorites
                  </h3>
                  <div className="space-y-3">
                    {savedLocationsUpdates.map((update) => {
                      const town = update.towns;
                      const UpdateIcon = update.update.icon;
                      return (
                        <Link
                          key={update.town_id}
                          to={`/discover?town=${town.id}`}
                          className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 hover:shadow-md transition-shadow flex items-center gap-4`}
                        >
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <SimpleImage
                              src={town.image_url_1}
                              alt={town.name}
                              className={`w-full h-full object-cover ${uiConfig.layout.radius.md}`}
                              fallbackIcon={MapPin}
                              fallbackIconSize={32}
                            />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${uiConfig.colors.heading}`}>{town.name}, {town.region}</p>
                            <div className={`flex items-center gap-2 mt-1 ${update.update.color}`}>
                              <UpdateIcon className="w-4 h-4" />
                              <p className="text-sm">{update.update.text}</p>
                            </div>
                          </div>
                          <ArrowRight className={`w-5 h-5 ${uiConfig.colors.muted}`} />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Fresh Discoveries */}
              <section>
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                  Fresh Discoveries
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {recentTowns.map((town) => (
                    <Link
                      key={town.id}
                      to={`/discover?town=${town.id}`}
                      className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} overflow-hidden hover:shadow-md transition-shadow`}
                    >
                      <div className="relative h-32">
                        <SimpleImage
                          src={town.image_url_1}
                          alt={town.name}
                          className="w-full h-full object-cover"
                          fallbackIcon={MapPin}
                          fallbackIconSize={32}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs ${uiConfig.layout.radius.full} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${uiConfig.colors.body}`}>
                            New
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>{town.name}</p>
                        <p className={`text-xs ${uiConfig.colors.body}`}>{town.region}, {town.country}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Planning Tools */}
            <div className="space-y-8">
              {/* Quick Planning Actions */}
              <section>
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                  Plan Your Journey
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/compare" 
                    className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 hover:shadow-md transition-shadow text-center`}
                  >
                    <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${uiConfig.colors.accent}`} />
                    <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>Compare Towns</p>
                    <p className={`text-xs ${uiConfig.colors.body} mt-1`}>{favorites.length} saved</p>
                  </Link>
                  
                  <Link 
                    to="/schedule" 
                    className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 hover:shadow-md transition-shadow text-center`}
                  >
                    <Calendar className={`w-8 h-8 mx-auto mb-2 ${uiConfig.colors.accent}`} />
                    <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>Visit Schedule</p>
                    <p className={`text-xs ${uiConfig.colors.body} mt-1`}>Plan trips</p>
                  </Link>
                  
                  <Link 
                    to="/chat" 
                    className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 hover:shadow-md transition-shadow text-center`}
                  >
                    <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${uiConfig.colors.accent}`} />
                    <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>AI Assistant</p>
                    <p className={`text-xs ${uiConfig.colors.body} mt-1`}>Get advice</p>
                  </Link>
                  
                  <Link 
                    to="/journal" 
                    className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 hover:shadow-md transition-shadow text-center`}
                  >
                    <Book className={`w-8 h-8 mx-auto mb-2 ${uiConfig.colors.accent}`} />
                    <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>Journal</p>
                    <p className={`text-xs ${uiConfig.colors.body} mt-1`}>Your thoughts</p>
                  </Link>
                </div>
              </section>

              {/* Today's Reflection */}
              <section>
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                  Today's Reflection
                </h3>
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-5`}>
                  <p className={`${uiConfig.colors.body} mb-3 text-sm`}>
                    What aspects of retirement locations matter most to you today?
                  </p>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Today I'm thinking about..."
                    className={`w-full px-3 py-2 ${uiConfig.colors.input} ${uiConfig.colors.border} ${uiConfig.layout.radius.md} resize-none h-24 text-sm`}
                    maxLength={MAX_LENGTHS.JOURNAL_ENTRY}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-xs ${uiConfig.colors.hint}`}>
                      {journalEntry.length}/{MAX_LENGTHS.JOURNAL_ENTRY}
                    </span>
                    <button
                      onClick={handleSaveJournal}
                      disabled={savingJournal || !journalEntry.trim()}
                      className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} text-sm ${uiConfig.font.weight.medium} disabled:opacity-50`}
                    >
                      {savingJournal ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Daily Tip */}
              <section className={`${uiConfig.colors.statusInfo} ${uiConfig.layout.radius.lg} p-4`}>
                <h4 className={`font-medium ${uiConfig.colors.heading} mb-2 text-sm`}>
                  Retirement Planning Tip
                </h4>
                <p className={`text-sm ${uiConfig.colors.body}`}>
                  Consider visiting your top retirement destinations during different seasons. 
                  Weather, crowds, and local activities can vary significantly throughout the year.
                </p>
              </section>
            </div>
          </div>

          {/* Explore More */}
          <section className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-6 text-center`}>
            <Compass className={`w-12 h-12 ${uiConfig.colors.accent} mx-auto mb-3`} />
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-2`}>
              Ready to explore more?
            </h3>
            <p className={`${uiConfig.colors.body} mb-4`}>
              Discover all {recentTowns.length > 0 ? '200+' : ''} retirement destinations matched to your preferences
            </p>
            <Link
              to="/discover"
              className={`inline-flex items-center px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${uiConfig.font.weight.medium}`}
            >
              <Compass className="w-4 h-4 mr-2" />
              Explore All Towns
            </Link>
          </section>
        </main>
      </PageErrorBoundary>

      <QuickNav />
    </div>
  );
}