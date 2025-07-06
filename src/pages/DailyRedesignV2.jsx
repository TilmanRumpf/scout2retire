import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import DailyTownCard from '../components/DailyTownCard';
import { fetchFavorites } from '../utils/townUtils';
import { saveJournalEntry } from '../utils/journalUtils';
import { sanitizeJournalEntry, MAX_LENGTHS } from '../utils/sanitizeUtils';
import PageErrorBoundary from '../components/PageErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
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
  const [dailyTip, setDailyTip] = useState(null);
  
  // Debug
  console.log('DailyRedesignV2 rendering');

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
          const inspiration = await getDailyInspiration();
          setTodaysInspiration(inspiration);
          
          // Fetch towns for today's inspiration
          if (inspiration) {
            fetchInspirationTowns(inspiration.region);
          }
          
          // Fetch daily retirement tip
          fetchDailyTip();
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
      const { data } = await supabase
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

  // Fetch daily retirement tip
  const fetchDailyTip = async () => {
    try {
      // First, try to get all tips to select one based on day
      const { data: allTips, error: countError } = await supabase
        .from('retirement_tips')
        .select('*')
        .order('id');
      
      if (countError || !allTips || allTips.length === 0) {
        // Fallback to a default tip if table is empty or there's an error
        setDailyTip({
          title: 'Visit during different seasons',
          content: 'Consider visiting your top retirement destinations during different seasons. Weather, crowds, and local activities can vary significantly throughout the year.',
          category: 'lifestyle'
        });
        return;
      }
      
      // Use day of year to rotate through tips
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const tipIndex = dayOfYear % allTips.length;
      setDailyTip(allTips[tipIndex]);
      
    } catch (err) {
      console.error("Error fetching daily tip:", err);
      // Set fallback tip on error
      setDailyTip({
        title: 'Visit during different seasons',
        content: 'Consider visiting your top retirement destinations during different seasons. Weather, crowds, and local activities can vary significantly throughout the year.',
        category: 'lifestyle'
      });
    }
  };

  // Fetch towns for today's inspiration region
  const fetchInspirationTowns = async (regionName) => {
    try {
      let query = supabase.from('towns').select('*');
      
      // Define regions and their countries
      const regionDefinitions = {
        'Europe': [
          'Portugal', 'Spain', 'France', 'Italy', 'Greece', 
          'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
          'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
          'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
          'Slovakia', 'Romania', 'Bulgaria', 'Turkey'
        ],
        'Central America': [
          'Costa Rica', 'Panama', 'Nicaragua', 'Guatemala', 
          'Belize', 'Honduras', 'El Salvador'
        ],
        'Mediterranean': [
          'Spain', 'France', 'Italy', 'Greece', 'Turkey',
          'Croatia', 'Malta', 'Cyprus', 'Morocco', 'Tunisia'
        ],
        'Caribbean': [
          'Barbados', 'Dominican Republic', 'Jamaica', 'Bahamas',
          'Trinidad and Tobago', 'Cuba', 'Puerto Rico'
        ],
        'Southeast Asia': [
          'Thailand', 'Malaysia', 'Philippines', 'Vietnam', 
          'Cambodia', 'Indonesia', 'Singapore', 'Laos', 'Myanmar'
        ]
      };
      
      const isRegion = Object.prototype.hasOwnProperty.call(regionDefinitions, regionName);
      
      if (isRegion) {
        // Use the regions array column which is now populated
        query = query.contains('regions', [regionName]);
      } else {
        // It's a specific country name
        query = query.eq('country', regionName);
      }
      
      // For regions, get more towns and ensure variety
      const limit = isRegion ? 20 : 6;
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error("Error fetching inspiration towns:", error);
        console.error("Query was for:", regionName, "isRegion:", isRegion);
      } else if (data) {
        console.log(`Fetched ${data.length} towns for ${regionName}:`, data.map(t => `${t.name} (${t.country})`));
        // For regions, try to get variety by selecting from different countries
        if (isRegion && data.length > 6) {
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
          
          while (selectedTowns.length < 13 && selectedTowns.length < data.length) {
            const country = countries[countryIndex % countries.length];
            if (townsByCountry[country] && townsByCountry[country].length > 0) {
              selectedTowns.push(townsByCountry[country].shift());
            }
            countryIndex++;
          }
          
          setInspirationTowns(selectedTowns);
        } else {
          // For single countries or small results, just use what we have
          setInspirationTowns(data);
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

  // Get daily regional inspiration from database
  const getDailyInspiration = async () => {
    try {
      // Fetch all inspirations from database
      const { data, error } = await supabase
        .from('regional_inspirations')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error || !data || data.length === 0) {
        console.error('Error fetching inspirations:', error);
        // Fallback to a default inspiration
        return {
          title: "Discover your perfect retirement destination",
          description: "Explore personalized recommendations based on your preferences for climate, culture, and lifestyle.",
          region: "Worldwide",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
          link: "/discover"
        };
      }
      
      // Use day of year to rotate through inspirations
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const inspirationIndex = dayOfYear % data.length;
      
      // Map database fields to component fields
      const inspiration = data[inspirationIndex];
      return {
        title: inspiration.title,
        description: inspiration.description,
        region: inspiration.region_name,
        image: inspiration.image_url,
        link: inspiration.link
      };
      
    } catch (err) {
      console.error("Error in getDailyInspiration:", err);
      // Return fallback
      return {
        title: "Discover your perfect retirement destination",
        description: "Explore personalized recommendations based on your preferences for climate, culture, and lifestyle.",
        region: "Worldwide",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        link: "/discover"
      };
    }
  };

  // Get retirement timeline with years, months, and days
  const getRetirementTimeline = () => {
    if (!user || !user.retirement_year_estimate) {
      return "Planning your retirement";
    }
    
    const now = new Date();
    const retirementDate = user.retirement_date 
      ? new Date(user.retirement_date)
      : new Date(user.retirement_year_estimate, 0, 1);
    
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
      {(() => {
        try {
          return (
            <UnifiedHeader 
              title="brings your future home to life long before you arrive..."
              subtitle={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Explorer'}! ${getRetirementTimeline()}`}
            />
          );
        } catch (error) {
          console.error('AppHeader error:', error);
          return <div className="bg-red-500 text-white p-4">AppHeader Error: {error.message}</div>;
        }
      })()}

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
                  onClick={async () => {
                    try {
                      // Fetch all inspirations
                      const { data, error } = await supabase
                        .from('regional_inspirations')
                        .select('*')
                        .eq('is_active', true);
                      
                      if (error || !data || data.length === 0) {
                        console.error('Error fetching inspirations:', error);
                        return;
                      }
                      
                      // Get a random inspiration different from current
                      let newInspiration;
                      do {
                        const randomIndex = Math.floor(Math.random() * data.length);
                        const inspiration = data[randomIndex];
                        newInspiration = {
                          title: inspiration.title,
                          description: inspiration.description,
                          region: inspiration.region_name,
                          image: inspiration.image_url,
                          link: inspiration.link
                        };
                      } while (newInspiration.region === todaysInspiration.region && data.length > 1);
                      
                      setTodaysInspiration(newInspiration);
                      fetchInspirationTowns(newInspiration.region);
                    } catch (err) {
                      console.error("Error getting new inspiration:", err);
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
                    {inspirationTowns.length > 0 && (
                      <>
                        <div className={`text-sm ${uiConfig.colors.body} mb-2`}>
                          Towns in {todaysInspiration.region}:
                        </div>
                        
                        {/* Towns list */}
                        <div className="mb-5">
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
                        </div>
                      </>
                    )}
                    
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
              <section>
                <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                  Retirement Planning Tips
                </h3>
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-5`}>
                  {dailyTip ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${uiConfig.colors.heading}`}>
                          {dailyTip.title}
                        </h4>
                        {dailyTip.category && (
                          <span className={`text-xs px-2 py-1 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.full} capitalize`}>
                            {dailyTip.category}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${uiConfig.colors.body}`}>
                        {dailyTip.content}
                      </p>
                    </>
                  ) : (
                    <p className={`text-sm ${uiConfig.colors.body}`}>
                      Loading today's tip...
                    </p>
                  )}
                </div>
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
    </div>
  );
}