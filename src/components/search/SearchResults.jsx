// Search Results Component
import React from 'react';
import { MapPin, Loader, AlertCircle, Search } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import TownCard from '../TownCard';
import { formatDistance } from '../../utils/searchUtils';

export default function SearchResults({
  results,
  isLoading,
  error,
  onTownSelect,
  searchMode,
  userLocation,
  grouped = false
}) {
  const { darkMode } = useTheme();

  const emptyStateClasses = darkMode
    ? 'text-gray-400'
    : 'text-gray-600';

  const groupHeaderClasses = darkMode
    ? 'bg-gray-800 text-gray-300 border-gray-700'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader className="w-8 h-8 animate-spin text-scout-accent" />
        <p className={emptyStateClasses}>Searching towns...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Search className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
        <p className={emptyStateClasses}>No towns found</p>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  // Group results by state/region if in country mode
  if (grouped && searchMode === 'country') {
    const groupedResults = {};
    results.forEach(town => {
      const key = town.region || 'Other';
      if (!groupedResults[key]) {
        groupedResults[key] = [];
      }
      groupedResults[key].push(town);
    });

    return (
      <div className="divide-y">
        {Object.entries(groupedResults).map(([groupName, towns]) => (
          <div key={groupName}>
            <div className={`sticky top-0 px-4 py-2 border-b ${groupHeaderClasses}`}>
              <h3 className="font-medium">{groupName} ({towns.length})</h3>
            </div>
            <div className="divide-y">
              {towns.map(town => (
                <SearchResultItem
                  key={town.id}
                  town={town}
                  onSelect={onTownSelect}
                  searchMode={searchMode}
                  userLocation={userLocation}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Regular list display
  return (
    <div className="divide-y">
      {results.map(town => (
        <SearchResultItem
          key={town.id}
          town={town}
          onSelect={onTownSelect}
          searchMode={searchMode}
          userLocation={userLocation}
          darkMode={darkMode}
        />
      ))}

      {results.length >= 20 && (
        <div className="py-4 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Showing top {results.length} results
          </p>
        </div>
      )}
    </div>
  );
}

// Individual search result item
function SearchResultItem({ town, onSelect, searchMode, userLocation, darkMode }) {
  const itemClasses = `
    p-4 cursor-pointer transition-colors
    ${darkMode
      ? 'hover:bg-gray-800'
      : 'hover:bg-gray-50'}
  `;

  const textClasses = darkMode
    ? 'text-gray-400'
    : 'text-gray-600';

  const scoreClasses = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div
      onClick={() => onSelect(town)}
      className={itemClasses}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(town);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Town Photo */}
        {town.image_url_1 ? (
          <img
            src={town.image_url_1}
            alt={town.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className={`
            w-16 h-16 rounded-lg flex items-center justify-center
            ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `}>
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Town Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {town.name}
              </h3>
              <p className={`text-sm ${textClasses}`}>
                {town.region ? `${town.region}, ` : ''}{town.country}
              </p>
            </div>

            {/* Score or Distance */}
            <div className="flex flex-col items-end gap-1">
              {town.quality_of_life && (
                <div className="text-right">
                  <span className={`font-bold ${scoreClasses(town.quality_of_life * 10)}`}>
                    {town.quality_of_life}/10
                  </span>
                  <p className="text-xs text-gray-500">
                    {town.quality_of_life >= 9 ? 'Excellent' :
                     town.quality_of_life >= 8 ? 'Very Good' :
                     town.quality_of_life >= 7 ? 'Good' : 'Fair'}
                  </p>
                </div>
              )}

              {searchMode === 'nearby' && town.distance !== undefined && (
                <span className={`text-sm ${textClasses}`}>
                  {formatDistance(town.distance)}
                </span>
              )}
            </div>
          </div>

          {/* Description preview */}
          {town.description && (
            <p className={`text-sm mt-2 line-clamp-2 ${textClasses}`}>
              {town.description}
            </p>
          )}

          {/* Cost indicator */}
          {town.cost_of_living_index && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Cost:
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(level => (
                  <span
                    key={level}
                    className={`text-xs ${
                      town.cost_of_living_index >= level * 20
                        ? 'text-scout-accent'
                        : darkMode ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    $
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}