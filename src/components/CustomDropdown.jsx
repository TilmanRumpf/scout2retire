import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false,
  showSearch = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = (options || []).filter(option => 
    option && option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = (options || []).find(opt => opt && opt.value === value);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }
        }}
        disabled={disabled}
        className={`w-full px-3 sm:px-4 text-left ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-2 focus:ring-scout-accent-300 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] border-2 flex items-center justify-between ${
          value 
            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
        } ${className}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={20} 
          className={`flex-shrink-0 ml-2 ${uiConfig.colors.muted} transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 ${uiConfig.layout.radius.md} bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200`}>
          {/* Search input for long lists */}
          {showSearch && options.length > 10 && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className={`w-full px-3 py-1.5 text-sm ${uiConfig.layout.radius.md} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-scout-accent-300`}
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value || `empty-${index}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-scout-accent-50 dark:hover:bg-scout-accent-900/20 transition-colors ${
                    value === option.value 
                      ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check size={16} className="text-scout-accent-600 dark:text-scout-accent-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;