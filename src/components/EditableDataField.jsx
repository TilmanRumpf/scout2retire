import { useState, useRef, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { Check, X, Loader2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * EditableDataField - Inline editable field with database updates
 *
 * @param {string} label - Display label for the field
 * @param {any} value - Current field value
 * @param {string} field - Database column name
 * @param {string} townId - Town ID for database update
 * @param {string} type - Field type: 'number' | 'string' | 'boolean' | 'select'
 * @param {string|array} range - Valid range (e.g., "1-10") or array of select options
 * @param {string} description - Field description/help text
 * @param {function} onUpdate - Callback after successful update
 */
const EditableDataField = ({
  label,
  value,
  field,
  townId,
  townName,
  countryName,
  type = 'string',
  range,
  description,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'string' && inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Parse range string (e.g., "1-10" -> { min: 1, max: 10 })
  const parseRange = () => {
    if (!range) return null;
    if (typeof range === 'string' && range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      return { min, max };
    }
    return null;
  };

  // Validate value based on type and range
  const validateValue = (val) => {
    if (type === 'number') {
      const numVal = Number(val);
      if (isNaN(numVal)) return { valid: false, error: 'Must be a number' };

      const rangeObj = parseRange();
      if (rangeObj) {
        if (numVal < rangeObj.min || numVal > rangeObj.max) {
          return { valid: false, error: `Must be between ${rangeObj.min} and ${rangeObj.max}` };
        }
      }
    }
    return { valid: true };
  };

  // Save to database
  const handleSave = async () => {
    // Validate
    const validation = validateValue(editValue);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Convert value based on type
    let valueToSave = editValue;
    if (type === 'number') {
      valueToSave = editValue === '' || editValue === null ? null : Number(editValue);
    } else if (type === 'boolean') {
      valueToSave = editValue === 'true' || editValue === true;
    }

    setSaveState('saving');

    try {
      const { data, error } = await supabase
        .from('towns')
        .update({ [field]: valueToSave })
        .eq('id', townId)
        .select();

      if (error) throw error;

      setSaveState('success');
      toast.success(`${label} updated successfully`);

      // Call onUpdate callback with new value
      if (onUpdate) {
        onUpdate(field, valueToSave);
      }

      // Exit edit mode after brief success indicator
      setTimeout(() => {
        setIsEditing(false);
        setSaveState('idle');
      }, 1000);

    } catch (error) {
      console.error('Error updating field:', error);
      setSaveState('error');
      toast.error(`Failed to update ${label}: ${error.message}`);

      // Reset error state after 2 seconds
      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setSaveState('idle');
  };

  // Generate smart search query with units and context
  const generateSmartQuery = () => {
    const labelLower = label.toLowerCase();
    let query = '';

    // Format: "(Exact Town Name, Country)" to ensure correct spelling
    const exactLocation = `("${townName}", ${countryName})`;

    // Distance fields - include unit (km) and natural phrasing
    if (labelLower.includes('distance')) {
      if (labelLower.includes('airport')) {
        if (labelLower.includes('regional')) {
          query = `how far (in km) is the nearest domestic airport in ${exactLocation}`;
        } else if (labelLower.includes('international')) {
          query = `how far (in km) is the nearest international airport in ${exactLocation}`;
        } else {
          query = `how far (in km) is the nearest airport in ${exactLocation}`;
        }
      } else if (labelLower.includes('hospital')) {
        query = `how far (in km) is the nearest major hospital in ${exactLocation}`;
      } else {
        query = `${exactLocation} ${label.toLowerCase()} in kilometers`;
      }
    }
    // Count fields - "how many X"
    else if (labelLower.includes('count')) {
      if (labelLower.includes('hospital')) {
        query = `how many hospitals are in ${exactLocation}`;
      } else {
        const itemName = label.replace(/count/i, '').trim().toLowerCase();
        query = `how many ${itemName} are in ${exactLocation}`;
      }
    }
    // Score/Rating/Index fields - include scale/range
    else if (labelLower.includes('score') || labelLower.includes('rating')) {
      if (range && typeof range === 'string') {
        // Include the scale in the query
        query = `${exactLocation} ${label.toLowerCase()} (${range} scale)`;
      } else {
        query = `${exactLocation} ${label.toLowerCase()}`;
      }
    }
    // Air Quality Index - include AQI standard
    else if (labelLower.includes('air quality')) {
      query = `${exactLocation} air quality index AQI 0-500`;
    }
    // Walkability - include 0-100 scale
    else if (labelLower.includes('walkability')) {
      query = `${exactLocation} walkability score 0-100`;
    }
    // Boolean fields - yes/no questions
    else if (type === 'boolean') {
      if (labelLower.includes('available') || labelLower.includes('visa')) {
        query = `is ${label.toLowerCase()} in ${exactLocation}`;
      } else if (labelLower.includes('doctors') && labelLower.includes('english')) {
        query = `are there English-speaking doctors in ${exactLocation}`;
      } else {
        query = `does ${exactLocation} have ${label.toLowerCase()}`;
      }
    }
    // Quality fields - "how good is X"
    else if (labelLower.includes('quality')) {
      query = `${exactLocation} ${label.toLowerCase()} rating`;
    }
    // Default
    else {
      query = `${exactLocation} ${label.toLowerCase()}`;
    }

    return query;
  };

  // Open search modal with suggested query
  const handleGoogleSearch = () => {
    const suggestedQuery = generateSmartQuery();
    setSearchQuery(suggestedQuery);
    setShowSearchModal(true);
  };

  // Execute the search with current query
  const executeSearch = () => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleSearchUrl, '_blank');
    setShowSearchModal(false);
  };

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [showSearchModal]);

  // Render input based on type
  const renderInput = () => {
    const baseClasses = `w-full px-2 py-1 border rounded transition-colors ${
      saveState === 'error'
        ? 'border-red-500 focus:border-red-600'
        : 'border-gray-300 focus:border-blue-500'
    } focus:outline-none focus:ring-2 focus:ring-blue-200`;

    switch (type) {
      case 'number':
        const rangeObj = parseRange();
        return (
          <input
            ref={inputRef}
            type="number"
            value={editValue ?? ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseClasses}
            min={rangeObj?.min}
            max={rangeObj?.max}
            step="any"
            placeholder="Enter value"
          />
        );

      case 'boolean':
        return (
          <select
            ref={inputRef}
            value={editValue === true ? 'true' : editValue === false ? 'false' : ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseClasses}
          >
            <option value="">-- Select --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'select':
        const options = Array.isArray(range) ? range : [];
        return (
          <select
            ref={inputRef}
            value={editValue ?? ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseClasses}
          >
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      default: // string
        return (
          <input
            ref={inputRef}
            type="text"
            value={editValue ?? ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={baseClasses}
            placeholder="Enter value"
          />
        );
    }
  };

  // Display value formatting
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-red-500 text-sm italic">(empty)</span>;
    }

    if (type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  return (
    <div className="space-y-2">
      {/* Label and Field Name */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {field}
          </div>
        </div>

        {/* Action buttons (only show when not editing) */}
        {!isEditing && (
          <div className="flex items-center gap-1">
            {/* Google Search button */}
            <button
              onClick={handleGoogleSearch}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title={`Google search: ${townName} ${label}`}
            >
              <span className="text-base">🤔</span>
            </button>

            {/* Edit button */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit field"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Value Display or Edit Mode */}
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {renderInput()}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Save (Enter)"
            >
              {saveState === 'saving' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saveState === 'success' ? (
                <Check size={16} />
              ) : (
                <Check size={16} />
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={saveState === 'saving'}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Cancel (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Range/Options Help */}
          {range && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {type === 'select' ? (
                <span>Options: {Array.isArray(range) ? range.join(', ') : range}</span>
              ) : (
                <span>Valid range: {range}</span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="text-xs text-gray-600 dark:text-gray-400 italic">
              {description}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Display Value */}
          <div
            onClick={() => setIsEditing(true)}
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {displayValue()}
            </div>
          </div>

          {/* Success Indicator */}
          {saveState === 'success' && (
            <Check size={20} className="text-green-600 dark:text-green-400 animate-pulse" />
          )}
        </div>
      )}

      {/* Error State Border (persistent until reset) */}
      {saveState === 'error' && !isEditing && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Failed to save. Click to try again.
        </div>
      )}

      {/* Google Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-xl">🤔</span>
                Google Search Query
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review and edit the search query before searching
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Query <span className="text-gray-500">(editable)</span>
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                    } else if (e.key === 'Escape') {
                      setShowSearchModal(false);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your search query..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 Tip: Include units (km, %, count) and ranges (0-10) for better results
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-semibold">For {townName}:</span> {label}
                  {range && <span className="text-blue-600 dark:text-blue-400"> (Range: {typeof range === 'string' ? range : range.join(', ')})</span>}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>Search Google</span>
                <span>🔍</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableDataField;
