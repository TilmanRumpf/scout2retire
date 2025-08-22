// pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import CompactCountdown from '../components/CompactCountdown';
import DailyTownCard from '../components/DailyTownCard';
import TownCard from '../components/TownCard';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import { fetchFavorites } from '../utils/townUtils.jsx';
import { saveJournalEntry } from '../utils/journalUtils';
import { sanitizeJournalEntry, MAX_LENGTHS } from '../utils/sanitizeUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function Home() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

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
          }
          
          // Check if this is their first visit after onboarding
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
  }, []);

  // Calculate retirement date - default to January 1st of retirement year
  const getRetirementDate = () => {
    if (!user || !user.retirement_year_estimate) {
      // Default to 5 years from now if no estimate
      const date = new Date();
      date.setFullYear(date.getFullYear() + 5);
      date.setMonth(0); // January
      date.setDate(1);
      return date;
    }
    
    // Use full retirement date if available, otherwise January 1st of the retirement year
    const retirementDate = user.retirement_date 
      ? new Date(user.retirement_date)
      : new Date(user.retirement_year_estimate, 0, 1);
    return retirementDate;
  };

  // Handle favorite changes from TownCard
  const handleFavoriteChange = (townId, isFavorited) => {
    if (!isFavorited) {
      // Remove from favorites list when unfavorited
      setFavorites(prev => prev.filter(f => f.town_id !== townId));
    }
    // Note: Adding to favorites is handled by the TownCard component itself
    // If you need to add it to the list, you'd need to fetch the town data
  };

  // Handle journal save
  const handleJournalSave = async () => {
    if (!journalEntry.trim()) {
      toast.error('Please write something in your journal entry');
      return;
    }

    if (!userId) {
      toast.error('User not found. Please log in again.');
      return;
    }

    // Sanitize and validate the journal entry
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
        null // Could link to today's recommended town if needed
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

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader 
        title="Home Dashboard"
      />

      <UnifiedErrorBoundary variant="compact"
        fallbackTitle="Dashboard Error"
        fallbackMessage="We're having trouble loading your dashboard. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        {/* Spacer for fixed header */}
        <HeaderSpacer hasFilters={false} />
        
        {/* Main content */}
        <main className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page} space-y-6`}>
        {/* Welcome message */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>
            {isFirstVisit 
              ? `Congratulations on completing your journey, ${user?.full_name?.split(' ')[0] || 'Explorer'}!`
              : `Welcome back, ${user?.full_name?.split(' ')[0] || 'Explorer'}!`
            }
          </h2>
          {isFirstVisit ? (
            <div className={`p-4 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.lg} mb-4`}>
              <p className={`${uiConfig.colors.body} mb-3`}>
                You've successfully completed your retirement preferences. We've analyzed thousands of destinations 
                to find your perfect matches. This daily page will help you discover something new each day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/discover"
                  className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} text-sm font-medium`}
                >
                  View All Your Matches
                </Link>
                <Link
                  to="/onboarding/complete"
                  className={`px-4 py-2 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} text-sm font-medium`}
                >
                  See Your Top Matches Again
                </Link>
              </div>
            </div>
          ) : (
            <p className={`${uiConfig.colors.body}`}>
              Discover your daily retirement destination recommendation
            </p>
          )}
        </div>

        {/* Countdown and Daily Recommendation Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Retirement Countdown - Takes 1/3 width on desktop */}
          <div className="md:col-span-1">
            <CompactCountdown targetDate={getRetirementDate()} />
          </div>

          {/* Daily Town Card - Takes 2/3 width on desktop */}
          <div className="md:col-span-2">
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3`}>
              Today's Recommendation
            </h3>
            <DailyTownCard />
          </div>
        </div>

        {/* Your Favorites */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
              Your Favorites
            </h3>
            <Link
              to="/favorites"
              className={`text-sm ${uiConfig.colors.accent} hover:underline`}
            >
              View All
            </Link>
          </div>
          {favorites.length === 0 ? (
            <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 text-center`}>
              <p className={`${uiConfig.colors.body} mb-4`}>
                You haven't saved any favorite towns yet.
              </p>
              <Link
                to="/discover"
                className={uiConfig.components.buttonPrimary}
              >
                Discover Towns
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.slice(0, 2).map((favorite) => (
                <TownCard
                  key={favorite.town_id}
                  town={favorite.towns}
                  userId={userId}
                  initiallyFavorited={true}
                  variant="compact"
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/discover"
              className={`flex flex-col items-center p-4 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.accentHover} transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${uiConfig.colors.accent} mb-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className={`text-sm ${uiConfig.colors.body}`}>Find Towns</span>
            </Link>
            
            <Link
              to="/compare"
              className={`flex flex-col items-center p-4 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.accentHover} transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${uiConfig.colors.accent} mb-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={`text-sm ${uiConfig.colors.body}`}>Compare</span>
            </Link>
            
            <Link
              to="/schedule"
              className={`flex flex-col items-center p-4 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.accentHover} transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${uiConfig.colors.accent} mb-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-sm ${uiConfig.colors.body}`}>Schedule</span>
            </Link>
            
            <Link
              to="/chat"
              className={`flex flex-col items-center p-4 ${uiConfig.colors.secondary} rounded-lg hover:${uiConfig.colors.accentHover} transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${uiConfig.colors.accent} mb-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className={`text-sm ${uiConfig.colors.body}`}>Chat</span>
            </Link>
          </div>
        </div>

        {/* Retirement Journal */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
            Retirement Journal
          </h3>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>
              Today's Reflection
            </label>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              maxLength={MAX_LENGTHS.JOURNAL_ENTRY}
              placeholder="What appeals to you about today's recommended town? How do you envision your life there?"
              className={`w-full p-3 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} ${uiConfig.colors.body} h-24 resize-none`}
            />
            {journalEntry.length > 0 && (
              <div className={`mt-1 text-xs ${uiConfig.colors.subtitle} text-right`}>
                {journalEntry.length} / {MAX_LENGTHS.JOURNAL_ENTRY}
              </div>
            )}
          </div>
          <button
            onClick={handleJournalSave}
            disabled={!journalEntry.trim() || savingJournal}
            className={`w-full ${uiConfig.components.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {savingJournal ? 'Saving...' : 'Save Journal Entry'}
          </button>
        </div>
        </main>
      </UnifiedErrorBoundary>

      {/* Bottom Navigation (Mobile) */}
    </div>
  );
}