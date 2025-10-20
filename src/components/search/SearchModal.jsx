// Main Search Modal Component for Scout2Retire
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, MapPin, Globe, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { useTheme } from '../../contexts/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import NearbyMap from './NearbyMap';
import SearchFilters from './SearchFilters';
import {
  searchTownsByText,
  searchTownsByCountry,
  searchNearbyTowns,
  trackSearch
} from '../../utils/searchUtils';

export default function SearchModal({ isOpen, onClose }) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Search state
  const [searchMode, setSearchMode] = useState('text'); // 'text' | 'nearby' | 'country'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 200);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map state
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(50); // km
  const [mapView, setMapView] = useState('list'); // 'list' | 'map' | 'split'

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    costRange: [0, 200],
    matchRange: [0, 100],
    hasPhotos: false,
    climateType: []
  });

  // Get base styles
  const baseClasses = darkMode
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900';

  const modalClasses = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const tabClasses = (active) => `
    flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all
    ${active
      ? darkMode
        ? 'bg-gray-700 text-white border-b-2 border-scout-accent'
        : 'bg-gray-100 text-gray-900 border-b-2 border-scout-accent'
      : darkMode
        ? 'text-gray-400 hover:bg-gray-800'
        : 'text-gray-600 hover:bg-gray-50'
    }
  `;

  // Search handlers
  const performSearch = useCallback(async () => {
    if (searchMode === 'text' && !debouncedSearchTerm) {
      setResults([]);
      return;
    }

    if (searchMode === 'country' && !selectedCountry) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let searchResult;

      switch (searchMode) {
        case 'text':
          searchResult = await searchTownsByText(debouncedSearchTerm, filters);
          break;

        case 'country':
          searchResult = await searchTownsByCountry(selectedCountry, filters);
          break;

        case 'nearby':
          if (!userLocation) {
            setError('Please enable location access to search nearby');
            setIsLoading(false);
            return;
          }
          searchResult = await searchNearbyTowns(
            userLocation.latitude,
            userLocation.longitude,
            searchRadius
          );
          break;

        default:
          searchResult = { data: [], error: 'Invalid search mode' };
      }

      if (searchResult.error) {
        setError(searchResult.error.message || 'Search failed');
        setResults([]);
      } else {
        setResults(searchResult.data || []);

        // Track search analytics
        trackSearch({
          mode: searchMode,
          term: debouncedSearchTerm || selectedCountry,
          resultsCount: searchResult.data?.length || 0,
          filters: Object.keys(filters).filter(k => filters[k])
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, debouncedSearchTerm, selectedCountry, filters, userLocation, searchRadius]);

  // Perform search when dependencies change
  useEffect(() => {
    if (isOpen) {
      performSearch();
    }
  }, [performSearch, isOpen]);

  // Handle town selection
  const handleTownSelect = useCallback((town) => {
    onClose();
    navigate(`/discover?town=${town.id}`);
  }, [navigate, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full h-full max-h-screen overflow-hidden
          ${modalClasses}
          md:mt-8 md:mb-8 md:h-auto md:max-h-[calc(100vh-4rem)]
          md:max-w-4xl md:rounded-lg md:border md:shadow-xl
        `}
      >
        {/* Header */}
        <div className={`
          sticky top-0 z-10 border-b px-4 py-3
          ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
        `}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="w-5 h-5 text-scout-accent" />
              Search Towns
            </h2>

            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'}
              `}
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Mode Tabs */}
          <div className="flex mt-4 -mx-4 px-4 overflow-x-auto">
            <button
              onClick={() => setSearchMode('text')}
              className={tabClasses(searchMode === 'text')}
            >
              <Search className="w-4 h-4" />
              <span>Text Search</span>
            </button>

            <button
              onClick={() => setSearchMode('nearby')}
              className={tabClasses(searchMode === 'nearby')}
            >
              <MapPin className="w-4 h-4" />
              <span>Nearby</span>
            </button>

            <button
              onClick={() => setSearchMode('country')}
              className={tabClasses(searchMode === 'country')}
            >
              <Globe className="w-4 h-4" />
              <span>By Country</span>
            </button>
          </div>
        </div>

        {/* Search Content */}
        <div className="relative h-[calc(100%-8rem)] md:h-[calc(100%-7rem)] overflow-hidden">
          {searchMode === 'text' && (
            <div className="h-full flex flex-col">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by town name, country, or region..."
                autoFocus
                showFilters
                onToggleFilters={() => setShowFilters(!showFilters)}
              />

              {showFilters && (
                <SearchFilters
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              )}

              <div className="flex-1 overflow-y-auto">
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  onTownSelect={handleTownSelect}
                  searchMode={searchMode}
                  userLocation={userLocation}
                />
              </div>
            </div>
          )}

          {searchMode === 'nearby' && (
            <div className="h-full">
              {/* View toggle for mobile */}
              <div className="md:hidden flex border-b">
                <button
                  onClick={() => setMapView('list')}
                  className={`flex-1 py-2 ${mapView === 'list' ? 'bg-scout-accent text-white' : ''}`}
                >
                  List View
                </button>
                <button
                  onClick={() => setMapView('map')}
                  className={`flex-1 py-2 ${mapView === 'map' ? 'bg-scout-accent text-white' : ''}`}
                >
                  Map View
                </button>
              </div>

              {/* Split view on desktop, toggle on mobile */}
              <div className="h-[calc(100%-3rem)] md:h-full flex flex-col md:flex-row">
                <div className={`
                  ${mapView === 'list' ? 'block' : 'hidden'}
                  md:block md:w-1/2 h-full overflow-y-auto border-r
                `}>
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    error={error}
                    onTownSelect={handleTownSelect}
                    searchMode={searchMode}
                    userLocation={userLocation}
                  />
                </div>

                <div className={`
                  ${mapView === 'map' ? 'block' : 'hidden'}
                  md:block md:w-1/2 h-full
                `}>
                  <NearbyMap
                    towns={results}
                    userLocation={userLocation}
                    onLocationUpdate={setUserLocation}
                    onTownSelect={handleTownSelect}
                    searchRadius={searchRadius}
                    onRadiusChange={setSearchRadius}
                  />
                </div>
              </div>
            </div>
          )}

          {searchMode === 'country' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className={`
                    w-full px-4 py-2 rounded-lg border
                    ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'}
                  `}
                  autoFocus
                >
                  <option value="">Select a country...</option>
                  <option value="Spain">Spain (89)</option>
                  <option value="Portugal">Portugal (45)</option>
                  <option value="Mexico">Mexico (37)</option>
                  <option value="Italy">Italy (28)</option>
                  <option value="Greece">Greece (22)</option>
                  <option value="France">France (18)</option>
                  <option value="USA">USA (104)</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  onTownSelect={handleTownSelect}
                  searchMode={searchMode}
                  userLocation={userLocation}
                  grouped={searchMode === 'country'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}