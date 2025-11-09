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
      // NEW: Fetch from field_search_templates table
      const { data, error } = await supabase
        .from('field_search_templates')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      // Build definitions object keyed by field_name
      const definitions = {};
      data?.forEach(template => {
        definitions[template.field_name] = {
          search_template: template.search_template,
          expected_format: template.expected_format,
          audit_question: template.human_description,
          search_query: template.search_template,
          search_terms: template.field_name
        };
      });

      setFieldDefinitions(definitions);
    } catch (error) {
      console.error('Error fetching field definitions:', error);
      setFieldDefinitions({});
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
        .replace('{town_name}', townData.town_name || '[Town]')
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
        .replace('{town_name}', townData.town_name || '')
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