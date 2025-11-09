import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';

const FieldDefinitionEditor = ({ 
  fieldName, 
  onClose 
}) => {
  const [searchTerms, setSearchTerms] = useState('');
  const [auditQuestion, setAuditQuestion] = useState('');
  const [verificationLevel, setVerificationLevel] = useState(3);
  const [verificationNote, setVerificationNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  // Determine what placeholders to show based on field
  const getSearchPattern = () => {
    // Country field should NOT use {country} placeholder (circular reference!)
    if (fieldName === 'country') {
      return ['town_name'];
    }
    // GPS coordinates don't need country
    if (fieldName === 'latitude' || fieldName === 'longitude') {
      return ['town_name'];
    }
    // Most other fields use town and country
    return ['town_name', 'country'];
  };
  
  useEffect(() => {
    loadFieldDefinition();
  }, [fieldName]);
  
  const loadFieldDefinition = async () => {
    try {
      // NEW: Fetch from field_search_templates table
      const { data, error } = await supabase
        .from('field_search_templates')
        .select('*')
        .eq('field_name', fieldName)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Extract just the search terms (remove placeholders)
        let terms = data.search_template || '';
        terms = terms
          .replace(/{town_name}/g, '')
          .replace(/{country}/g, '')
          .replace(/{region}/g, '')
          .trim();

        setSearchTerms(terms || '');
        setAuditQuestion(data.human_description || '');
        setVerificationLevel(3); // Default verification level
        setVerificationNote(''); // Not stored in new system
        setCurrentVersion(data.version); // Store version for optimistic locking
      }
    } catch (error) {
      console.error('Error loading field definition:', error);
      toast.error('Error loading field definition');
    } finally {
      setLoading(false);
    }
  };
  
  const saveFieldDefinition = async () => {
    setSaving(true);
    setConflictDetected(false);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Build search template with placeholders
      const searchTemplate = getSearchPattern().map(p => `{${p}}`).join(' ') + ' ' + searchTerms;

      // OPTIMISTIC LOCKING: Update only if version matches
      const { data, error: updateError } = await supabase
        .from('field_search_templates')
        .update({
          search_template: searchTemplate.trim(),
          expected_format: '', // Could be enhanced in future
          human_description: auditQuestion,
          status: 'active',
          updated_by: user?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('field_name', fieldName)
        .eq('version', currentVersion) // Only update if version hasn't changed
        .select();

      if (updateError) throw updateError;

      // Check if update was successful (no rows = version conflict)
      if (!data || data.length === 0) {
        // Conflict detected! Another admin saved this template first
        const { data: latestData } = await supabase
          .from('field_search_templates')
          .select('*')
          .eq('field_name', fieldName)
          .single();

        setConflictData(latestData);
        setConflictDetected(true);
        toast.error('⚠️ Conflict detected! Another admin just saved this template.');
        return;
      }

      toast.success(`✅ Updated "${fieldName}" template!`);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error saving field definition');
    } finally {
      setSaving(false);
    }
  };

  const handleForceOverwrite = async () => {
    setSaving(true);
    setConflictDetected(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const searchTemplate = getSearchPattern().map(p => `{${p}}`).join(' ') + ' ' + searchTerms;

      // Force update without version check
      const { error } = await supabase
        .from('field_search_templates')
        .update({
          search_template: searchTemplate.trim(),
          expected_format: '',
          human_description: auditQuestion,
          status: 'active',
          updated_by: user?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('field_name', fieldName);

      if (error) throw error;

      toast.success(`✅ Force-saved "${fieldName}" template!`);
      onClose();
    } catch (error) {
      console.error('Error force-saving:', error);
      toast.error('Failed to force-save field definition');
    } finally {
      setSaving(false);
    }
  };

  const handleReloadLatest = () => {
    setConflictDetected(false);
    loadFieldDefinition();
    toast('Reloaded latest version from database');
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-6">
          Loading...
        </div>
      </div>
    );
  }
  
  // Format field name for display
  const displayName = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Field: {displayName}
          </h2>
          <div className="w-full h-px bg-gray-300 mt-2"></div>
        </div>
        
        {/* Verification Level Indicator */}
        {verificationNote && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">
              {verificationNote}
            </div>
          </div>
        )}
        
        {/* Google Search Pattern */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Google Search Pattern:
          </label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-gray-500">
              {getSearchPattern().map(p => `[${p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}]`).join(' ')}
            </span>
            <input
              type="text"
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., elevation meters above sea level"
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            What additional search terms to add after town name and country
          </div>
        </div>
        
        {/* Audit Question */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Audit Question:
          </label>
          <textarea
            value={auditQuestion}
            onChange={(e) => setAuditQuestion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="e.g., What elevation range: 0-50m, 0-300m, 200-600m, 500-1000m, or >1000m?"
          />
          <div className="mt-1 text-xs text-gray-500">
            The specific question auditors should answer for this field
          </div>
        </div>
        
        {/* Example */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <span className="font-semibold">Example search for Athens, Greece:</span>
            <div className="mt-1 text-gray-700">
              "{fieldName === 'country' ? 'Athens' : 'Athens Greece'} {searchTerms || '...'}"
            </div>
          </div>
        </div>
        
        {/* Conflict Warning */}
        {conflictDetected && conflictData && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800 mb-2">Conflict Detected!</h4>
                <p className="text-sm text-red-700 mb-3">
                  Another admin just saved this template. Your version (v{currentVersion}) is outdated.
                </p>
                <div className="bg-white rounded p-3 mb-3 text-sm">
                  <div className="font-medium mb-1">Latest changes:</div>
                  <div className="text-gray-700">{conflictData.search_template}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Version {conflictData.version} • Last updated: {new Date(conflictData.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReloadLatest}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reload Latest
                  </button>
                  <button
                    onClick={handleForceOverwrite}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Force Overwrite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={saveFieldDefinition}
            disabled={saving || conflictDetected}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-4 text-xs text-orange-600 text-center">
          ⚠️ Changes affect ALL 343 towns
        </div>
      </div>
    </div>
  );
};

export default FieldDefinitionEditor;