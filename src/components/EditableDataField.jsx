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
 * @param {boolean} isExecutiveAdmin - Whether current user is executive admin
 */
const EditableDataField = ({
  label,
  value,
  field,
  townId,
  townName,
  countryName,
  subdivisionCode,
  type = 'string',
  range,
  description,
  onUpdate,
  isExecutiveAdmin = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expectedFormat, setExpectedFormat] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [hasExistingTemplate, setHasExistingTemplate] = useState(false);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Parse column description for SEARCH and EXPECTED sections
  const parseDescriptionForSearch = (description) => {
    if (!description) return null;

    // Extract SEARCH: section
    const searchMatch = description.match(/SEARCH:\s*(.+?)(?=\nEXPECTED:|$)/s);
    // Extract EXPECTED: section
    const expectedMatch = description.match(/EXPECTED:\s*(.+?)(?=\n|$)/);
    // Human description is everything before SEARCH:
    const humanDescription = description.split(/\nSEARCH:/)[0].trim();

    return {
      searchTemplate: searchMatch?.[1]?.trim() || null,
      expectedFormat: expectedMatch?.[1]?.trim() || null,
      humanDescription: humanDescription || description
    };
  };

  // Load saved query templates from localStorage (FALLBACK)
  const getQueryTemplate = (fieldName) => {
    try {
      const templates = JSON.parse(localStorage.getItem('searchQueryTemplates') || '{}');
      return templates[fieldName] || null;
    } catch {
      return null;
    }
  };

  // Save query template to localStorage
  const saveQueryTemplate = (fieldName, template) => {
    try {
      const templates = JSON.parse(localStorage.getItem('searchQueryTemplates') || '{}');
      templates[fieldName] = template;
      localStorage.setItem('searchQueryTemplates', JSON.stringify(templates));
      toast.success(`Query template saved for ${label}!`);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save query template');
    }
  };

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
      // Handle multiple boolean representations: 'true', true, 1, '1' -> true; 'false', false, 0, '0' -> false
      valueToSave = editValue === 'true' || editValue === true || editValue === 1 || editValue === '1';
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

  // Generate smart search query with natural question format
  const generateSmartQuery = () => {
    const labelLower = label.toLowerCase();
    let query = '';

    // Location format: "Town, Country" (with comma for better Google parsing)
    const location = `${townName}, ${countryName}`;

    // Distance fields - "how far is..." format
    if (labelLower.includes('distance')) {
      if (labelLower.includes('airport')) {
        if (labelLower.includes('regional')) {
          query = `how far is the nearest domestic airport from ${location} in km?`;
        } else if (labelLower.includes('international')) {
          query = `how far is the nearest international airport from ${location} in km?`;
        } else {
          query = `how far is the nearest airport from ${location} in km?`;
        }
      } else if (labelLower.includes('hospital')) {
        query = `how far is the nearest major hospital from ${location} in km?`;
      } else {
        query = `how far is ${label.toLowerCase()} from ${location} in km?`;
      }
    }
    // Count fields - "how many X are in..." format
    else if (labelLower.includes('count')) {
      if (labelLower.includes('hospital')) {
        query = `how many hospitals are in ${location}?`;
      } else {
        const itemName = label.replace(/count/i, '').trim().toLowerCase();
        query = `how many ${itemName} are in ${location}?`;
      }
    }
    // Score/Rating fields - "what is... on a scale from..." format
    else if (labelLower.includes('score') || labelLower.includes('rating')) {
      if (range && typeof range === 'string') {
        query = `what is ${location} ${label.toLowerCase()} on a scale from ${range}?`;
      } else {
        query = `what is ${location} ${label.toLowerCase()}?`;
      }
    }
    // Air Quality Index - "what is the air quality index (AQI) in..." format
    else if (labelLower.includes('air quality')) {
      query = `what is the air quality index (AQI) in ${location}?`;
    }
    // Walkability - "what is... walkability score on a scale from..." format
    else if (labelLower.includes('walkability')) {
      if (range && typeof range === 'string') {
        query = `what is ${location} walkability score on a scale from ${range}?`;
      } else {
        query = `what is ${location} walkability score on a scale from 0-100?`;
      }
    }
    // Boolean fields - "does... have..." or "is... available" format
    else if (type === 'boolean') {
      if (labelLower.includes('available')) {
        query = `does ${location} have ${label.replace(/available/i, '').trim().toLowerCase()} available?`;
      } else if (labelLower.includes('visa')) {
        query = `does ${location} have ${label.toLowerCase()}?`;
      } else if (labelLower.includes('doctors') && labelLower.includes('english')) {
        query = `are there English speaking doctors in ${location}?`;
      } else if (labelLower.includes('tax haven')) {
        query = `is ${location} a tax haven?`;
      } else if (labelLower.includes('treaty')) {
        query = `does ${location} have a tax treaty with the US?`;
      } else {
        query = `what is ${location} ${label.toLowerCase()}?`;
      }
    }
    // Quality fields - "what is the... quality in..." format
    else if (labelLower.includes('quality')) {
      query = `what is the ${label.toLowerCase()} in ${location}?`;
    }
    // Default - "what is..." format
    else {
      query = `what is ${location} ${label.toLowerCase()}?`;
    }

    return query;
  };

  // Open combined modal with both search and edit
  const handleOpenCombinedModal = () => {
    let suggestedQuery;
    let hasTemplate = false;

    // PRIORITY 1: Column description with SEARCH: section
    const parsedDescription = parseDescriptionForSearch(description);
    if (parsedDescription?.searchTemplate) {
      // Use search template from column description (already includes Expected: format)
      suggestedQuery = parsedDescription.searchTemplate
        .replace(/\{town_name\}/g, townName)
        .replace(/\{town\}/g, townName)  // Support legacy {town} placeholder
        .replace(/\{country\}/g, countryName)
        .replace(/\{subdivision\}/g, subdivisionCode || '')
        .replace(/\{subdivision_code\}/g, subdivisionCode || '')
        .replace(/\{state\}/g, subdivisionCode || '')
        .replace(/\{region\}/g, subdivisionCode || '');
      hasTemplate = true;
    }
    // PRIORITY 2: localStorage template (FALLBACK)
    else {
      const savedTemplate = getQueryTemplate(field);
      if (savedTemplate) {
        suggestedQuery = savedTemplate
          .replace(/\{town_name\}/g, townName)
          .replace(/\{town\}/g, townName)
          .replace(/\{subdivision\}/g, subdivisionCode || '')
          .replace(/\{subdivision_code\}/g, subdivisionCode || '')
          .replace(/\{state\}/g, subdivisionCode || '')
          .replace(/\{region\}/g, subdivisionCode || '')
          .replace(/\{country\}/g, countryName);
        hasTemplate = true;
      }
      // PRIORITY 3: Auto-generated query with expected format
      else {
        const baseQuery = generateSmartQuery();
        // Add expected format to the query
        const defaultExpected = type === 'boolean' ? 'Yes or No'
                              : type === 'number' && range ? range
                              : 'Appropriate value';
        suggestedQuery = `${baseQuery} Expected: ${defaultExpected}`;
        hasTemplate = false;
      }
    }

    // Extract expected format from query if present
    const expectedMatch = suggestedQuery.match(/Expected:\s*(.+?)(?:\?|$)/i);
    const initialExpectedFormat = expectedMatch ? expectedMatch[1].trim() : '';

    setHasExistingTemplate(hasTemplate);
    setSearchQuery(suggestedQuery);
    setExpectedFormat(initialExpectedFormat);
    setEditValue(value);
    setSaveAsTemplate(false);
    setSaveState('idle');
    setShowCombinedModal(true);
  };

  // Execute the search (keep modal open)
  const executeSearch = () => {
    // Replace ALL placeholders with actual town data
    const finalQuery = searchQuery
      .replace(/\{town_name\}/g, townName)
      .replace(/\{town\}/g, townName)
      .replace(/\{subdivision\}/g, subdivisionCode || '')
      .replace(/\{subdivision_code\}/g, subdivisionCode || '')
      .replace(/\{state\}/g, subdivisionCode || '')
      .replace(/\{region\}/g, subdivisionCode || '')
      .replace(/\{country\}/g, countryName);

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
    // Open in smaller popup window
    window.open(googleSearchUrl, '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    // Modal stays open for data entry
  };

  // Save data to database from modal
  const handleSaveFromModal = async () => {
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
      // Handle multiple boolean representations: 'true', true, 1, '1' -> true; 'false', false, 0, '0' -> false
      valueToSave = editValue === 'true' || editValue === true || editValue === 1 || editValue === '1';
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

      // For non-exec admins, close modal after brief success indicator
      if (!isExecutiveAdmin) {
        setTimeout(() => {
          setShowCombinedModal(false);
          setSaveState('idle');
        }, 1000);
      }

    } catch (error) {
      console.error('Error updating field:', error);
      setSaveState('error');
      toast.error(`Failed to update ${label}: ${error.message}`);

      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    }
  };

  // Handle template save/update (for executive admins)
  const handleSaveTemplate = async () => {
    try {
      // Replace actual values with placeholders
      let template = searchQuery
        .replace(new RegExp(townName, 'gi'), '{town_name}')
        .replace(new RegExp(countryName, 'gi'), '{country}');

      // Replace subdivision if present
      if (subdivisionCode && subdivisionCode.trim()) {
        template = template.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
      }

      // Parse current description to preserve human-readable part
      const parsedDescription = parseDescriptionForSearch(description);
      const humanPart = parsedDescription?.humanDescription || description || `Field: ${field}`;

      // Extract expected format from template (if user included it in the query)
      const expectedMatch = template.match(/Expected:\s*(.+?)(?:\?|$)/i);
      let finalExpectedFormat = '';
      let cleanTemplate = template;

      if (expectedMatch) {
        // User included Expected in query - extract it
        finalExpectedFormat = expectedMatch[1].trim();
        // Remove "Expected: X" from template since we save it separately
        cleanTemplate = template.replace(/\s*Expected:\s*.+?(?:\?|$)/i, '').trim();
      } else {
        // No Expected in query - use the state value
        finalExpectedFormat = expectedFormat.trim() || 'Appropriate value';
      }

      const newDescription = `${humanPart}

SEARCH: ${cleanTemplate}
EXPECTED: ${finalExpectedFormat}`;

      // Try to update column description in Supabase
      const { error } = await supabase.rpc('update_column_description', {
        table_name: 'towns',
        column_name: field,
        new_description: newDescription
      });

      if (error) {
        // RPC function doesn't exist yet - save to localStorage and show manual instructions
        console.warn('RPC function not available, saving to localStorage only:', error);
        saveQueryTemplate(field, template);
        setHasExistingTemplate(true);

        // Copy SQL command to clipboard
        const sqlCommand = `COMMENT ON COLUMN public.towns.${field} IS $$ ${newDescription} $$;`;
        navigator.clipboard.writeText(sqlCommand);

        toast((t) => (
          <div>
            <p className="font-bold">✅ Template saved to localStorage!</p>
            <p className="text-sm mt-1">To save to database (all towns):</p>
            <p className="text-xs mt-1">SQL command copied to clipboard </p>
            <p className="text-xs">Paste in Supabase SQL editor</p>
          </div>
        ), { duration: 8000 });
        return;
      }

      setHasExistingTemplate(true);
      toast.success(`✅ Template saved to database! All 343+ towns will use this search query for "${label}".`);

      // Also save to localStorage as backup
      saveQueryTemplate(field, template);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Auto-focus search input ONLY when modal first opens
  useEffect(() => {
    if (showCombinedModal) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
      // Auto-resize textarea if it contains existing text - with slight delay for DOM to be ready
      setTimeout(() => {
        if (editInputRef.current && type === 'string') {
          editInputRef.current.style.height = 'auto';
          editInputRef.current.style.height = editInputRef.current.scrollHeight + 'px';
        }
      }, 50);
    }
  }, [showCombinedModal]); // Removed editValue and type from dependencies to prevent re-focusing

  // Render input based on type (for inline editing)
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
        // Handle 0/1, true/false, 'true'/'false' values
        const boolValue = editValue === true || editValue === 1 || editValue === '1' || editValue === 'true' ? 'true'
                        : editValue === false || editValue === 0 || editValue === '0' || editValue === 'false' ? 'false'
                        : '';
        return (
          <select
            ref={inputRef}
            value={boolValue}
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

  // Render modal input (larger styling for modal)
  const renderModalInput = () => {
    const baseClasses = `w-full px-4 py-3 border rounded-lg transition-colors ${
      saveState === 'error'
        ? 'border-red-500 focus:border-red-600'
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
    } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200`;

    switch (type) {
      case 'number':
        const rangeObj = parseRange();
        return (
          <input
            ref={editInputRef}
            type="number"
            value={editValue ?? ''}
            onChange={(e) => setEditValue(e.target.value)}
            className={baseClasses}
            min={rangeObj?.min}
            max={rangeObj?.max}
            step="any"
            placeholder="Enter value from Google"
          />
        );

      case 'boolean':
        // Handle 0/1, true/false, 'true'/'false' values
        const boolValue = editValue === true || editValue === 1 || editValue === '1' || editValue === 'true' ? 'true'
                        : editValue === false || editValue === 0 || editValue === '0' || editValue === 'false' ? 'false'
                        : '';
        return (
          <select
            ref={editInputRef}
            value={boolValue}
            onChange={(e) => setEditValue(e.target.value)}
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
            ref={editInputRef}
            value={editValue ?? ''}
            onChange={(e) => setEditValue(e.target.value)}
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
          <textarea
            ref={editInputRef}
            value={editValue ?? ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditValue(newValue);
              // Auto-resize the textarea after value change
              const target = e.target;
              setTimeout(() => {
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }, 0);
            }}
            onKeyDown={(e) => {
              // Allow Ctrl/Cmd+Enter to save, Escape to close
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSaveFromModal();
              } else if (e.key === 'Escape') {
                setShowCombinedModal(false);
              }
            }}
            onFocus={(e) => {
              // Trigger resize on focus to ensure proper height
              const target = e.target;
              setTimeout(() => {
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }, 0);
            }}
            className={`${baseClasses} resize-none overflow-y-auto`}
            placeholder="Enter value from Google"
            rows={3}
            readOnly={false}
            disabled={false}
            style={{
              minHeight: '80px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
              cursor: 'text'
            }}
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
            {/* Combined Research & Edit button */}
            <button
              onClick={handleOpenCombinedModal}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-0.5"
              title={`Research & Edit: ${label}`}
            >
              
              <Edit2 size={14} />
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

      {/* Combined Research & Edit Modal - 3 Sections on One Screen */}
      {showCombinedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                
                Research & Edit: {label}
                <span className="text-xl ml-1"></span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                3-step workflow: Search Google → Enter Data → Save Template
              </p>
            </div>

            {/* Modal Body - All 3 sections visible */}
            <div className="p-6 space-y-4">
              {/* SECTION 1: Google Search - GREEN (Safe, read-only) */}
              <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10">
                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                   Step 1: Research on Google
                </h4>

                <div className="space-y-2">
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
                          setShowCombinedModal(false);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Edit search query..."
                    />
                  </div>

                  <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>Town:</strong> {townName}, {countryName}
                    </div>
                    {range && (
                      <div className="text-gray-600 dark:text-gray-400">
                        <strong>Expected range:</strong> {typeof range === 'string' ? range : range.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* EXPECTED FORMAT - Help user know what to look for */}
                  {expectedFormat && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        
                        <div className="flex-1">
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">Expected: </span>
                          <span className="text-sm font-bold text-green-900 dark:text-green-200">{expectedFormat}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={executeSearch}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <span> Search Google</span>
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Opens in popup window. Leave this modal open to enter data after searching.
                  </p>
                </div>
              </div>

              {/* SECTION 2: Enter Data & Save to Database - YELLOW (Caution, modifying one town) */}
              <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-900/10">
                <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <span className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                   Step 2: Enter Data & Save to Database
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {label} Value
                    </label>
                    {renderModalInput()}
                    {range && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Valid range: {typeof range === 'string' ? range : range.join(', ')}
                      </p>
                    )}
                  </div>

                  {description && (
                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs text-gray-600 dark:text-gray-400">
                      <strong>Field description:</strong> {description}
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>Current value:</strong> {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-red-500 italic">(empty)</span>}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFromModal}
                    disabled={saveState === 'saving'}
                    className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    {saveState === 'saving' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveState === 'success' ? (
                      <>
                        <Check size={20} />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <span> Save to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 3: Template Management (only visible for executive admins) - RED (Danger, affects ALL towns) */}
              {isExecutiveAdmin && (
                <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/30 dark:bg-red-900/10">
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                     Step 3: Manage Query Template
                  </h4>

                  <div className="space-y-2">
                    {hasExistingTemplate ? (
                      <>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                          <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                            Template Preview:
                          </div>
                          <div className="font-mono text-xs text-red-800 dark:text-red-200 bg-white dark:bg-gray-900/50 p-2 rounded">
                            {(() => {
                              let preview = searchQuery
                                .replace(new RegExp(townName, 'gi'), '{town_name}')
                                .replace(new RegExp(countryName, 'gi'), '{country}');
                              if (subdivisionCode && subdivisionCode.trim()) {
                                preview = preview.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
                              }
                              return preview;
                            })()}
                          </div>
                        </div>

                        {/* EXPECTED FORMAT - Editable input */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            
                            <div className="flex-1">
                              <label className="text-xs font-medium text-red-700 dark:text-red-400 mb-1 block">
                                Expected Format (affects all 343+ towns):
                              </label>
                              <input
                                type="text"
                                value={expectedFormat}
                                onChange={(e) => {
                                  const newExpected = e.target.value;
                                  setExpectedFormat(newExpected);
                                  // Update query to include new expected format
                                  const baseQuery = searchQuery.replace(/\s*Expected:\s*.+?$/i, '').trim();
                                  if (newExpected.trim()) {
                                    setSearchQuery(`${baseQuery} Expected: ${newExpected}`);
                                  } else {
                                    setSearchQuery(baseQuery);
                                  }
                                }}
                                placeholder="e.g., Yes or No, 1-10, 0-100"
                                className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-gray-900 text-red-800 dark:text-red-200 font-semibold focus:ring-2 focus:ring-red-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleSaveTemplate}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                           Update Template
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                          <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                            Template Preview:
                          </div>
                          <div className="font-mono text-xs text-red-800 dark:text-red-200 bg-white dark:bg-gray-900/50 p-2 rounded">
                            {(() => {
                              let preview = searchQuery
                                .replace(new RegExp(townName, 'gi'), '{town_name}')
                                .replace(new RegExp(countryName, 'gi'), '{country}');
                              if (subdivisionCode && subdivisionCode.trim()) {
                                preview = preview.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
                              }
                              return preview;
                            })()}
                          </div>
                        </div>

                        {/* EXPECTED FORMAT - Editable input */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            
                            <div className="flex-1">
                              <label className="text-xs font-medium text-red-700 dark:text-red-400 mb-1 block">
                                Expected Format (affects all 343+ towns):
                              </label>
                              <input
                                type="text"
                                value={expectedFormat}
                                onChange={(e) => {
                                  const newExpected = e.target.value;
                                  setExpectedFormat(newExpected);
                                  // Update query to include new expected format
                                  const baseQuery = searchQuery.replace(/\s*Expected:\s*.+?$/i, '').trim();
                                  if (newExpected.trim()) {
                                    setSearchQuery(`${baseQuery} Expected: ${newExpected}`);
                                  } else {
                                    setSearchQuery(baseQuery);
                                  }
                                }}
                                placeholder="e.g., Yes or No, 1-10, 0-100"
                                className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-gray-900 text-red-800 dark:text-red-200 font-semibold focus:ring-2 focus:ring-red-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleSaveTemplate}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                           Save as Template for All Towns
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                     Workflow: Search → Copy value → Paste → Save{isExecutiveAdmin ? ' → Manage template' : ''}
                  </p>
                  <button
                    onClick={() => {
                      setShowCombinedModal(false);
                      setSaveState('idle');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Role limitation notice */}
                {!isExecutiveAdmin && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>👑 Executive Admin Feature:</strong> Query template management is only available to executive admins.
                      Contact your administrator to upgrade your role at <a href="/admin/paywall" className="underline hover:text-amber-800 dark:hover:text-amber-200">Admin → Paywall</a>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableDataField;
