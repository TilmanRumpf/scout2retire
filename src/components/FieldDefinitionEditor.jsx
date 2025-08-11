import { useState, useEffect } from 'react';
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
      const { data, error } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
        .single();
      
      if (error) throw error;
      
      if (data?.audit_data?.field_definitions?.[fieldName]) {
        const fieldDef = data.audit_data.field_definitions[fieldName];
        // Extract just the search terms (remove placeholders)
        let terms = fieldDef.search_query || '';
        terms = terms
          .replace(/{town_name}/g, '')
          .replace(/{country}/g, '')
          .replace(/{region}/g, '')
          .trim();
        
        setSearchTerms(fieldDef.search_terms || terms || '');
        setAuditQuestion(fieldDef.audit_question || '');
        setVerificationLevel(fieldDef.verification_level || 3);
        setVerificationNote(fieldDef.verification_note || '');
      }
    } catch (error) {
      console.error('Error loading field definition:', error);
      alert('Error loading field definition');
    } finally {
      setLoading(false);
    }
  };
  
  const saveFieldDefinition = async () => {
    setSaving(true);
    try {
      // Get current data
      const { data: currentData, error: fetchError } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update the field definition
      const updatedFieldDefinitions = {
        ...currentData.audit_data.field_definitions,
        [fieldName]: {
          ...currentData.audit_data.field_definitions[fieldName],
          search_terms: searchTerms,
          search_query: getSearchPattern().map(p => `{${p}}`).join(' ') + ' ' + searchTerms,
          audit_question: auditQuestion,
          verification_level: verificationLevel,
          verification_note: verificationNote
        }
      };
      
      // Save back to database
      const { error: updateError } = await supabase
        .from('towns')
        .update({
          audit_data: {
            ...currentData.audit_data,
            field_definitions: updatedFieldDefinitions
          }
        })
        .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
      
      if (updateError) throw updateError;
      
      alert(`✅ Updated "${fieldName}" for ALL towns!`);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving field definition');
    } finally {
      setSaving(false);
    }
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
            disabled={saving}
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