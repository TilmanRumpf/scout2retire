// Nearby Map Component with Leaflet
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin, Navigation, Loader, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import { useGeolocation } from '../../hooks/useGeolocation';
import { formatDistance } from '../../utils/searchUtils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Custom marker for towns
const townIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#8fbc8f" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="16" r="4" fill="#fff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Custom marker for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#fff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map control component to center on user location
function CenterOnUserButton({ userLocation }) {
  const map = useMap();

  const handleClick = () => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  };

  if (!userLocation) return null;

  return (
    <button
      onClick={handleClick}
      className="absolute top-20 right-3 z-[1000] bg-white rounded-lg p-2 shadow-lg hover:bg-gray-100"
      aria-label="Center on my location"
    >
      <Navigation className="w-5 h-5 text-gray-700" />
    </button>
  );
}

export default function NearbyMap({
  towns,
  userLocation,
  onLocationUpdate,
  onTownSelect,
  searchRadius,
  onRadiusChange
}) {
  const { darkMode } = useTheme();
  const mapRef = useRef(null);
  const {
    location,
    error: geoError,
    isLoading: geoLoading,
    requestLocation,
    hasGeolocation
  } = useGeolocation();

  // Update parent component when location changes
  useEffect(() => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [location, onLocationUpdate]);

  // Handle location permission request
  const handleRequestLocation = () => {
    requestLocation();
  };

  // Radius options
  const radiusOptions = [
    { value: 10, label: '10km' },
    { value: 25, label: '25km' },
    { value: 50, label: '50km' },
    { value: 100, label: '100km' }
  ];

  // Center map on user location or first town
  const getMapCenter = () => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (towns && towns.length > 0 && towns[0].latitude) {
      return [towns[0].latitude, towns[0].longitude];
    }
    // Default to Spain center (most towns)
    return [40.4637, -3.7492];
  };

  // Get appropriate zoom level based on radius
  const getZoomLevel = () => {
    if (searchRadius <= 10) return 13;
    if (searchRadius <= 25) return 12;
    if (searchRadius <= 50) return 10;
    return 9;
  };

  // Tile layer URL (using OpenStreetMap)
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = darkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Show location permission request if no location
  if (!userLocation && !geoLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className={`
          max-w-sm w-full p-6 rounded-lg border text-center
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <MapPin className="w-12 h-12 mx-auto mb-4 text-scout-accent" />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Enable Location Access
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Allow Scout2Retire to access your location to find retirement towns near you.
          </p>

          {geoError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {geoError}
            </div>
          )}

          <button
            onClick={handleRequestLocation}
            disabled={geoLoading || !hasGeolocation}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${hasGeolocation
                ? 'bg-scout-accent text-white hover:bg-scout-dark'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            {geoLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Getting Location...
              </span>
            ) : hasGeolocation ? (
              'Use My Location'
            ) : (
              'Location Not Available'
            )}
          </button>

          {!hasGeolocation && (
            <p className={`text-xs mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Your browser doesn't support geolocation
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show loading while getting location
  if (geoLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-scout-accent mx-auto mb-2" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Getting your location...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Radius Selector */}
      <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <label className="text-xs text-gray-600 font-medium px-2">Search Radius</label>
        <div className="flex gap-1 mt-1">
          {radiusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onRadiusChange(option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-md transition-colors
                ${searchRadius === option.value
                  ? 'bg-scout-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={getMapCenter()}
        zoom={getZoomLevel()}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url={tileUrl}
          attribution={attribution}
        />

        {/* User location marker and radius circle */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  {userLocation.accuracy && (
                    <p className="text-xs text-gray-600">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={searchRadius * 1000}
              pathOptions={{
                color: '#8fbc8f',
                fillColor: '#8fbc8f',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {/* Town markers with clustering */}
        {towns && towns.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            disableClusteringAtZoom={14}
          >
            {towns.map(town => {
              if (!town.latitude || !town.longitude) return null;

              return (
                <Marker
                  key={town.id}
                  position={[town.latitude, town.longitude]}
                  icon={townIcon}
                  eventHandlers={{
                    click: () => onTownSelect(town)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      {town.photos && (
                        <img
                          src={town.photos.split(',')[0]}
                          alt={town.town_name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="font-semibold">{town.town_name}</h3>
                      <p className="text-sm text-gray-600">
                        {town.region ? `${town.region}, ` : ''}{town.country}
                      </p>

                      {town.distance !== undefined && (
                        <p className="text-sm font-medium text-scout-accent mt-1">
                          {formatDistance(town.distance)} away
                        </p>
                      )}

                      {town.quality_of_life && (
                        <p className="text-sm mt-1">
                          Quality: <strong>{town.quality_of_life}/10</strong>
                          <span className="text-xs text-gray-600 ml-1">
                            ({town.quality_of_life >= 9 ? 'Excellent' :
                              town.quality_of_life >= 8 ? 'Very Good' :
                              town.quality_of_life >= 7 ? 'Good' : 'Fair'})
                          </span>
                        </p>
                      )}

                      <button
                        onClick={() => onTownSelect(town)}
                        className="w-full mt-2 py-1 bg-scout-accent text-white text-sm rounded hover:bg-scout-dark transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* Center on user button */}
        <CenterOnUserButton userLocation={userLocation} />
      </MapContainer>

      {/* Results count overlay */}
      {towns && towns.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
          <p className="text-sm font-medium">
            {towns.length} town{towns.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
}