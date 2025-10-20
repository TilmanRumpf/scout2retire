// Geolocation hook for Scout2Retire
import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // Cache for 5 minutes
    };

    const success = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setIsLoading(false);
      setError(null);
    };

    const error = (err) => {
      let errorMessage = 'Unable to get your location';

      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
        default:
          errorMessage = err.message || 'Unknown error occurred';
      }

      setError(errorMessage);
      setIsLoading(false);
      setLocation(null);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Watch position for continuous updates (optional)
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    location,
    error,
    isLoading,
    requestLocation,
    clearLocation,
    watchLocation,
    hasGeolocation: !!navigator.geolocation
  };
}