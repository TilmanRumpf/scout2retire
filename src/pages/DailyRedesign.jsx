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
import LikeButton from '../components/LikeButton';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import { MapPin, Calendar, Heart, Compass, Book, Clock, TrendingUp, Sparkles } from 'lucide-react';

export default function DailyRedesign() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user: currentUser, profile } = await getCurrentUser();
        if (currentUser && profile) {
          setUser(profile);
          setUserId(currentUser.id);
          
          const { success, favorites: userFavorites } = await fetchFavorites(currentUser.id);
          if (success) {
            setFavorites(userFavorites.slice(0, 4)); // Only show 4 favorites
          }
          
          const hasSeenDaily = localStorage.getItem(`scout2retire_seen_daily_${currentUser.id}`);
          if (!hasSeenDaily) {
            setIsFirstVisit(true);
            localStorage.setItem(`scout2retire_seen_daily_${currentUser.id}`, 'true');
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Calculate retirement stats
  const getRetirementStats = () => {
    if (!user || !user.retirement_year_estimate) {
      return { years: 5, months: 0, days: 0, percentage: 0 };
    }
    
    const now = new Date();
    const retirementDate = new Date(user.retirement_year_estimate, 0, 1);
    const timeDiff = retirementDate.getTime() - now.getTime();
    
    const years = Math.floor(timeDiff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((timeDiff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    const days = Math.floor((timeDiff % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    
    // Calculate percentage (assume 40 year career)
    const startDate = new Date(retirementDate);
    startDate.setFullYear(startDate.getFullYear() - 40);
    const totalTime = retirementDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    const percentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    
    return { years, months, days, percentage };
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

  const stats = getRetirementStats();

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading your daily inspiration...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-scout-accent-50 via-white to-green-50 dark:from-scout-accent-900/20 dark:via-gray-900 dark:to-green-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${uiConfig.colors.heading} mb-2`}>
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Explorer'}!
              </h1>
              <p className={`text-lg ${uiConfig.colors.body}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Link to="/profile" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className={`${uiConfig.icons.size.lg} ${uiConfig.colors.body}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>

          {/* Retirement Progress Card */}
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} p-6 mb-8`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} flex items-center gap-2`}>
                  <Clock className="w-5 h-5" />
                  Your Retirement Journey
                </h2>
                <p className={`${uiConfig.colors.body} mt-1`}>
                  {stats.years > 0 ? `${stats.years} years, ${stats.months} months to go` : `${stats.months} months, ${stats.days} days to go`}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${uiConfig.colors.accent}`}>
                  {Math.round(stats.percentage)}%
                </div>
                <p className={`text-sm ${uiConfig.colors.body}`}>Complete</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-scout-accent-500 to-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Link to="/favorites" className={`text-center p-3 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
                <p className={`text-2xl font-bold ${uiConfig.colors.heading}`}>{favorites.length}</p>
                <p className={`text-xs ${uiConfig.colors.body}`}>Favorites</p>
              </Link>
              <Link to="/discover" className={`text-center p-3 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Compass className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <p className={`text-2xl font-bold ${uiConfig.colors.heading}`}>200+</p>
                <p className={`text-xs ${uiConfig.colors.body}`}>Towns</p>
              </Link>
              <Link to="/journal" className={`text-center p-3 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Book className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <p className={`text-2xl font-bold ${uiConfig.colors.heading}`}>Daily</p>
                <p className={`text-xs ${uiConfig.colors.body}`}>Journal</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PageErrorBoundary
        fallbackTitle="Dashboard Error"
        fallbackMessage="We're having trouble loading your dashboard. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        <main className="max-w-7xl mx-auto px-4 -mt-6">
          {/* Today's Featured Town - Full Width Card */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-5 h-5 ${uiConfig.colors.accent}`} />
              <h2 className={`text-2xl font-bold ${uiConfig.colors.heading}`}>Today's Discovery</h2>
            </div>
            <DailyTownCard />
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Quick Journal */}
            <div>
              <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4 flex items-center gap-2`}>
                <Book className="w-5 h-5" />
                Quick Reflection
              </h3>
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
                <p className={`${uiConfig.colors.body} mb-3`}>
                  What's on your mind about retirement today?
                </p>
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Today I'm thinking about..."
                  className={`w-full px-4 py-3 ${uiConfig.colors.input} ${uiConfig.colors.border} ${uiConfig.layout.radius.md} resize-none h-32`}
                  maxLength={MAX_LENGTHS.JOURNAL_ENTRY}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-sm ${uiConfig.colors.hint}`}>
                    {journalEntry.length}/{MAX_LENGTHS.JOURNAL_ENTRY} characters
                  </span>
                  <button
                    onClick={handleSaveJournal}
                    disabled={savingJournal || !journalEntry.trim()}
                    className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${uiConfig.font.weight.medium} disabled:opacity-50`}
                  >
                    {savingJournal ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Favorites */}
            <div>
              <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4 flex items-center gap-2`}>
                <Heart className="w-5 h-5" />
                Recent Favorites
              </h3>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {favorites.map((favorite) => {
                    const town = favorite.towns;
                    return (
                      <Link
                        key={favorite.town_id}
                        to={`/discover?town=${town.id}`}
                        className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} overflow-hidden hover:shadow-md transition-shadow`}
                      >
                        <div className="relative h-24">
                          <SimpleImage
                            src={town.image_url_1}
                            alt={town.name}
                            className="w-full h-full object-cover"
                            fallbackIcon={MapPin}
                            fallbackIconSize={32}
                          />
                          {town.matchScore && (
                            <div className="absolute top-2 left-2">
                              <div className={`px-2 py-0.5 ${uiConfig.layout.radius.full} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-xs font-medium ${
                                town.matchScore >= 80 ? 'text-scout-accent-700 dark:text-scout-accent-400' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {town.matchScore}%
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className={`font-medium ${uiConfig.colors.heading} text-sm`}>{town.name}</p>
                          <p className={`text-xs ${uiConfig.colors.body}`}>{town.country}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-6 text-center`}>
                  <Heart className={`w-12 h-12 ${uiConfig.colors.muted} mx-auto mb-3`} />
                  <p className={`${uiConfig.colors.body} mb-3`}>
                    No favorites yet. Start exploring!
                  </p>
                  <Link
                    to="/discover"
                    className={`inline-flex items-center px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${uiConfig.font.weight.medium}`}
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Explore Towns
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 mb-8`}>
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>Continue Your Journey</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/discover" className={`flex flex-col items-center p-4 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Compass className="w-8 h-8 mb-2 text-blue-500" />
                <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>Discover</span>
              </Link>
              <Link to="/compare" className={`flex flex-col items-center p-4 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <TrendingUp className="w-8 h-8 mb-2 text-green-500" />
                <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>Compare</span>
              </Link>
              <Link to="/journal" className={`flex flex-col items-center p-4 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Book className="w-8 h-8 mb-2 text-purple-500" />
                <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>Journal</span>
              </Link>
              <Link to="/chat" className={`flex flex-col items-center p-4 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <Sparkles className="w-8 h-8 mb-2 text-scout-accent-500" />
                <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>AI Chat</span>
              </Link>
            </div>
          </div>
        </main>
      </PageErrorBoundary>

      <QuickNav />
    </div>
  );
}