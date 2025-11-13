import { useState, useRef, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { Check, X, Loader2, Edit2, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { researchFieldWithContext, hasAnthropicAPIKey } from '../utils/aiResearch';

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
 * @param {string} confidence - Audit confidence: 'unknown' | 'low' | 'limited' | 'high' | 'not_editable'
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
  isExecutiveAdmin = false,
  confidence = 'unknown'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expectedFormat, setExpectedFormat] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [hasExistingTemplate, setHasExistingTemplate] = useState(false);

  // AI Research state - REFACTORED for structured results
  const [aiResearching, setAiResearching] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Step 1 choice tracking
  const [chosenValue, setChosenValue] = useState(null);
  const [chosenSource, setChosenSource] = useState(null); // 'research' | 'pattern' | 'current' | 'custom' | 'merged' | 'not_found'
  const [chosenConfidence, setChosenConfidence] = useState(null);
  const [factSummary, setFactSummary] = useState(null);

  // Merge preview state
  const [showMergePreview, setShowMergePreview] = useState(false);
  const [mergedValue, setMergedValue] = useState(null);

  // Step 2 audit status (REQUIRED before save)
  const [selectedAuditStatus, setSelectedAuditStatus] = useState(null);

  // Template section collapse state (persisted in localStorage)
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(() => {
    const saved = localStorage.getItem('editableField_templateExpanded');
    return saved === 'true'; // Default: collapsed (false)
  });

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

  // Load templates from database (replaced localStorage)
  const [dbTemplates, setDbTemplates] = useState({});
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // Load all templates on component mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data, error } = await supabase
          .from('field_search_templates')
          .select('field_name, search_template, expected_format, human_description')
          .eq('status', 'active');

        if (error) {
          console.error('Error loading templates:', error);
          return;
        }

        // Convert array to object for easy lookup
        const templatesMap = {};
        data?.forEach(t => {
          templatesMap[t.field_name] = t;
        });
        setDbTemplates(templatesMap);
        setTemplatesLoaded(true);
      } catch (err) {
        console.error('Error loading templates:', err);
      }
    }

    if (!templatesLoaded) {
      loadTemplates();
    }
  }, [templatesLoaded]);

  // Update editValue when value prop changes
  useEffect(() => {
    // Convert arrays to comma-separated strings for editing
    if (type === 'array' && Array.isArray(value)) {
      setEditValue(value.join(', '));
    } else {
      setEditValue(value);
    }
  }, [value, type]);

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
    } else if (type === 'array') {
      // Convert comma-separated string to PostgreSQL array
      if (typeof editValue === 'string' && editValue.trim()) {
        valueToSave = editValue.split(',').map(v => v.trim()).filter(v => v);
      } else if (Array.isArray(editValue)) {
        valueToSave = editValue; // Already an array
      } else {
        valueToSave = null; // Empty array = null
      }
    }

    setSaveState('saving');

    try {
      // Build update object with user tracking
      const updateData = { [field]: valueToSave };

      // AUTO-TRACK: Add current user as last modifier
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          updateData.updated_by = user.id;
        }
      } catch (error) {
        console.warn('Could not get current user for tracking:', error);
      }

      const { data, error } = await supabase
        .from('towns')
        .update(updateData)
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

    // Location format: "Town, Subdivision, Country" (with subdivision for disambiguation)
    // Critical: Many towns have duplicate names (e.g., 3+ Springfields in USA)
    // Smart deduplication: Skip subdivision if it's the same as town name (e.g., "Abu Dhabi, Abu Dhabi")
    const location = subdivisionCode && subdivisionCode.toLowerCase() !== townName.toLowerCase()
      ? `${townName}, ${subdivisionCode}, ${countryName}`
      : `${townName}, ${countryName}`;

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
    // Description fields - special handling for better research queries
    else if (field === 'description') {
      query = `What makes ${location} special? What is it known for? Write a brief 2-3 sentence description.`;
    }
    else if (field === 'verbose_description') {
      query = `Tell me about ${location}. What are the key features, attractions, and characteristics that define this place?`;
    }
    else if (field === 'summary') {
      query = `Summarize the key highlights of ${location} - what should people know about living here?`;
    }
    else if (field === 'appealStatement' || labelLower.includes('appeal')) {
      query = `What makes ${location} appealing for retirees? What are the main selling points?`;
    }
    else if (labelLower.includes('description')) {
      query = `Describe ${location} - what are the key features and characteristics?`;
    }
    // Climate/Safety description fields
    else if (field.includes('_description')) {
      const category = field.replace('_description', '').replace('_', ' ');
      query = `Describe the ${category} in ${location}`;
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
    // PRIORITY 2: Database template (from field_search_templates table)
    else {
      const dbTemplate = dbTemplates[field];
      if (dbTemplate) {
        // Reconstruct full query with expected format
        const baseQuery = dbTemplate.search_template
          .replace(/\{town_name\}/g, townName)
          .replace(/\{town\}/g, townName)
          .replace(/\{subdivision\}/g, subdivisionCode || '')
          .replace(/\{subdivision_code\}/g, subdivisionCode || '')
          .replace(/\{state\}/g, subdivisionCode || '')
          .replace(/\{region\}/g, subdivisionCode || '')
          .replace(/\{country\}/g, countryName);

        // Add expected format to query
        suggestedQuery = dbTemplate.expected_format
          ? `${baseQuery} Expected: ${dbTemplate.expected_format}`
          : baseQuery;
        hasTemplate = true;
      }
      // PRIORITY 3: Auto-generated query with expected format
      else {
        const baseQuery = generateSmartQuery();
        // Add expected format to the query with CRITICAL character limits for text fields
        let defaultExpected;

        if (type === 'boolean') {
          defaultExpected = 'Yes or No';
        } else if (type === 'number' && range) {
          defaultExpected = range;
        } else if (field === 'description') {
          // UI breaks if description exceeds ~750 characters
          defaultExpected = '750 characters max';
        } else if (field === 'verbose_description') {
          defaultExpected = '2000 characters max';
        } else if (field === 'summary') {
          defaultExpected = '300 characters max';
        } else if (field === 'appealStatement') {
          defaultExpected = '500 characters max';
        } else if (field.includes('_description')) {
          defaultExpected = '500 characters max';
        } else if (type === 'text' || type === 'string') {
          defaultExpected = '300 characters max';
        } else {
          defaultExpected = 'Appropriate value';
        }

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

  // AI-assisted research handler
  const handleAIResearch = async () => {
    if (!hasAnthropicAPIKey()) {
      toast.error('Anthropic API key not configured. Check .env file.');
      return;
    }

    setAiResearching(true);
    setAiRecommendation(null);

    try {
      // Build townData object matching function signature
      const townData = {
        town_name: townName,
        country: countryName,
        state_code: subdivisionCode,
        [field]: editValue || null
      };

      // Call with correct positional parameters: (townId, fieldName, townData, options)
      const result = await researchFieldWithContext(
        townId,
        field,
        townData,
        {
          searchQuery,
          expectedFormat,
          currentValue: editValue || ''
        }
      );

      if (result.error) {
        toast.error(`AI Research failed: ${result.error}`);
      } else {
        // Store structured AI research result
        setAiRecommendation(result);
        setFactSummary(result.factSummary || null);
        toast.success('Research complete!');
      }
    } catch (error) {
      console.error('AI research error:', error);
      toast.error('AI research failed. Try Google search instead.');
    } finally {
      setAiResearching(false);
    }
  };

  // Step 1 Action Handlers - User chooses value source
  const handleKeepCurrentValue = () => {
    setChosenValue(value);
    setChosenSource('current');
    setChosenConfidence('unknown'); // Current DB value has unknown confidence
    setEditValue(value);
    toast.success('Using current database value');
  };

  const handleUseResearchedValue = () => {
    if (!aiRecommendation?.suggestedValue) {
      toast.error('No researched value available');
      return;
    }
    setChosenValue(aiRecommendation.suggestedValue);
    setChosenSource(aiRecommendation.source || 'research');
    setChosenConfidence(aiRecommendation.confidence || 'limited');
    setEditValue(aiRecommendation.suggestedValue);
    toast.success(`Using researched value (${aiRecommendation.confidence} confidence)`);
  };

  const handleEnterCustomValue = () => {
    setChosenValue(null); // User will type it
    setChosenSource('custom');
    setChosenConfidence('unknown'); // Custom entry needs audit
    setEditValue('');
    toast.success('Enter your custom value below');
  };

  const handleMergeValues = () => {
    if (!aiRecommendation?.suggestedValue) {
      toast.error('No researched value to merge');
      return;
    }

    // Smart merge logic based on field type
    let merged;
    const currentVal = value?.toString().trim() || '';
    const aiVal = aiRecommendation.suggestedValue?.toString().trim() || '';

    if (type === 'array' || currentVal.includes(',') || aiVal.includes(',')) {
      // Multi-value field - merge and deduplicate
      const currentItems = currentVal ? currentVal.split(',').map(v => v.trim()).filter(Boolean) : [];
      const aiItems = aiVal ? aiVal.split(',').map(v => v.trim()).filter(Boolean) : [];

      // Combine and deduplicate (case-insensitive)
      const allItems = [...currentItems];
      aiItems.forEach(item => {
        const itemLower = item.toLowerCase();
        if (!allItems.some(existing => existing.toLowerCase() === itemLower)) {
          allItems.push(item);
        }
      });

      merged = allItems.join(', ');
    } else {
      // Single value - concatenate with separator
      if (currentVal && aiVal && currentVal.toLowerCase() !== aiVal.toLowerCase()) {
        merged = `${currentVal} / ${aiVal}`;
      } else {
        merged = aiVal || currentVal;
      }
    }

    setMergedValue(merged);
    setShowMergePreview(true);
    setEditValue(merged);
    toast.success('Values merged - review and edit if needed');
  };

  const handleApproveMerge = () => {
    setChosenValue(editValue);
    setChosenSource('merged');
    setChosenConfidence(aiRecommendation?.confidence || 'limited');
    setShowMergePreview(false);
    toast.success('Merged value approved');
  };

  const handleCancelMerge = () => {
    setShowMergePreview(false);
    setMergedValue(null);
    setEditValue(value);
    toast('Merge cancelled');
  };

  // Toggle template management section visibility
  const toggleTemplateSection = () => {
    const newState = !isTemplateExpanded;
    setIsTemplateExpanded(newState);
    localStorage.setItem('editableField_templateExpanded', String(newState));
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
    // STEP 2 REQUIREMENT: Audit status must be selected
    if (!selectedAuditStatus) {
      toast.error('Please select an audit status before saving');
      return;
    }

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
    } else if (type === 'array') {
      // Convert comma-separated string to PostgreSQL array
      if (typeof editValue === 'string' && editValue.trim()) {
        valueToSave = editValue.split(',').map(v => v.trim()).filter(v => v);
      } else if (Array.isArray(editValue)) {
        valueToSave = editValue; // Already an array
      } else {
        valueToSave = null; // Empty array = null
      }
    }

    setSaveState('saving');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch current audit_data to preserve other fields
      const { data: currentTown, error: fetchError } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', townId)
        .single();

      if (fetchError) throw fetchError;

      const currentAuditData = currentTown?.audit_data || {};

      // Build update object with value + audit_data
      const updateData = {
        [field]: valueToSave,
        audit_data: {
          ...currentAuditData,
          [field]: {
            status: selectedAuditStatus,
            source: chosenSource || 'custom', // Track where value came from
            audited_at: new Date().toISOString(),
            audited_by: user?.email || 'unknown'
          }
        }
      };

      const { data, error } = await supabase
        .from('towns')
        .update(updateData)
        .eq('id', townId)
        .select();

      if (error) throw error;

      setSaveState('success');
      toast.success(`${label} updated with ${selectedAuditStatus} confidence!`);

      // Call onUpdate callback to reload audit results
      if (onUpdate) {
        onUpdate(field, valueToSave);
      }

      // Close modal after brief success indicator
      setTimeout(() => {
        setShowCombinedModal(false);
        setSaveState('idle');
        // Reset Step 1 and Step 2 state
        setChosenValue(null);
        setChosenSource(null);
        setChosenConfidence(null);
        setSelectedAuditStatus(null);
        setAiRecommendation(null);
        setFactSummary(null);
      }, 1500);

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save templates');
        return;
      }

      // Replace actual values with placeholders
      // Template must be UNIVERSAL - always include {subdivision} even if current town doesn't use it
      let template = searchQuery;

      // First, replace town and country
      template = template
        .replace(new RegExp(townName, 'gi'), '{town_name}')
        .replace(new RegExp(countryName, 'gi'), '{country}');

      // Then replace subdivision if it exists and is different from town name
      if (subdivisionCode && subdivisionCode.trim() && subdivisionCode.toLowerCase() !== townName.toLowerCase()) {
        template = template.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
      }

      // UNIVERSAL TEMPLATE: Ensure {subdivision} is always present between town and country
      // Pattern: "{town_name}, {country}" should become "{town_name}, {subdivision}, {country}"
      if (!template.includes('{subdivision}')) {
        template = template.replace(/\{town_name\},\s*\{country\}/gi, '{town_name}, {subdivision}, {country}');
      }

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

      // Parse current description to preserve human-readable part
      const parsedDescription = parseDescriptionForSearch(description);
      const humanPart = parsedDescription?.humanDescription || description || `Field: ${field}`;

      // Save directly to field_search_templates table
      const { error } = await supabase
        .from('field_search_templates')
        .upsert({
          field_name: field,
          search_template: cleanTemplate,
          expected_format: finalExpectedFormat,
          human_description: humanPart,
          status: 'active',
          updated_by: user.id
        }, {
          onConflict: 'field_name'
        });

      if (error) {
        console.error('Error saving template:', error);
        toast.error(`Failed to save template: ${error.message}`);
        return;
      }

      // Update local state to reflect new template
      setDbTemplates(prev => ({
        ...prev,
        [field]: {
          field_name: field,
          search_template: cleanTemplate,
          expected_format: finalExpectedFormat,
          human_description: humanPart
        }
      }));

      setHasExistingTemplate(true);
      toast.success(`Template saved to database! All 343+ towns will use this search query for "${label}".`);

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

    if (type === 'array') {
      // Display PostgreSQL arrays as comma-separated
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    }

    return String(value);
  };

  // Get confidence indicator color
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500'; // 🟢 High confidence
      case 'limited':
        return 'bg-yellow-500'; // 🟡 Limited confidence
      case 'low':
        return 'bg-red-500'; // 🔴 Low confidence
      case 'critical':
        return 'bg-orange-500'; // ⚡ CRITICAL - Editable with system-wide impact
      case 'not_editable':
        return 'bg-black'; // ⚫ Non-editable
      case 'unknown':
      default:
        return 'bg-gray-300'; // ⚪ Unknown
    }
  };

  // Get tooltip text for confidence levels
  const getConfidenceTooltip = () => {
    switch (confidence) {
      case 'high':
        return '🟢 High confidence - Safe to edit';
      case 'limited':
        return '🟡 Limited confidence - Edit with caution';
      case 'low':
        return '🔴 Low confidence - Needs verification';
      case 'critical':
        return '⚡ CRITICAL - Editable but has system-wide impact!';
      case 'not_editable':
        return '⚫ Non-editable system field';
      case 'unknown':
      default:
        return '⚪ Unknown - Not audited yet';
    }
  };

  return (
    <div className="space-y-2" data-field={field}>
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
          <div className="flex items-center gap-2">
            {/* Combined Research & Edit button */}
            <button
              onClick={handleOpenCombinedModal}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-0.5"
              title={`Research & Edit: ${label}`}
            >

              <Edit2 size={14} />
            </button>
            {/* Audit Confidence Indicator - Made MORE VISIBLE */}
            <div className="group/tooltip relative inline-block">
              {confidence === 'critical' ? (
                <div className="w-6 h-6 flex items-center justify-center cursor-help">
                  <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                  </svg>
                </div>
              ) : confidence === 'unknown' ? (
                <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 cursor-help border-2 border-gray-400 dark:border-gray-500" title="Not yet audited" />
              ) : (
                <div
                  className={`w-4 h-4 rounded-full ${getConfidenceColor()} cursor-help border-2 border-white dark:border-gray-800 shadow-sm`}
                  title={`Audit: ${confidence}`}
                  onClick={() => console.log(`Field: ${field}, Confidence: ${confidence}`)}
                />
              )}
              <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                {getConfidenceTooltip()}
              </div>
            </div>
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
                {/* Database Info Tooltip */}
                <div className="group relative inline-block ml-1">
                  <Info size={16} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-help transition-colors" />
                  <div className="hidden group-hover:block absolute left-0 top-6 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10">
                    <div className="font-semibold">Database Info:</div>
                    <div className="mt-0.5">Table: <span className="text-blue-300">towns</span></div>
                    <div>Column: <span className="text-green-300">{field}</span></div>
                  </div>
                </div>
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
                  <span>Step 1: Research on Google</span>
                  {/* Database Info Tooltip for Research */}
                  <div className="group/research relative inline-block">
                    <Info size={14} className="text-green-500 hover:text-green-700 dark:hover:text-green-300 cursor-help transition-colors" />
                    <div className="hidden group-hover/research:block absolute left-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10">
                      <div className="font-semibold">AI Research Process:</div>
                      <div className="mt-0.5">1. Query templates from: <span className="text-blue-300">field_search_templates</span></div>
                      <div>2. Learn patterns from: <span className="text-blue-300">towns</span> table</div>
                      <div>3. Claude AI researches via: <span className="text-purple-300">Anthropic API</span></div>
                      <div className="text-green-300 mt-1">✓ Read-only, no data changes</div>
                    </div>
                  </div>
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Query <span className="text-gray-500">(editable)</span>
                    </label>
                    <textarea
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowCombinedModal(false);
                        }
                      }}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
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

                  {/* Two research buttons side-by-side */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Claude AI Research Button */}
                    <button
                      onClick={handleAIResearch}
                      disabled={aiResearching}
                      className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-md"
                    >
                      {aiResearching ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">Researching...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          <span className="text-sm">Research</span>
                        </>
                      )}
                    </button>

                    {/* Google Search Button */}
                    <button
                      onClick={executeSearch}
                      className="px-4 py-3 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-sm">Research</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Claude AI learns from your database. Google opens in popup window.
                  </p>

                  {/* STRUCTURED RESEARCH RESULTS - FACT-FIRST */}
                  {aiRecommendation && (
                    <div className="mt-3 space-y-3">
                      {/* External Fact Summary */}
                      {factSummary && (
                        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10">
                          <h5 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                            📚 External Fact Summary
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {factSummary}
                          </p>
                        </div>
                      )}

                      {/* AI Interpretation */}
                      <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-sm font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                            <Sparkles size={16} />
                            AI Interpretation for this Field
                          </h5>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              aiRecommendation.source === 'research'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : aiRecommendation.source === 'pattern'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }`}>
                              {aiRecommendation.source === 'research' ? '🔍 Research' :
                               aiRecommendation.source === 'pattern' ? '📊 Pattern' : '❓ Not Found'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              aiRecommendation.confidence === 'high'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : aiRecommendation.confidence === 'limited'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {aiRecommendation.confidence === 'high' ? '🟢 High' :
                               aiRecommendation.confidence === 'limited' ? '🟡 Limited' : '🔴 Low'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900/50 border border-green-200 dark:border-green-700 rounded p-3 mb-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Proposed {label}:</div>
                          <div className="text-sm font-bold text-green-900 dark:text-green-100 mb-2">
                            {aiRecommendation.suggestedValue || '(null)'}
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                            <strong>Notes:</strong> {aiRecommendation.reasoning}
                          </div>
                          {value && value.toString().trim() && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                              <strong>Original DB value:</strong> {value}
                            </div>
                          )}
                        </div>

                        {/* Four Explicit Action Buttons */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Choose value source:
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={handleKeepCurrentValue}
                              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-between"
                            >
                              <span>Keep current database value</span>
                              <span className="text-xs text-gray-500">({value || 'empty'})</span>
                            </button>
                            <button
                              onClick={handleUseResearchedValue}
                              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <Check size={16} />
                              Use researched value ({aiRecommendation.confidence} confidence)
                            </button>
                            <button
                              onClick={handleMergeValues}
                              disabled={!value || !value.toString().trim()}
                              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                              title={!value ? 'No current value to merge' : 'Combine AI research with current value'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              Merge AI & current value
                            </button>
                            <button
                              onClick={handleEnterCustomValue}
                              className="px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                            >
                              Enter a custom value
                            </button>
                          </div>
                        </div>

                        {/* Merge Preview - shown after clicking "Merge" */}
                        {showMergePreview && (
                          <div className="mt-4 p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <h6 className="text-sm font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              Merged Result Preview
                            </h6>
                            <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                              Review the merged value below. Edit if needed, then approve or cancel.
                            </p>

                            {/* Show merged value breakdown */}
                            <div className="bg-white dark:bg-gray-900 rounded p-3 mb-3 text-xs">
                              <div className="text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Original:</strong> {value || '(empty)'}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 mb-2">
                                <strong>AI Research:</strong> {aiRecommendation?.suggestedValue}
                              </div>
                              <div className="text-purple-700 dark:text-purple-300 font-semibold">
                                <strong>Merged:</strong> {editValue}
                              </div>
                            </div>

                            {/* Editable merged value */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-purple-900 dark:text-purple-200 mb-1">
                                Edit merged value if needed:
                              </label>
                              {renderModalInput()}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={handleCancelMerge}
                                className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  // Just keep editing - don't close preview
                                  toast.success('Continue editing - click Approve when ready');
                                }}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <Edit2 size={14} />
                                Keep Editing
                              </button>
                              <button
                                onClick={handleApproveMerge}
                                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <Check size={14} />
                                Approve Merge
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Approve Value + Audit Status - YELLOW (Human approval gate) */}
              <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-900/10">
                <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <span className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Step 2: Approve Value & Set Audit Status</span>
                  {/* Database Info Tooltip for Save */}
                  <div className="group/save relative inline-block">
                    <Info size={14} className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 cursor-help transition-colors" />
                    <div className="hidden group-hover/save:block absolute left-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10">
                      <div className="font-semibold">Database Info:</div>
                      <div className="mt-0.5">Table: <span className="text-blue-300">towns</span></div>
                      <div>Columns: <span className="text-green-300">{field}, audit_data</span></div>
                      <div className="text-yellow-300 mt-1">⚠️ Saves value + audit status together</div>
                    </div>
                  </div>
                </h4>

                <div className="space-y-3">
                  {/* Origin Chip - Show where value came from */}
                  {chosenSource && (
                    <div className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      chosenSource === 'research' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      chosenSource === 'pattern' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' :
                      chosenSource === 'merged' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                      chosenSource === 'current' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                    }`}>
                      <span className="font-semibold">Source:</span>
                      <span>
                        {chosenSource === 'research' ? '🔍 From research' :
                         chosenSource === 'pattern' ? '📊 From pattern' :
                         chosenSource === 'merged' ? '🔄 Merged AI + DB' :
                         chosenSource === 'current' ? '💾 Current DB value' :
                         '✏️ Custom entry'}
                      </span>
                      {chosenConfidence && chosenConfidence !== 'unknown' && (
                        <span className="text-xs">
                          ({chosenConfidence} confidence)
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Final {label} Value <span className="text-xs text-gray-500">(editable)</span>
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

                  {/* Critical warning for town_name field */}
                  {field === 'town_name' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 text-xl flex-shrink-0">⚠️</span>
                        <div className="text-sm">
                          <div className="font-bold text-red-800 dark:text-red-300 mb-2">
                            CRITICAL FIELD WARNING
                          </div>
                          <ul className="space-y-1 text-red-700 dark:text-red-400 text-xs">
                            <li>• Changing the town name will <strong>NOT</strong> update descriptions, summaries, or other verbose fields that reference the old name</li>
                            <li>• User preferences and search history will still reference the old name</li>
                            <li>• This change affects all users who interact with this town</li>
                            <li>• Consider marking the town as unmaintainable instead if data quality is poor</li>
                          </ul>
                          <div className="mt-2 text-xs font-semibold text-red-900 dark:text-red-200">
                            Only proceed if you are correcting a spelling error or critical data issue.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AUDIT STATUS SECTION - REQUIRED BEFORE SAVE */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                    <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Audit Status (required)
                    </label>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                      Pick a quality rating for this value:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'high', color: 'bg-green-500', label: '🟢 High', desc: 'Verified - safe to use' },
                        { value: 'limited', color: 'bg-yellow-500', label: '🟡 Limited', desc: 'Inferred - use caution' },
                        { value: 'low', color: 'bg-red-500', label: '🔴 Low', desc: 'Needs verification' },
                        { value: 'critical', color: 'bg-orange-500', label: '⚡ Critical', desc: 'System-wide impact' },
                        { value: 'unknown', color: 'bg-gray-400', label: '⚪ Unknown', desc: 'Not yet audited' }
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedAuditStatus(status.value)}
                          className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition-all flex items-center gap-2 ${
                            selectedAuditStatus === status.value
                              ? `${status.color} ring-4 ring-blue-300 dark:ring-blue-600`
                              : `${status.color} opacity-60 hover:opacity-100`
                          }`}
                          title={status.desc}
                        >
                          <div className="w-3 h-3 rounded-full bg-white/30" />
                          <div className="text-left flex-1">
                            <div>{status.label}</div>
                            <div className="text-xs opacity-75">{status.desc}</div>
                          </div>
                          {selectedAuditStatus === status.value && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFromModal}
                    disabled={saveState === 'saving' || !selectedAuditStatus}
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
                        <span>Save to Database</span>
                        {!selectedAuditStatus && <span className="text-xs opacity-75">(select audit status first)</span>}
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* SECTION 3: Template Management (only visible for executive admins) - RED (Danger, affects ALL towns) */}
              {isExecutiveAdmin && (
                <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/30 dark:bg-red-900/10">
                  <button
                    onClick={toggleTemplateSection}
                    className="w-full text-left text-sm font-bold text-red-800 dark:text-red-300 mb-3 flex items-center justify-between gap-2 hover:text-red-900 dark:hover:text-red-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                      <span>Step 3: Manage Query Template</span>
                      {/* Database Info Tooltip for Templates */}
                      <div className="group/template relative inline-block">
                        <Info size={14} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-help transition-colors" />
                        <div className="hidden group-hover/template:block absolute left-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10">
                          <div className="font-semibold">Database Info:</div>
                          <div className="mt-0.5">Table: <span className="text-blue-300">field_search_templates</span></div>
                          <div>Columns: <span className="text-green-300">field_name, search_query, expected_format</span></div>
                        </div>
                      </div>
                      <span className="text-xs font-normal text-red-600 dark:text-red-400">(Admin Only)</span>
                    </div>
                    {isTemplateExpanded ? (
                      <ChevronUp size={20} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    ) : (
                      <ChevronDown size={20} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    )}
                  </button>

                  {isTemplateExpanded && (
                    <div className="space-y-2">
                    {hasExistingTemplate ? (
                      <>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                          <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                            Template Preview:
                          </div>
                          <div className="font-mono text-xs text-red-800 dark:text-red-200 bg-white dark:bg-gray-900/50 p-2 rounded">
                            {(() => {
                              let preview = searchQuery;
                              // Replace town and country first
                              preview = preview
                                .replace(new RegExp(townName, 'gi'), '{town_name}')
                                .replace(new RegExp(countryName, 'gi'), '{country}');
                              // Replace subdivision if present and different
                              if (subdivisionCode && subdivisionCode.trim() && subdivisionCode.toLowerCase() !== townName.toLowerCase()) {
                                preview = preview.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
                              }
                              // UNIVERSAL: Always show {subdivision} in template
                              if (!preview.includes('{subdivision}')) {
                                preview = preview.replace(/\{town_name\},\s*\{country\}/gi, '{town_name}, {subdivision}, {country}');
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
                              let preview = searchQuery;
                              // Replace town and country first
                              preview = preview
                                .replace(new RegExp(townName, 'gi'), '{town_name}')
                                .replace(new RegExp(countryName, 'gi'), '{country}');
                              // Replace subdivision if present and different
                              if (subdivisionCode && subdivisionCode.trim() && subdivisionCode.toLowerCase() !== townName.toLowerCase()) {
                                preview = preview.replace(new RegExp(subdivisionCode, 'gi'), '{subdivision}');
                              }
                              // UNIVERSAL: Always show {subdivision} in template
                              if (!preview.includes('{subdivision}')) {
                                preview = preview.replace(/\{town_name\},\s*\{country\}/gi, '{town_name}, {subdivision}, {country}');
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
                  )}
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
