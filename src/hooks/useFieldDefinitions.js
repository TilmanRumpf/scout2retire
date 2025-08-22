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
    try {
      // Fetch the system config row that contains field definitions
      const { data, error } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
        .single();
      
      if (error) throw error;
      
      if (data?.audit_data?.field_definitions) {
        setFieldDefinitions(data.audit_data.field_definitions);
      }
    } catch (error) {
      console.error('Error fetching field definitions:', error);
    } finally {
      setLoading(false);
    }
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