// Search Filters Component with Progressive Disclosure
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';

export default function SearchFilters({ filters, onChange, onClose }) {
  const { darkMode } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    cost: true,
    match: false,
    climate: false,
    other: false
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle filter changes
  const handleCostChange = (type, value) => {
    const newRange = [...filters.costRange];
    if (type === 'min') {
      newRange[0] = Math.min(value, newRange[1]);
    } else {
      newRange[1] = Math.max(value, newRange[0]);
    }
    onChange({ ...filters, costRange: newRange });
  };

  const handleMatchChange = (type, value) => {
    const newRange = [...filters.matchRange];
    if (type === 'min') {
      newRange[0] = Math.min(value, newRange[1]);
    } else {
      newRange[1] = Math.max(value, newRange[0]);
    }
    onChange({ ...filters, matchRange: newRange });
  };

  const handleClimateToggle = (climate) => {
    const currentClimate = filters.climateType || [];
    const newClimate = currentClimate.includes(climate)
      ? currentClimate.filter(c => c !== climate)
      : [...currentClimate, climate];
    onChange({ ...filters, climateType: newClimate });
  };

  // Reset all filters
  const resetFilters = () => {
    onChange({
      costRange: [0, 200],
      matchRange: [0, 100],
      hasPhotos: false,
      climateType: []
    });
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.costRange[0] > 0 ||
    filters.costRange[1] < 200 ||
    filters.matchRange[0] > 0 ||
    filters.matchRange[1] < 100 ||
    filters.hasPhotos ||
    (filters.climateType && filters.climateType.length > 0);

  const sectionClasses = darkMode
    ? 'border-gray-700'
    : 'border-gray-200';

  const headerClasses = `
    flex items-center justify-between p-3 cursor-pointer transition-colors
    ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
  `;

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const labelClasses = darkMode
    ? 'text-gray-400'
    : 'text-gray-600';

  const climateOptions = [
    { value: 'tropical', label: 'Tropical' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'temperate', label: 'Temperate' },
    { value: 'continental', label: 'Continental' },
    { value: 'arid', label: 'Arid/Desert' },
    { value: 'mountain', label: 'Mountain' }
  ];

  return (
    <div className={`
      border-b transition-all
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
    `}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-scout-accent text-white text-xs rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className={`
                text-sm px-3 py-1 rounded transition-colors
                ${darkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-200'}
              `}
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className={`
              p-1 rounded transition-colors
              ${darkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-200'}
            `}
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {/* Cost Range */}
        <div className={`border-b ${sectionClasses}`}>
          <div
            onClick={() => toggleSection('cost')}
            className={headerClasses}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
              Cost of Living
            </span>
            {expandedSections.cost ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedSections.cost && (
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className={`text-xs ${labelClasses}`}>Min</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.costRange[0]}
                    onChange={(e) => handleCostChange('min', Number(e.target.value))}
                    className="w-full accent-scout-accent"
                  />
                  <span className={`text-xs ${labelClasses}`}>
                    {filters.costRange[0]}
                  </span>
                </div>

                <div className="flex-1">
                  <label className={`text-xs ${labelClasses}`}>Max</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.costRange[1]}
                    onChange={(e) => handleCostChange('max', Number(e.target.value))}
                    className="w-full accent-scout-accent"
                  />
                  <span className={`text-xs ${labelClasses}`}>
                    {filters.costRange[1]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Range */}
        <div className={`border-b ${sectionClasses}`}>
          <div
            onClick={() => toggleSection('match')}
            className={headerClasses}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
              Match Percentage
            </span>
            {expandedSections.match ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedSections.match && (
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className={`text-xs ${labelClasses}`}>Min</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.matchRange[0]}
                    onChange={(e) => handleMatchChange('min', Number(e.target.value))}
                    className="w-full accent-scout-accent"
                  />
                  <span className={`text-xs ${labelClasses}`}>
                    {filters.matchRange[0]}%
                  </span>
                </div>

                <div className="flex-1">
                  <label className={`text-xs ${labelClasses}`}>Max</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.matchRange[1]}
                    onChange={(e) => handleMatchChange('max', Number(e.target.value))}
                    className="w-full accent-scout-accent"
                  />
                  <span className={`text-xs ${labelClasses}`}>
                    {filters.matchRange[1]}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Climate Type */}
        <div className={`border-b ${sectionClasses}`}>
          <div
            onClick={() => toggleSection('climate')}
            className={headerClasses}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
              Climate Type
            </span>
            {expandedSections.climate ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedSections.climate && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {climateOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.climateType?.includes(option.value) || false}
                      onChange={() => handleClimateToggle(option.value)}
                      className="accent-scout-accent"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div className={sectionClasses}>
          <div
            onClick={() => toggleSection('other')}
            className={headerClasses}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
              Other Options
            </span>
            {expandedSections.other ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedSections.other && (
            <div className="px-3 pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasPhotos}
                  onChange={(e) => onChange({ ...filters, hasPhotos: e.target.checked })}
                  className="accent-scout-accent"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Only show towns with photos
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}