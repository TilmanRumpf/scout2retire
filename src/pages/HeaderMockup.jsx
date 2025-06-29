import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterBarV3 from '../components/FilterBarV3';
import { uiConfig } from '../styles/uiConfig';
import { Menu, Filter, MapPin, DollarSign, Target, ChevronDown } from 'lucide-react';
import supabase from '../utils/supabaseClient';

export default function HeaderMockup() {
  const [activeDesign, setActiveDesign] = useState('current');
  const [actualTownCount, setActualTownCount] = useState(0);
  
  // Fetch actual town count from database - dynamic, not static
  useEffect(() => {
    const fetchTownCount = async () => {
      const { count, error } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setActualTownCount(count);
      }
    };
    
    // Fetch immediately
    fetchTownCount();
    
    // Optional: Set up real-time subscription for instant updates
    const subscription = supabase
      .channel('towns-count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'towns' }, 
        () => {
          fetchTownCount(); // Re-fetch count when towns table changes
        }
      )
      .subscribe();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Use actual count or show loading
  const totalCount = actualTownCount || '...';
  const filteredCount = actualTownCount ? Math.min(10, actualTownCount) : '...';
  
  // Filter states
  const [sortBy, setSortBy] = useState('match');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterMatchRange, setFilterMatchRange] = useState('all');
  
  const REGIONS = ['Europe', 'Asia', 'Americas'];
  const countries = ['Spain', 'Portugal', 'Thailand'];
  const filterCount = 0;
  const clearFilters = () => {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Design Selector */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold mb-3">Header Design Mockups</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveDesign('current')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDesign === 'current' 
                  ? 'bg-scout-accent-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Current Design
            </button>
            <button
              onClick={() => setActiveDesign('premium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDesign === 'premium' 
                  ? 'bg-scout-accent-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Premium Compact
            </button>
            <button
              onClick={() => setActiveDesign('ultra')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDesign === 'ultra' 
                  ? 'bg-scout-accent-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Ultra Minimal
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Frame */}
      <div className="p-8">
        <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-black h-6 rounded-t-3xl"></div>
          
          {/* Current Design */}
          {activeDesign === 'current' && (
            <>
              {/* Header - Current Style */}
              <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm} sticky top-0 z-10`}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <h1 className={`text-xl font-bold ${uiConfig.colors.heading}`}>
                      Discover: {totalCount} ({filteredCount})
                    </h1>
                    <button className="p-2">
                      <Menu className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </header>
              
              {/* Filter Bar - Separate */}
              <div className="px-4 py-6">
                <FilterBarV3
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterRegion={filterRegion}
                  setFilterRegion={setFilterRegion}
                  filterCountry={filterCountry}
                  setFilterCountry={setFilterCountry}
                  filterCostRange={filterCostRange}
                  setFilterCostRange={setFilterCostRange}
                  filterMatchRange={filterMatchRange}
                  setFilterMatchRange={setFilterMatchRange}
                  regions={REGIONS}
                  countries={countries}
                  filterCount={filterCount}
                  clearFilters={clearFilters}
                  resultsCount={filteredCount}
                />
              </div>
              
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-500">Total height: ~120px</div>
              </div>
            </>
          )}

          {/* Premium Compact Design */}
          {activeDesign === 'premium' && (
            <>
              <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
                {/* Title Row - 36px */}
                <div className="h-9 flex items-center justify-between px-4">
                  <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                    Discover
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {filteredCount} of {totalCount}
                    </span>
                  </h1>
                  <button className="p-1.5 -mr-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Integrated Filters - 32px - Full width on mobile, left aligned on larger screens */}
                <div className="h-8 flex items-center px-4">
                  <div className="flex items-center w-full sm:w-auto sm:gap-4">
                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Sort</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Location</span>
                    </button>
                    
                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Cost</span>
                    </button>
                    
                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <Target className="w-3.5 h-3.5" />
                      <span>Match</span>
                    </button>
                  </div>
                </div>
              </header>
              
              <div className="px-4 py-4">
                <div className="text-xs text-gray-500">Total height: 68px (ultra tight spacing)</div>
              </div>
            </>
          )}

          {/* Ultra Minimal Design */}
          {activeDesign === 'ultra' && (
            <>
              <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm">
                {/* Single Row - 44px */}
                <div className="h-11 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <h1 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      Discover
                    </h1>
                    
                    {/* Inline pill count */}
                    <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {filteredCount}/{totalCount}
                      </span>
                    </div>
                    
                    {/* Inline filter pills */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                      <button className="h-6 px-2.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Filter className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="h-6 px-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                      </button>
                      <button className="h-6 px-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <DollarSign className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                      </button>
                      <button className="h-6 px-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Target className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <button className="ml-2 p-2 -mr-2">
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </header>
              
              <div className="px-4 py-4">
                <div className="text-xs text-gray-500">Total height: 44px</div>
              </div>
            </>
          )}

          {/* Sample Content */}
          <div className="px-4 pb-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Town {i}</h3>
                    <span className="text-sm text-gray-500">86% match</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Beautiful coastal town with great weather year-round.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="max-w-sm mx-auto mt-8 space-y-4">
          {activeDesign === 'current' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Current Design Issues:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Takes up ~120px vertical space</li>
                <li>• Filter bar looks disconnected with border</li>
                <li>• "200 (10)" format less intuitive</li>
                <li>• Too much padding throughout</li>
              </ul>
            </div>
          )}
          
          {activeDesign === 'premium' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Premium Compact Benefits:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Saves 52px (43% reduction)</li>
                <li>• "10 of 200" clearer format</li>
                <li>• Responsive filters: full width mobile, left desktop</li>
                <li>• Minimal vertical spacing (36px + 32px)</li>
                <li>• Ultra compact: 68px total</li>
              </ul>
            </div>
          )}
          
          {activeDesign === 'ultra' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Ultra Minimal Notes:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Maximum space savings (63% reduction)</li>
                <li>• Single row design</li>
                <li>• Icon-only filters save space</li>
                <li>• May need tooltips for clarity</li>
                <li>• Best for power users</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}