// Option 3: Icon-based Compact Design
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Globe, DollarSign, Crosshair, SortDesc, Search } from 'lucide-react';
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
  variant = 'default', // 'default' or 'integrated'
  searchTerm,
  setSearchTerm,
  availableTowns = [],
  setSelectedTown
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm || '');
  const [isTyping, setIsTyping] = useState(false);
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
    return availableTowns
      .filter(town => 
        town.name.toLowerCase().includes(search) ||
        town.region?.toLowerCase().includes(search) ||
        town.country?.toLowerCase().includes(search)
      )
      .slice(0, 8); // Limit to 8 results for dropdown
  };

  const handleSearchSelect = (town) => {
    // Keep the selected town name visible for better UX
    setSearchInput(`${town.name}, ${town.country}`);
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
    
    // Allow deletion of completed selections
    setSearchInput(value);
    setIsTyping(true);
    
    // Update search term in real time for filtering
    if (setSearchTerm) {
      setSearchTerm(value);
    }
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Check for matches and show dropdown immediately
    if (value.length > 0 && !value.includes(',')) {
      const search = value.toLowerCase();
      const filtered = availableTowns.filter(town => 
        town.name.toLowerCase().startsWith(search) ||
        town.name.toLowerCase().includes(search)
      );
      
      if (filtered.length > 1) {
        // Multiple matches - show dropdown immediately
        setShowSearchDropdown(true);
      } else if (filtered.length === 0) {
        // No matches
        setShowSearchDropdown(false);
      } else if (filtered.length === 1) {
        // One match - show it in dropdown but wait LONGER to auto-complete
        setShowSearchDropdown(true);
        
        // Set timeout to auto-complete after user stops typing (increased delay)
        typingTimeoutRef.current = setTimeout(() => {
          // Double-check that we still have only one match
          const currentSearch = value.toLowerCase();
          const currentFiltered = availableTowns.filter(town => 
            town.name.toLowerCase().startsWith(currentSearch) ||
            town.name.toLowerCase().includes(currentSearch)
          );
          
          if (currentFiltered.length === 1) {
            const selectedTown = currentFiltered[0];
            const fullName = `${selectedTown.name}, ${selectedTown.country}`;
            
            // Auto-complete the input field with the full name
            setSearchInput(fullName);
            
            // Select the town
            if (setSelectedTown) {
              setSelectedTown(selectedTown.id);
            }
            
            // Clear search term so filtering shows all towns
            if (setSearchTerm) {
              setSearchTerm('');
            }
            
            // Hide dropdown since we've auto-completed
            setShowSearchDropdown(false);
          }
          setIsTyping(false);
        }, 800); // Increased to 800ms - more human-friendly delay
      }
    } else {
      setShowSearchDropdown(false);
      setIsTyping(false);
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

  // Main render for both variants
  return (
    <>
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
                } else if (searchInput.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              placeholder="Search cities..."
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
          
          {/* Search Dropdown */}
          {showSearchDropdown && getFilteredTowns().length > 0 && (
            <div className={`absolute z-[9999] w-full mt-2 ${uiConfig.colors.card} rounded-lg shadow-md max-h-60 overflow-auto`}
                 style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              {getFilteredTowns().map((town) => (
                <button
                  key={town.id}
                  onClick={() => handleSearchSelect(town)}
                  className={`w-full text-left px-4 py-3 hover:${uiConfig.colors.secondary} transition-colors first:rounded-t-lg last:rounded-b-lg`}
                >
                  <div className={`font-medium ${uiConfig.colors.heading}`}>{town.name}</div>
                  <div className={`text-xs ${uiConfig.colors.subtitle}`}>
                    {town.region && `${town.region}, `}{town.country}
                  </div>
                </button>
              ))}
            </div>
          )}
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
      
      {/* Portal Dropdowns */}
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
  );
}