import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { generateUsernameSuggestions, validateUsername, formatUsername } from '../utils/usernameGenerator';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

// OptionButton component matching onboarding style
const OptionButton = ({ option, isSelected, onClick, isAvailable = true }) => {
  return (
    <button
      onClick={() => onClick(option)}
      className={`
        relative overflow-hidden transition-all duration-200
        ${isSelected 
          ? 'bg-scout-accent-500 text-white border-scout-accent-600' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
        }
        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border-2 rounded-lg p-4
        min-h-[60px] flex items-center justify-center
        shadow-sm hover:shadow-md
      `}
      disabled={false}
    >
      <span className="font-medium text-center">
        {formatUsername(option)}
      </span>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      {!isAvailable && (
        <div className="absolute top-2 right-2">
          <X className="w-4 h-4 text-red-500" />
        </div>
      )}
    </button>
  );
};

export const UsernameSelector = ({ 
  onUsernameSelect, 
  currentUsername = null,
  userId,
  showCustomInput = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(currentUsername || '');
  const [customUsername, setCustomUsername] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({});
  const [validationError, setValidationError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate initial suggestions
  useEffect(() => {
    generateNewSuggestions();
  }, []);

  // Check availability when custom username changes
  useEffect(() => {
    if (customUsername) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(customUsername);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [customUsername]);

  const generateNewSuggestions = async () => {
    setIsRefreshing(true);
    const newSuggestions = generateUsernameSuggestions(6);
    setSuggestions(newSuggestions);
    setIsRefreshing(false);
    
    // Check availability in background (don't wait)
    newSuggestions.forEach(username => {
      checkUsernameAvailability(username, false);
    });
  };

  const checkUsernameAvailability = async (username, showLoading = true) => {
    const validation = validateUsername(username);
    
    if (!validation.isValid) {
      setAvailabilityStatus(prev => ({
        ...prev,
        [username]: { available: false, error: validation.error }
      }));
      if (username === customUsername) {
        setValidationError(validation.error);
      }
      return false;
    }

    if (showLoading) {
      setIsCheckingAvailability(true);
    }

    try {
      // Check if username already exists
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username);
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
      }

      // Username is available if no records found or only current user has it
      const isAvailable = !data || data.length === 0 || 
        (userId && data.length === 1 && data[0].id === userId);
      
      setAvailabilityStatus(prev => ({
        ...prev,
        [username]: { available: isAvailable, error: null }
      }));

      if (username === customUsername) {
        setValidationError(isAvailable ? '' : 'Username is already taken');
      }

      return isAvailable;
    } catch (error) {
      console.error('Error checking username availability:', error);
      // On error, assume available to not block the UI
      return true;
    } finally {
      if (showLoading) {
        setIsCheckingAvailability(false);
      }
    }
  };

  const handleUsernameSelect = (username) => {
    setSelectedUsername(username);
    setCustomUsername('');
    setValidationError('');
    
    // Call onUsernameSelect immediately
    onUsernameSelect(username);
  };

  const handleCustomUsernameSelect = () => {
    if (customUsername && !validationError) {
      setSelectedUsername(customUsername);
      onUsernameSelect(customUsername);
    }
  };

  const isUsernameAvailable = (username) => {
    const status = availabilityStatus[username];
    // If we haven't checked yet, assume it's available
    if (!status) return true;
    return status.available;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose your username
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select a suggested username or create your own
          </p>
        </div>
        <button
          onClick={generateNewSuggestions}
          disabled={isRefreshing}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isRefreshing ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
            border border-gray-200 dark:border-gray-600
            text-gray-700 dark:text-gray-200
          `}
          title="Generate new suggestions"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Username suggestions grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {suggestions.map((username) => (
          <OptionButton
            key={username}
            option={username}
            isSelected={selectedUsername === username}
            onClick={handleUsernameSelect}
            isAvailable={isUsernameAvailable(username)}
          />
        ))}
      </div>

      {/* Custom username input */}
      {showCustomInput && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Or create your own username
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="Enter username"
                className={`
                  w-full px-4 py-2 rounded-lg
                  bg-white dark:bg-gray-800
                  border ${validationError ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-scout-accent-500
                `}
              />
              {validationError && (
                <p className="text-sm text-red-500 mt-1">{validationError}</p>
              )}
              {customUsername && !validationError && isCheckingAvailability && (
                <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
              )}
              {customUsername && !validationError && !isCheckingAvailability && (
                <p className="text-sm text-green-600 mt-1">Username is available</p>
              )}
            </div>
            <button
              onClick={handleCustomUsernameSelect}
              disabled={!customUsername || !!validationError || isCheckingAvailability}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${!customUsername || !!validationError || isCheckingAvailability
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-scout-accent-500 hover:bg-scout-accent-600 text-white'
                }
              `}
            >
              Select
            </button>
          </div>
        </div>
      )}

      {/* Current selection display */}
      {selectedUsername && (
        <div className="p-4 bg-scout-accent-50 dark:bg-gray-800 rounded-lg border border-scout-accent-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected username:</p>
          <p className="text-lg font-semibold text-scout-accent-700 dark:text-scout-accent-300">
            {formatUsername(selectedUsername)}
          </p>
        </div>
      )}
    </div>
  );
};