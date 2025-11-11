// Search Bar Component with Autocomplete
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import { getAutocompleteSuggestions } from '../../utils/searchUtils';
import { useDebounce } from 'use-debounce';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  autoFocus = false,
  showFilters = false,
  onToggleFilters,
  onSubmit
}) {
  const { darkMode } = useTheme();
  const inputRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debouncedValue] = useDebounce(value, 200);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      getAutocompleteSuggestions(debouncedValue).then(result => {
        if (!result.error && result.suggestions) {
          setSuggestions(result.suggestions);
          setShowSuggestions(true);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSubmit) {
          onSubmit();
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    console.log('🔍 Suggestion clicked:', suggestion);
    console.log('🔍 Setting search term to:', suggestion.value);
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input change
  const handleChange = (e) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  const suggestionClasses = (isSelected) => `
    px-4 py-3 cursor-pointer transition-colors
    ${isSelected
      ? darkMode
        ? 'bg-gray-700 text-white'
        : 'bg-gray-100 text-gray-900'
      : darkMode
        ? 'hover:bg-gray-800 text-gray-300'
        : 'hover:bg-gray-50 text-gray-700'
    }
  `;

  return (
    <div className="relative p-4">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-20 py-3 rounded-lg border
            focus:outline-none focus:ring-2 focus:ring-scout-accent
            ${inputClasses}
          `}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
        />

        {/* Clear and Filter Buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className={`
                p-1.5 rounded-md transition-colors
                ${darkMode
                  ? 'hover:bg-gray-600 text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'}
              `}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showFilters && onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className={`
                p-1.5 rounded-md transition-colors
                ${darkMode
                  ? 'hover:bg-gray-600 text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'}
              `}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          className={`
            absolute left-4 right-4 top-full mt-1 rounded-lg border shadow-lg
            overflow-hidden z-20 max-h-64 overflow-y-auto
            ${darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'}
          `}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSuggestionClick(suggestion);
              }}
              className={suggestionClasses(index === selectedIndex)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.display}</span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {suggestion.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}