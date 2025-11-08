import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

// Hook to fetch and use field definitions
export function useFieldDefinitions() {
  const [fieldDefinitions, setFieldDefinitions] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFieldDefinitions();
  }, []);
  
  const fetchFieldDefinitions = async () => {
    // DISABLED: Config row doesn't exist in database yet
    // This feature is not currently in use - returning empty definitions
    // to prevent 406 HTTP errors in console
    setFieldDefinitions({});
    setLoading(false);

    // TODO: If field definitions are needed, create the config row:
    // INSERT INTO towns (id, audit_data) VALUES
    // ('ffffffff-ffff-ffff-ffff-ffffffffffff', '{"field_definitions": {}}');
  };
  
  // Get audit question for a field, replacing placeholders
  const getAuditQuestion = (fieldName, townData) => {
    const def = fieldDefinitions[fieldName];
    if (!def?.audit_question) return null;
    
    let question = def.audit_question;
    if (townData) {
      question = question
        .replace('{town_name}', townData.name || '[Town]')
        .replace('{country}', townData.country || '[Country]')
        .replace('{region}', townData.region || '[Region]');
    }
    return question;
  };
  
  // Get search query for a field, replacing placeholders
  const getSearchQuery = (fieldName, townData) => {
    const def = fieldDefinitions[fieldName];
    if (!def?.search_query) return null;
    
    let query = def.search_query;
    if (townData) {
      query = query
        .replace('{town_name}', townData.name || '')
        .replace('{country}', townData.country || '')
        .replace('{region}', townData.region || '');
    }
    return query;
  };
  
  // Get field definition
  const getFieldDefinition = (fieldName) => {
    return fieldDefinitions[fieldName] || null;
  };
  
  return {
    fieldDefinitions,
    loading,
    getAuditQuestion,
    getSearchQuery,
    getFieldDefinition,
    refreshDefinitions: fetchFieldDefinitions
  };
}