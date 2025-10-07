// Option 3: Icon-based Compact Design
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Globe, DollarSign, Crosshair, SortDesc, Search, MessageCircle, Users, MapPin } from 'lucide-react';
import { createPortal } from 'react-dom';
import { uiConfig } from '../styles/uiConfig';

export default function FilterBarV3({
  sortBy,
  setSortBy,
  filterRegion,
  setFilterRegion,
  filterCountry,
  setFilterCountry,
  filterCostRange,
  setFilterCostRange,
  filterMatchRange,
  setFilterMatchRange,
  regions,
  countries,
  filterCount,
  clearFilters,
  resultsCount,
  variant = 'default', // 'default', 'integrated', 'chat'
  searchTerm,
  setSearchTerm,
  availableTowns = [],
  setSelectedTown,

  // Chat-specific props
  chatSearchTerm,
  setChatSearchTerm,
  filterChatType,
  setFilterChatType,
  messages = [],
  threads = [],
  activeTownChats = [],
  friends = [],
  unreadByType = {},
  availableCountries = []
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm || '');
  const [isTyping, setIsTyping] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Refs for each button to calculate positions
  const sortButtonRef = useRef(null);
  const locationButtonRef = useRef(null);
  const costButtonRef = useRef(null);
  const matchButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  const toggleDropdown = (dropdown) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
      return;
    }
    
    // Calculate position based on button ref
    let buttonRef;
    switch (dropdown) {
      case 'sort': buttonRef = sortButtonRef; break;
      case 'location': buttonRef = locationButtonRef; break;
      case 'cost': buttonRef = costButtonRef; break;
      case 'match': buttonRef = matchButtonRef; break;
      default: return;
    }
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.left + window.scrollX
      });
    }
    
    setOpenDropdown(dropdown);
  };

  // Helper to determine if a filter is active
  const isFilterActive = (filterValue) => filterValue !== 'all';

  // Count active filters for each category
  const activeFilters = {
    location: (filterRegion !== 'all' ? 1 : 0) + (filterCountry !== 'all' ? 1 : 0),
    cost: filterCostRange !== 'all' ? 1 : 0,
    match: filterMatchRange !== 'all' ? 1 : 0
  };

  // Filter available towns based on search input
  const getFilteredTowns = () => {
    if (!searchInput.trim()) return [];
    const search = searchInput.toLowerCase();
    
    // Filter and sort results
    const filtered = availableTowns.filter(town => 
      town.name.toLowerCase().includes(search) ||
      town.region?.toLowerCase().includes(search) ||
      town.country?.toLowerCase().includes(search)
    );
    
    // Sort to prioritize exact matches and country matches
    filtered.sort((a, b) => {
      // Exact town name match comes first
      const aNameMatch = a.name.toLowerCase() === search;
      const bNameMatch = b.name.toLowerCase() === search;
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Then prioritize country matches
      const aCountryMatch = a.country?.toLowerCase().includes(search);
      const bCountryMatch = b.country?.toLowerCase().includes(search);
      if (aCountryMatch && !bCountryMatch) return -1;
      if (!aCountryMatch && bCountryMatch) return 1;
      
      // Then town name starts with search
      const aStartsWith = a.name.toLowerCase().startsWith(search);
      const bStartsWith = b.name.toLowerCase().startsWith(search);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    });
    
    return filtered.slice(0, 8); // Limit to 8 results for dropdown
  };

  const handleSearchSelect = (town) => {
    // Clear search immediately when user selects
    setSearchInput('');
    setShowSearchDropdown(false);
    
    // Clear the search term so filtering doesn't apply
    if (setSearchTerm) {
      setSearchTerm('');
    }
    
    // Navigate to the town
    if (setSelectedTown) {
      setSelectedTown(town.id);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    
    // JUST SET THE DAMN VALUE - NO FIGHTING!
    setSearchInput(value);
    
    // Update search term for filtering
    if (setSearchTerm) {
      setSearchTerm(value);
    }
    
    // Show dropdown only if user has typed at least 2 characters
    // This makes it less intrusive and gives user more control
    if (value.length >= 2) {
      const search = value.toLowerCase();
      const filtered = availableTowns.filter(town => 
        town.name.toLowerCase().includes(search) ||
        town.region?.toLowerCase().includes(search) ||
        town.country?.toLowerCase().includes(search)
      );
      
      // Show dropdown if there are matches
      setShowSearchDropdown(filtered.length > 0);
      
      // Hide selected town if searching for a country
      const countries = [...new Set(availableTowns.map(t => t.country?.toLowerCase()))];
      const isCountrySearch = countries.some(c => c && c.startsWith(search));
      if (isCountrySearch && setSelectedTown) {
        setSelectedTown(null);
      }
    } else {
      setShowSearchDropdown(false);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up any pending timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Only sync on initial mount, not on every searchTerm change
  useEffect(() => {
    if (searchTerm && !searchInput) {
      setSearchInput(searchTerm);
    }
  }, []); // Empty deps - only on mount

  // Portal dropdown component
  const PortalDropdown = ({ children, width = 'w-48' }) => {
    if (!openDropdown) return null;
    
    return createPortal(
      <div 
        className={`fixed ${width} ${uiConfig.colors.card} rounded-lg shadow-md z-[9999]`}
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  // Chat search results
  const getChatSearchResults = () => {
    if (!chatSearchTerm || chatSearchTerm.length < 2) return [];

    const search = chatSearchTerm.toLowerCase();
    const results = [];

    // Search through messages
    messages.forEach(msg => {
      if (msg.message?.toLowerCase().includes(search)) {
        results.push({
          type: 'message',
          text: msg.message,
          user: msg.user_name,
          date: msg.created_at,
          id: msg.id
        });
      }
    });

    // Search through town names and countries
    activeTownChats.forEach(tc => {
      if (tc.towns.name.toLowerCase().includes(search) ||
          tc.towns.country.toLowerCase().includes(search)) {
        results.push({
          type: 'town',
          name: tc.towns.name,
          country: tc.towns.country,
          id: tc.town_id
        });
      }
    });

    // Search through friend names
    friends.forEach(friend => {
      if (friend.friend?.username?.toLowerCase().includes(search)) {
        results.push({
          type: 'friend',
          name: friend.friend.username,
          id: friend.friend_id
        });
      }
    });

    // Search through thread topics
    threads.forEach(thread => {
      if (thread.topic?.toLowerCase().includes(search)) {
        results.push({
          type: 'topic',
          topic: thread.topic,
          id: thread.id
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  };

  // Main render for both variants
  return (
    <>
      {/* Chat variant - search + filter buttons */}
      {variant === 'chat' ? (
        <div className="flex items-center gap-2 w-full overflow-x-auto">
          {/* Chat Search Input */}
          <div className="relative flex-shrink-0 min-w-[200px] max-w-[300px]" ref={searchInputRef}>
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.subtitle}`} />
              <input
                type="text"
                value={chatSearchTerm || ''}
                onChange={(e) => {
                  setChatSearchTerm(e.target.value);
                  setShowSearchDropdown(e.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (chatSearchTerm && chatSearchTerm.length >= 2) {
                    setShowSearchDropdown(true);
                  }
                }}
                placeholder="Search messages, towns, friends..."
                className={`w-full h-9 pl-9 pr-8 text-sm ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all`}
              />
              {chatSearchTerm && (
                <button
                  onClick={() => {
                    setChatSearchTerm('');
                    setShowSearchDropdown(false);
                  }}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.subtitle} hover:${uiConfig.colors.body} p-0.5`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Chat Search Dropdown */}
            {showSearchDropdown && chatSearchTerm && chatSearchTerm.length >= 2 && (() => {
              const results = getChatSearchResults();

              if (results.length === 0) {
                return (
                  <div className={`absolute z-[9999] w-full mt-2 ${uiConfig.colors.card} rounded-lg shadow-md p-4`}>
                    <p className={`text-sm ${uiConfig.colors.hint} text-center`}>No results found</p>
                  </div>
                );
              }

              return (
                <div className={`absolute z-[9999] w-full mt-2 ${uiConfig.colors.card} rounded-lg shadow-md max-h-80 overflow-auto`}
                     style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  {results.map((result, idx) => (
                    <button
                      key={`${result.type}-${result.id || idx}`}
                      onClick={() => {
                        // Handle navigation based on result type
                        setChatSearchTerm('');
                        setShowSearchDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:${uiConfig.colors.secondary} transition-colors border-b ${uiConfig.colors.borderLight} last:border-b-0 last:rounded-b-lg`}
                    >
                      {result.type === 'message' && (
                        <div>
                          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>
                            💬 Message from {result.user}
                          </div>
                          <div className={`text-sm ${uiConfig.colors.body} line-clamp-2`}>
                            {result.text}
                          </div>
                        </div>
                      )}
                      {result.type === 'town' && (
                        <div>
                          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>
                            🏙️ Town Chat
                          </div>
                          <div className={`text-sm font-medium ${uiConfig.colors.heading}`}>
                            {result.name}, {result.country}
                          </div>
                        </div>
                      )}
                      {result.type === 'friend' && (
                        <div>
                          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>
                            👤 Friend
                          </div>
                          <div className={`text-sm font-medium ${uiConfig.colors.heading}`}>
                            {result.name}
                          </div>
                        </div>
                      )}
                      {result.type === 'topic' && (
                        <div>
                          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>
                            💭 Topic
                          </div>
                          <div className={`text-sm font-medium ${uiConfig.colors.heading}`}>
                            {result.topic}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Filter Buttons - Scrollable with bubble counts */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Towns Button with bubble count */}
            <button
              onClick={() => {
                if (setFilterChatType) {
                  setFilterChatType(prev => prev === 'towns' ? 'all' : 'towns');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap relative ${
                filterChatType === 'towns'
                  ? `border-2 border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-300 font-medium`
                  : `border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 ${uiConfig.colors.body} hover:border-scout-accent-300`
              }`}
            >
              <MapPin size={14} />
              <span>Towns</span>
              {unreadByType.towns > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full">
                  {unreadByType.towns > 99 ? '99+' : unreadByType.towns}
                </div>
              )}
            </button>

            {/* Countries Button - dropdown for filtering by country */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
                  filterCountry !== 'all'
                    ? `border-2 border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-300 font-medium`
                    : `border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 ${uiConfig.colors.body} hover:border-scout-accent-300`
                }`}
              >
                <Globe size={14} />
                <span>{filterCountry !== 'all' ? filterCountry : 'Countries'}</span>
                <ChevronDown size={12} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Country Dropdown */}
              {showCountryDropdown && availableCountries && availableCountries.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCountryDropdown(false)}
                  />
                  <div className={`absolute z-[9999] mt-2 w-56 ${uiConfig.colors.card} rounded-lg shadow-md max-h-60 overflow-auto`}
                       style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <button
                      onClick={() => {
                        if (setFilterCountry) setFilterCountry('all');
                        setShowCountryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:${uiConfig.colors.secondary} ${
                        filterCountry === 'all' ? `${uiConfig.colors.secondary} font-medium` : ''
                      }`}
                    >
                      All Countries
                    </button>
                    {availableCountries.map(country => (
                      <button
                        key={country}
                        onClick={() => {
                          if (setFilterCountry) setFilterCountry(country);
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:${uiConfig.colors.secondary} ${
                          filterCountry === country ? `${uiConfig.colors.secondary} font-medium` : ''
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Friends Button with bubble count */}
            <button
              onClick={() => {
                if (setFilterChatType) {
                  setFilterChatType(prev => prev === 'friends' ? 'all' : 'friends');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap relative ${
                filterChatType === 'friends'
                  ? `border-2 border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-300 font-medium`
                  : `border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 ${uiConfig.colors.body} hover:border-scout-accent-300`
              }`}
            >
              <Users size={14} />
              <span>Friends</span>
              {unreadByType.friends > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full">
                  {unreadByType.friends > 99 ? '99+' : unreadByType.friends}
                </div>
              )}
            </button>

            {/* Overflow indicator - show when scrollable */}
            <div className={`text-xs ${uiConfig.colors.hint} px-2`}>...</div>
          </div>
        </div>
      ) : (
      <div className={`flex ${variant === 'mobile' ? 'flex-col gap-3' : 'items-center gap-2'} w-full`}>
        {/* Search Input - Clean Zillow style */}
        <div className={`relative ${variant === 'mobile' ? 'w-full' : variant === 'compact' ? 'flex-shrink min-w-[180px] max-w-[240px]' : 'flex-shrink-0 w-64'}`} ref={searchInputRef}>
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.subtitle}`} />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              onFocus={() => {
                // Clear if it's a previously selected town (contains comma)
                if (searchInput.includes(',')) {
                  setSearchInput('');
                  if (setSearchTerm) {
                    setSearchTerm('');
                  }
                }
                // Only show dropdown if user has typed at least 2 characters
                // This prevents dropdown from appearing immediately on focus
                else if (searchInput.length >= 2) {
                  setShowSearchDropdown(true);
                }
              }}
              placeholder="Search..."
              className={`w-full h-9 pl-9 pr-8 text-sm ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:${uiConfig.colors.card} focus:border-${uiConfig.colors.accentBorder} transition-all`}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  if (setSearchTerm) {
                    setSearchTerm('');
                  }
                  setShowSearchDropdown(false);
                }}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.subtitle} hover:${uiConfig.colors.body} p-0.5`}
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Search Dropdown - Countries first, then Towns */}
          {showSearchDropdown && searchInput.length >= 2 && (() => {
            const search = searchInput.toLowerCase();
            const filteredTowns = getFilteredTowns();
            
            // Get unique countries that match the search
            const allCountries = [...new Set(availableTowns.map(t => t.country))].filter(Boolean).sort();
            
            // Smart matching: Start of word gets priority, then contains
            const matchingCountries = allCountries.filter(country => {
              const countryLower = country.toLowerCase();
              // Match from start of country name OR start of any word in the country name
              const words = countryLower.split(' ');
              return countryLower.startsWith(search) || 
                     words.some(word => word.startsWith(search)) ||
                     countryLower.includes(search);
            }).sort((a, b) => {
              // Prioritize exact starts, then word starts, then contains
              const aLower = a.toLowerCase();
              const bLower = b.toLowerCase();
              const aStartsWith = aLower.startsWith(search);
              const bStartsWith = bLower.startsWith(search);
              
              if (aStartsWith && !bStartsWith) return -1;
              if (!aStartsWith && bStartsWith) return 1;
              
              return a.localeCompare(b);
            });
            
            // Only show if we have either matching countries or towns
            if (matchingCountries.length === 0 && filteredTowns.length === 0) {
              return null;
            }
            
            return (
              <div className={`absolute z-[9999] w-full mt-2 ${uiConfig.colors.card} rounded-lg shadow-md max-h-60 overflow-auto`}
                   style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                
                {/* Countries Section */}
                {matchingCountries.length > 0 && (
                  <>
                    <div className={`px-4 py-2 ${uiConfig.colors.secondary} border-b ${uiConfig.colors.border}`}>
                      <div className={`text-xs font-semibold ${uiConfig.colors.subtitle} uppercase tracking-wide`}>
                        Countries
                      </div>
                    </div>
                    {matchingCountries.slice(0, 3).map((country) => ( // Show max 3 countries to keep it clean
                      <button
                        key={`country-${country}`}
                        onClick={() => {
                          // Set search to country name to filter by it
                          setSearchInput(country);
                          if (setSearchTerm) {
                            setSearchTerm(country);
                          }
                          setShowSearchDropdown(false);
                          // Clear selected town when selecting a country
                          if (setSelectedTown) {
                            setSelectedTown(null);
                          }
                        }}
                        className={`w-full text-left px-4 py-3 hover:${uiConfig.colors.secondary} transition-colors`}
                      >
                        <div className={`font-medium ${uiConfig.colors.heading} flex items-center gap-2`}>
                          <span className="text-xs opacity-50">🌍</span>
                          {country}
                        </div>
                        <div className={`text-xs ${uiConfig.colors.subtitle}`}>
                          {availableTowns.filter(t => t.country === country).length} towns
                        </div>
                      </button>
                    ))}
                  </>
                )}
                
                {/* Towns Section */}
                {filteredTowns.length > 0 && (
                  <>
                    {matchingCountries.length > 0 && (
                      <div className={`px-4 py-2 ${uiConfig.colors.secondary} border-b ${uiConfig.colors.border}`}>
                        <div className={`text-xs font-semibold ${uiConfig.colors.subtitle} uppercase tracking-wide`}>
                          Towns
                        </div>
                      </div>
                    )}
                    {filteredTowns.slice(0, 8).map((town) => ( // Limit to 8 towns for cleaner UI
                      <button
                        key={town.id}
                        onClick={() => handleSearchSelect(town)}
                        className={`w-full text-left px-4 py-3 hover:${uiConfig.colors.secondary} transition-colors last:rounded-b-lg`}
                      >
                        <div className={`font-medium ${uiConfig.colors.heading} flex items-center gap-2`}>
                          <span className="text-xs opacity-50">📍</span>
                          {town.name}
                        </div>
                        <div className={`text-xs ${uiConfig.colors.subtitle} ml-6`}>
                          {town.region && `${town.region}, `}{town.country}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* No divider for cleaner look */}

        {/* Mobile Filter Layout */}
        {variant === 'mobile' && (
          <div className="flex flex-col gap-4 w-full">
            {/* Sort */}
            <div>
              <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-sm`}
              >
                <option value="match">Best Match</option>
                <option value="name">Name (A-Z)</option>
                <option value="cost-low">Cost (Low to High)</option>
                <option value="cost-high">Cost (High to Low)</option>
                <option value="region">Region Score</option>
                <option value="climate">Climate Score</option>
                <option value="culture">Culture Score</option>
                <option value="hobbies">Hobbies Score</option>
                <option value="administration">Admin Score</option>
                <option value="budget">Budget Score</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-sm mb-3`}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>
                Country {filterRegion !== 'all' && `(${filterRegion})`}
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-sm`}
                disabled={countries.length === 0}
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Cost Range */}
            <div>
              <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>Cost Range</label>
              <select
                value={filterCostRange}
                onChange={(e) => setFilterCostRange(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-sm`}
              >
                <option value="all">Any Cost</option>
                <option value="under2000">Under $2,000</option>
                <option value="2000-3000">$2,000 - $3,000</option>
                <option value="3000-4000">$3,000 - $4,000</option>
                <option value="over4000">Over $4,000</option>
              </select>
            </div>

            {/* Match Score */}
            <div>
              <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-2`}>Match Score</label>
              <select
                value={filterMatchRange}
                onChange={(e) => setFilterMatchRange(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} text-sm`}
              >
                <option value="all">Any Match Score</option>
                <option value="excellent">Excellent (80%+)</option>
                <option value="good">Good (60-79%)</option>
                <option value="fair">Fair (40-59%)</option>
                <option value="low">Low (&lt;40%)</option>
              </select>
            </div>

            {/* Clear filters */}
            {(filterCount > 0 || searchInput.trim()) && (
              <button
                onClick={() => {
                  clearFilters();
                  setSearchInput('');
                  if (setSearchTerm) {
                    setSearchTerm('');
                  }
                }}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm ${uiConfig.colors.danger} border ${uiConfig.colors.dangerBorder} rounded-lg hover:${uiConfig.colors.dangerSecondary} transition-colors`}
              >
                <X size={16} />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        )}

        {/* Desktop Filter buttons - Pill style */}
        {variant !== 'mobile' ? (
        <div className={`flex items-center gap-1.5 ${variant === 'compact' ? 'flex-shrink-0' : 'flex-wrap'}`}>
          {/* Sort Button */}
          <button
            ref={sortButtonRef}
            onClick={() => toggleDropdown('sort')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border ${uiConfig.colors.border} hover:${uiConfig.colors.accentBorder} ${uiConfig.colors.body} hover:${uiConfig.colors.heading} transition-colors whitespace-nowrap`}
          >
            <SortDesc size={14} />
            <span>Sort</span>
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Location Filter */}
          <button
            ref={locationButtonRef}
            onClick={() => toggleDropdown('location')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              activeFilters.location > 0
                ? `${uiConfig.colors.secondary} ${uiConfig.colors.heading} font-medium ${uiConfig.colors.accentBorder}`
                : `${uiConfig.colors.body} hover:${uiConfig.colors.heading} ${uiConfig.colors.border} hover:${uiConfig.colors.accentBorder}`
            }`}
          >
            <Globe size={14} />
            <span>Location</span>
            {activeFilters.location > 0 && (
              <span className="ml-0.5 text-xs font-medium">({activeFilters.location})</span>
            )}
          </button>
          
          {/* Cost Filter */}
          <button
            ref={costButtonRef}
            onClick={() => toggleDropdown('cost')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              isFilterActive(filterCostRange)
                ? `${uiConfig.colors.secondary} ${uiConfig.colors.heading} font-medium ${uiConfig.colors.accentBorder}`
                : `${uiConfig.colors.body} hover:${uiConfig.colors.heading} ${uiConfig.colors.border} hover:${uiConfig.colors.accentBorder}`
            }`}
          >
            <DollarSign size={14} />
            <span>Costs</span>
          </button>
          
          {/* Match Filter */}
          <button
            ref={matchButtonRef}
            onClick={() => toggleDropdown('match')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              isFilterActive(filterMatchRange)
                ? `${uiConfig.colors.secondary} ${uiConfig.colors.heading} font-medium ${uiConfig.colors.accentBorder}`
                : `${uiConfig.colors.body} hover:${uiConfig.colors.heading} ${uiConfig.colors.border} hover:${uiConfig.colors.accentBorder}`
            }`}
          >
            <Crosshair size={14} />
            <span>Match</span>
          </button>

          {/* Clear filters button - only show if there are active filters */}
          {(filterCount > 0 || searchInput.trim()) && (
            <button
              onClick={() => {
                clearFilters();
                setSearchInput('');
                if (setSearchTerm) {
                  setSearchTerm('');
                }
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${uiConfig.colors.body} hover:${uiConfig.colors.danger} transition-colors whitespace-nowrap`}
            >
              <X size={14} />
              <span>Clear all</span>
            </button>
          )}
        </div>
        ) : null}
      </div>
      )}

      {/* Click outside to close chat search dropdown */}
      {variant === 'chat' && showSearchDropdown && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={() => setShowSearchDropdown(false)}
        />
      )}

      {/* Portal Dropdowns - only for non-chat variants */}
      {variant !== 'chat' && (
      <>
      {openDropdown === 'sort' && (
        <PortalDropdown>
          {['match', 'name', 'cost-low', 'cost-high', 'region', 'climate', 'culture', 'hobbies', 'administration', 'budget'].map(option => (
            <button
              key={option}
              onClick={() => {
                setSortBy(option);
                setOpenDropdown(null);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:${uiConfig.colors.secondary} ${
                sortBy === option 
                  ? `${uiConfig.colors.accentSecondary} ${uiConfig.colors.accent}` 
                  : uiConfig.colors.body
              }`}
            >
              {option === 'match' ? 'Best Match' : 
               option === 'name' ? 'Name (A-Z)' :
               option === 'cost-low' ? 'Cost (Low to High)' :
               option === 'cost-high' ? 'Cost (High to Low)' :
               option === 'region' ? 'Region Score' :
               option === 'climate' ? 'Climate Score' :
               option === 'culture' ? 'Culture Score' :
               option === 'hobbies' ? 'Hobbies Score' :
               option === 'administration' ? 'Admin Score' :
               'Budget Score'}
            </button>
          ))}
        </PortalDropdown>
      )}

      {openDropdown === 'location' && (
        <PortalDropdown width="w-72">
          <div className="p-4">
            {/* Region Selection */}
            <div className="mb-4">
              <label className={`block text-xs font-medium ${uiConfig.colors.body} mb-2`}>Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-md ${uiConfig.colors.input} text-sm`}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Country Selection */}
            <div>
              <label className={`block text-xs font-medium ${uiConfig.colors.body} mb-2`}>
                Country {filterRegion !== 'all' && `(${filterRegion})`}
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className={`w-full px-3 py-2 border ${uiConfig.colors.border} rounded-md ${uiConfig.colors.input} text-sm`}
                disabled={countries.length === 0}
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Apply button */}
            <button
              onClick={() => setOpenDropdown(null)}
              className={`w-full mt-3 px-3 py-2 ${uiConfig.colors.btnPrimary} rounded-md text-sm font-medium hover:${uiConfig.colors.btnPrimaryHover}`}
            >
              Apply Filters
            </button>
          </div>
        </PortalDropdown>
      )}

      {openDropdown === 'cost' && (
        <PortalDropdown>
          <button
            onClick={() => {
              setFilterCostRange('all');
              setOpenDropdown(null);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:${uiConfig.colors.secondary} ${
              filterCostRange === 'all' ? uiConfig.colors.secondary : ''
            }`}
          >
            Any Cost
          </button>
          {[
            { value: 'under2000', label: 'Under $2,000' },
            { value: '2000-3000', label: '$2,000 - $3,000' },
            { value: '3000-4000', label: '$3,000 - $4,000' },
            { value: 'over4000', label: 'Over $4,000' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => {
                setFilterCostRange(option.value);
                setOpenDropdown(null);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:${uiConfig.colors.secondary} ${
                filterCostRange === option.value ? uiConfig.colors.secondary : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </PortalDropdown>
      )}

      {openDropdown === 'match' && (
        <PortalDropdown>
          <button
            onClick={() => {
              setFilterMatchRange('all');
              setOpenDropdown(null);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:${uiConfig.colors.secondary} ${
              filterMatchRange === 'all' ? uiConfig.colors.secondary : ''
            }`}
          >
            Any Match Score
          </button>
          {[
            { value: 'excellent', label: 'Excellent (80%+)' },
            { value: 'good', label: 'Good (60-79%)' },
            { value: 'fair', label: 'Fair (40-59%)' },
            { value: 'low', label: 'Low (<40%)' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => {
                setFilterMatchRange(option.value);
                setOpenDropdown(null);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:${uiConfig.colors.secondary} ${
                filterMatchRange === option.value ? uiConfig.colors.secondary : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </PortalDropdown>
      )}
      
      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={() => setOpenDropdown(null)}
        />
      )}
      </>
      )}
    </>
  );
}