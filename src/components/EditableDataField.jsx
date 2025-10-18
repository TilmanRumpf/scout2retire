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
  type = 'string',
  range,
  description,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error
  const inputRef = useRef(null);

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

        {/* Edit button (only show when not editing) */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit field"
          >
            <Edit2 size={16} />
          </button>
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
    </div>
  );
};

export default EditableDataField;
