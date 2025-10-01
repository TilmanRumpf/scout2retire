import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites } from '../utils/townUtils.jsx';
import DailyTownCard from '../components/DailyTownCard';
import { saveJournalEntry } from '../utils/journalUtils';
import { sanitizeJournalEntry, MAX_LENGTHS } from '../utils/sanitizeUtils';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import OptimizedImage from '../components/OptimizedImage';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import supabase from '../utils/supabaseClient';
import { filterTownsWithImagesDebug } from '../utils/imageValidation';
import { getPersonalizedTowns } from '../utils/scoring';
import {
  MapPin, TrendingUp, DollarSign, Cloud, Users,
  Heart, Compass, Book, MessageSquare, Calendar,
  ArrowRight, RefreshCw, Bell, Sparkles, Trophy
} from 'lucide-react';

export default function DailyRedesignV2() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const userId = authUser?.id;
  const user = profile;
  const [dataLoading, setDataLoading] = useState(true);
  const loading = userLoading || dataLoading;
  const [journalEntry, setJournalEntry] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [recentTowns, setRecentTowns] = useState([]);
  const [savedLocationsUpdates, setSavedLocationsUpdates] = useState([]);
  const [todaysInspiration, setTodaysInspiration] = useState(null);
  const [inspirationTowns, setInspirationTowns] = useState([]);
  const [dailyTip, setDailyTip] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [pageVisible, setPageVisible] = useState(false);
  const navigate = useNavigate();

  // Smooth page fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const result = await getCurrentUser();
      setAuthUser(result.user);
      setProfile(result.profile);
      setUserLoading(false);
    };
    loadUser();
  }, []);
  
  // Load favorites when user is loaded
  useEffect(() => {
    if (authUser?.id) {
      const loadFavorites = async () => {
        const result = await fetchFavorites(authUser.id, 'DailyRedesignV2');
        if (result.success) {
          setFavorites(result.favorites);
        }
      };
      loadFavorites();
    }
  }, [authUser]);

  // Load top matches when user is loaded
  useEffect(() => {
    if (authUser?.id) {
      const loadTopMatches = async () => {
        try {
          const result = await getPersonalizedTowns(authUser.id, { limit: 10 });
          if (result.success && result.towns) {
            // Sort by match score descending and take top 10
            const sorted = [...result.towns].sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
            setTopMatches(sorted);
          }
        } catch (error) {
          console.error('Error loading top matches:', error);
        }
      };
      loadTopMatches();
    }
  }, [authUser]);
  
  // Component renders

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (authUser && profile) {
          // Mock saved locations updates for now
          if (favorites.length > 0) {
            setSavedLocationsUpdates(favorites.slice(0, 3).map(fav => ({
              ...fav,
              update: getRandomUpdate()
            })));
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
        setDataLoading(false);
      }
    };

    loadUserData();
  }, [authUser?.id]); // Only re-run when user ID changes

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
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '')
        .not('image_url_1', 'ilike', 'NULL')  // CRITICAL: Only towns with photos (exclude 'NULL' string)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) {
        // SAFETY: Double-check filtering on client side
        const validTowns = filterTownsWithImagesDebug(data, 'Recent Towns');
        setRecentTowns(validTowns);
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
      
      // Filter for towns with photos (quality control) - CRITICAL SAFETY FEATURE
      query = query
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '')
        .not('image_url_1', 'ilike', 'NULL')  // Filter out 'NULL' string
        .not('image_url_1', 'eq', 'null');   // Filter out lowercase 'null' string
      
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
        // Successfully fetched towns for inspiration
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
          
          // SAFETY: Filter out any towns without valid images
          const validTowns = filterTownsWithImagesDebug(selectedTowns, 'Daily Inspiration - Region');
          setInspirationTowns(validTowns);
        } else {
          // For single countries or small results, just use what we have
          // SAFETY: Filter out any towns without valid images
          const validTowns = filterTownsWithImagesDebug(data, 'Daily Inspiration - Country');
          setInspirationTowns(validTowns);
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
    <div
      className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4 transition-opacity duration-700 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {(() => {
        try {
          return (
            <UnifiedHeader 
              title="brings your future home to life long before you arrive..."
              subtitle={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Explorer'}! ${getRetirementTimeline()}`}
            />
          );
        } catch (error) {
          console.error('UnifiedHeader error:', error);
          return <div className="bg-red-500 text-white p-4">UnifiedHeader Error: {error.message}</div>;
        }
      })()}

      <UnifiedErrorBoundary variant="compact"
        fallbackTitle="Dashboard Error"
        fallbackMessage="We're having trouble loading your dashboard. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        {/* Spacer for fixed header */}
        <HeaderSpacer hasFilters={false} />

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {/* Your Top Matches - 2 rows of 5 towns */}
          {topMatches.length > 0 && (
            <section className="transition-opacity duration-500 opacity-100">
              <div className="mb-4">
                <h2 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
                  Your Top Matches
                </h2>
              </div>

              <div className="space-y-3">
                {/* First row - towns 0-4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {topMatches.slice(0, 5).map((town) => (
                    <button
                      key={town.id}
                      onClick={() => navigate(`/town/${town.id}`)}
                      className={`p-3 ${uiConfig.colors.card} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} ${uiConfig.animation.transition} transform hover:scale-105 text-left`}
                    >
                      <div className="mb-2">
                        <span className={`font-medium ${uiConfig.colors.heading} text-sm block`}>
                          {town.name}, {town.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 ${uiConfig.layout.radius.full} font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                          {town.matchScore}% match
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Second row - towns 5-9 */}
                {topMatches.length > 5 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {topMatches.slice(5, 10).map((town) => (
                      <button
                        key={town.id}
                        onClick={() => navigate(`/town/${town.id}`)}
                        className={`p-3 ${uiConfig.colors.card} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} ${uiConfig.animation.transition} transform hover:scale-105 text-left`}
                      >
                        <div className="mb-2">
                          <span className={`font-medium ${uiConfig.colors.heading} text-sm block`}>
                            {town.name}, {town.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 ${uiConfig.layout.radius.full} font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                            {town.matchScore}% match
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

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
                    <OptimizedImage
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
                      <button
                        onClick={() => {
                          // Build HTML for a standalone map page with markers using Leaflet.js + OpenStreetMap (FREE, no API key)
                          const townsWithCoords = inspirationTowns.filter(t => {
                            const hasLat = t.latitude !== null && t.latitude !== undefined && t.latitude !== '';
                            const hasLng = t.longitude !== null && t.longitude !== undefined && t.longitude !== '';
                            const validLat = hasLat && !isNaN(parseFloat(t.latitude));
                            const validLng = hasLng && !isNaN(parseFloat(t.longitude));
                            return validLat && validLng;
                          });

                          if (townsWithCoords.length === 0) {
                            alert(`No towns in ${todaysInspiration.region} have valid coordinates in the database.`);
                            window.open(`https://www.google.com/maps/search/${encodeURIComponent(todaysInspiration.region)}`, '_blank');
                            return;
                          }

                          // Calculate center
                          const avgLat = townsWithCoords.reduce((sum, t) => sum + parseFloat(t.latitude), 0) / townsWithCoords.length;
                          const avgLng = townsWithCoords.reduce((sum, t) => sum + parseFloat(t.longitude), 0) / townsWithCoords.length;

                          // Create markers data
                          const markersData = townsWithCoords.map(town => ({
                            lat: parseFloat(town.latitude),
                            lng: parseFloat(town.longitude),
                            name: town.name
                          }));

                          // Open a new window with Leaflet.js + OpenStreetMap (100% FREE)
                          const mapWindow = window.open('', '_blank');
                          mapWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <title>Towns in ${todaysInspiration.region}</title>
                              <meta charset="utf-8" />
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                              <style>
                                body, html { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
                                #map { height: 100%; width: 100%; }
                              </style>
                            </head>
                            <body>
                              <div id="map"></div>
                              <script>
                                // Initialize map without setting view yet
                                const map = L.map('map');

                                // Add OpenStreetMap tiles (FREE, no API key needed)
                                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                  maxZoom: 19
                                }).addTo(map);

                                // Add markers for each town
                                const markers = ${JSON.stringify(markersData)};
                                const markerObjects = [];

                                markers.forEach(markerData => {
                                  const marker = L.marker([markerData.lat, markerData.lng])
                                    .addTo(map)
                                    .bindPopup('<div style="padding: 8px; font-size: 14px;"><strong>' + markerData.name + '</strong></div>');
                                  markerObjects.push(marker);
                                });

                                // Fit map to show all markers automatically (works for any country size)
                                if (markerObjects.length > 0) {
                                  const group = new L.featureGroup(markerObjects);

                                  // Fit bounds with padding and max zoom constraint
                                  // maxZoom prevents extreme close-up when only 1-2 markers
                                  map.fitBounds(group.getBounds().pad(0.5), {
                                    maxZoom: 7,  // Country/regional level view - prevents zooming too close
                                    padding: [50, 50]  // Additional pixel padding
                                  });
                                } else {
                                  // Fallback center if no markers
                                  map.setView([${avgLat}, ${avgLng}], 7);
                                }
                              </script>
                            </body>
                            </html>
                          `);
                        }}
                        className={`${uiConfig.colors.success} text-sm hover:underline cursor-pointer`}
                      >
                        View on Map
                      </button>
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
                            <OptimizedImage
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
                        <OptimizedImage
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
      </UnifiedErrorBoundary>
    </div>
  );
}