// Option 3: Icon-based Compact Design
import { ChevronDown, X, Globe, DollarSign, Crosshair, SortDesc } from 'lucide-react';
import { useState } from 'react';
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
  variant = 'default' // 'default' or 'integrated'
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Helper to determine if a filter is active
  const isFilterActive = (filterValue) => filterValue !== 'all';

  // Count active filters for each category
  const activeFilters = {
    location: (filterRegion !== 'all' ? 1 : 0) + (filterCountry !== 'all' ? 1 : 0),
    cost: filterCostRange !== 'all' ? 1 : 0,
    match: filterMatchRange !== 'all' ? 1 : 0
  };

  // Integrated variant for CompactPageHeader
  if (variant === 'integrated') {
    return (
      <div className="flex items-center w-full sm:w-auto sm:gap-4">
        {/* Sort Button */}
        <button
          onClick={() => toggleDropdown('sort')}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors relative"
        >
          <SortDesc size={14} />
          <span>Sort</span>
          <ChevronDown size={12} className={`transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
          
          {openDropdown === 'sort' && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
            </div>
          )}
        </button>
        
        {/* Location Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('location')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm ${
              activeFilters.location > 0
                ? 'text-scout-accent-600 dark:text-scout-accent-400 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            } hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}
          >
            <Globe size={14} />
            <span>Location</span>
            {activeFilters.location > 0 && (
              <span className="text-xs">({activeFilters.location})</span>
            )}
          </button>
          
          {openDropdown === 'location' && (
            <div className="absolute top-full mt-1 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
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
          )}
        </div>
        
        {/* Cost Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('cost')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm ${
              isFilterActive(filterCostRange)
                ? 'text-scout-accent-600 dark:text-scout-accent-400 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            } hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}
          >
            <DollarSign size={14} />
            <span>Cost</span>
          </button>
          
          {openDropdown === 'cost' && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
            </div>
          )}
        </div>
        
        {/* Match Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('match')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 text-sm ${
              isFilterActive(filterMatchRange)
                ? 'text-scout-accent-600 dark:text-scout-accent-400 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            } hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}
          >
            <Crosshair size={14} />
            <span>Match</span>
          </button>
          
          {openDropdown === 'match' && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </>
  }

  // Default variant with borders
  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between p-2">
          {/* Left side: Compact filters with icons */}
          <div className="flex items-center gap-1">
            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('sort')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  openDropdown === 'sort' 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                } text-gray-700 dark:text-gray-300`}
              >
                <SortDesc size={16} />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown size={14} className={`transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
              </button>
              
              {openDropdown === 'sort' && (
                <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Location Filter (Region + Country) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('location')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilters.location > 0
                    ? 'bg-scout-accent-50 dark:bg-scout-accent-400/20 text-scout-accent-600 dark:text-scout-accent-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Globe size={16} />
                <span className="hidden sm:inline">Location</span>
                {activeFilters.location > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-scout-accent-500 text-white text-xs rounded-full">
                    {activeFilters.location}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
                {activeFilters.location > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterRegion('all');
                      setFilterCountry('all');
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </button>
              
              {openDropdown === 'location' && (
                <div className="absolute top-full mt-1 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
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
              )}
            </div>

            {/* Cost Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('cost')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isFilterActive(filterCostRange)
                    ? 'bg-scout-accent-50 dark:bg-scout-accent-400/20 text-scout-accent-600 dark:text-scout-accent-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <DollarSign size={16} />
                <span className="hidden sm:inline">Cost</span>
                {isFilterActive(filterCostRange) && (
                  <span className="text-xs">
                    {filterCostRange === 'under2000' ? '<$2k' :
                     filterCostRange === '2000-3000' ? '$2-3k' :
                     filterCostRange === '3000-4000' ? '$3-4k' : '>$4k'}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} />
                {isFilterActive(filterCostRange) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterCostRange('all');
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </button>
              
              {openDropdown === 'cost' && (
                <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
                </div>
              )}
            </div>

            {/* Match Score Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('match')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isFilterActive(filterMatchRange)
                    ? 'bg-scout-accent-50 dark:bg-scout-accent-400/20 text-scout-accent-600 dark:text-scout-accent-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Crosshair size={16} />
                <span className="hidden sm:inline">Match</span>
                {isFilterActive(filterMatchRange) && (
                  <span className="text-xs">
                    {filterMatchRange === 'excellent' ? '80%+' :
                     filterMatchRange === 'good' ? '60-79%' :
                     filterMatchRange === 'fair' ? '40-59%' : '<40%'}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform ${openDropdown === 'match' ? 'rotate-180' : ''}`} />
                {isFilterActive(filterMatchRange) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterMatchRange('all');
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </button>
              
              {openDropdown === 'match' && (
                <div className="absolute top-full mt-1 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
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
                </div>
              )}
            </div>

            {/* Clear All */}
            {filterCount > 0 && (
              <>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </>
            )}
          </div>

          {/* Right side: Results count */}
          <div className="px-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{resultsCount}</span> results
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}