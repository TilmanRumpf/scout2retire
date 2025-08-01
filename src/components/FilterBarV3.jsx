// Option 3: Icon-based Compact Design
import { ChevronDown, X, Globe, DollarSign, Crosshair, SortDesc, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  availableTowns = []
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm || '');
  
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
        town.state_code?.toLowerCase().includes(search) ||
        town.country?.toLowerCase().includes(search)
      )
      .slice(0, 8); // Limit to 8 results for dropdown
  };

  const handleSearchSelect = (townName) => {
    setSearchInput(townName);
    if (setSearchTerm) {
      setSearchTerm(townName);
    }
    setShowSearchDropdown(false);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSearchDropdown(value.length > 0);
    
    // Update search term in real time for filtering
    if (setSearchTerm) {
      setSearchTerm(value);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input with searchTerm prop
  useEffect(() => {
    setSearchInput(searchTerm || '');
  }, [searchTerm]);

  // Portal dropdown component
  const PortalDropdown = ({ children, width = 'w-48' }) => {
    if (!openDropdown) return null;
    
    return createPortal(
      <div 
        className={`fixed ${width} bg-white dark:bg-gray-800 rounded-lg shadow-md z-[9999]`}
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
      <div className={`flex items-center gap-2 w-full ${variant === 'mobile' ? 'flex-wrap' : variant === 'compact' ? '' : ''}`}>
        {/* Search Input - Clean Zillow style */}
        <div className={`relative ${variant === 'mobile' ? 'w-full order-2' : variant === 'compact' ? 'flex-shrink min-w-[180px] max-w-[240px]' : 'flex-shrink-0 w-64'}`} ref={searchInputRef}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              onFocus={() => searchInput.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search cities..."
              className="w-full h-9 pl-9 pr-8 text-sm bg-gray-50 dark:bg-gray-900 rounded-full focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:shadow-sm transition-all"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Search Dropdown */}
          {showSearchDropdown && getFilteredTowns().length > 0 && (
            <div className="absolute z-[9999] w-full mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-md max-h-60 overflow-auto"
                 style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              {getFilteredTowns().map((town) => (
                <button
                  key={town.id}
                  onClick={() => handleSearchSelect(town.name)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{town.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {town.state_code && `${town.state_code}, `}{town.country}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* No divider for cleaner look */}

        {/* Filter buttons - Pill style */}
        <div className={`flex items-center gap-1.5 ${variant === 'mobile' ? 'w-full order-1' : variant === 'compact' ? 'flex-shrink-0' : 'flex-wrap'}`}>
          {/* Sort Button */}
          <button
            ref={sortButtonRef}
            onClick={() => toggleDropdown('sort')}
            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
          >
            <SortDesc size={14} />
            <span>Sort</span>
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Location Filter */}
          <button
            ref={locationButtonRef}
            onClick={() => toggleDropdown('location')}
            className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
              activeFilters.location > 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Globe size={14} />
            <span>Location</span>
            {activeFilters.location > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-full">{activeFilters.location}</span>
            )}
          </button>
          
          {/* Cost Filter */}
          <button
            ref={costButtonRef}
            onClick={() => toggleDropdown('cost')}
            className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
              isFilterActive(filterCostRange)
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <DollarSign size={14} />
            <span>Cost</span>
          </button>
          
          {/* Match Filter */}
          <button
            ref={matchButtonRef}
            onClick={() => toggleDropdown('match')}
            className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
              isFilterActive(filterMatchRange)
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
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
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
            >
              <X size={14} />
              <span>Clear all</span>
            </button>
          )}
        </div>
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
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                sortBy === option 
                  ? 'bg-scout-accent-50 dark:bg-scout-accent-400/20 text-scout-accent-600 dark:text-scout-accent-300' 
                  : 'text-gray-700 dark:text-gray-300'
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
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Country {filterRegion !== 'all' && `(${filterRegion})`}
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
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
              className="w-full mt-3 px-3 py-2 bg-scout-accent-500 text-white rounded-md text-sm font-medium hover:bg-scout-accent-600"
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
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
              filterCostRange === 'all' ? 'bg-gray-50 dark:bg-gray-700' : ''
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
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                filterCostRange === option.value ? 'bg-gray-50 dark:bg-gray-700' : ''
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
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
              filterMatchRange === 'all' ? 'bg-gray-50 dark:bg-gray-700' : ''
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
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                filterMatchRange === option.value ? 'bg-gray-50 dark:bg-gray-700' : ''
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