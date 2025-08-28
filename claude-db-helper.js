#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - COMPREHENSIVE USER DATA INVESTIGATION
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance
// Modified to investigate ALL user data for tobiasrumpf@gmx.de

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function runQueries() {
  console.log('🔍 COMPREHENSIVE PREFERENCE VALUES ANALYSIS - ALL USERS');
  console.log('=' .repeat(80));
  console.log('Analyzing all unique values stored in preference fields across ALL users');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Get ALL user preferences to analyze unique values
    console.log('Fetching ALL user preferences...');
    
    const { data: allPreferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*');

    if (prefsError) {
      console.error('❌ Error fetching preferences:', prefsError.message);
      return;
    }

    if (!allPreferences || allPreferences.length === 0) {
      console.log('❌ No user preferences found in database');
      return;
    }

    console.log(`✅ Found ${allPreferences.length} user preference records\n`);

    // Define the critical fields to analyze
    const criticalFields = [
      'sunshine', 'precipitation', 'humidity_level',
      'summer_climate_preference', 'winter_climate_preference',
      'geographic_features', 'vegetation_types',
      'activities', 'interests',
      'expat_community_preference',
      'urban_rural', 'pace_of_life',
      'healthcare_quality', 'safety_importance'
    ];

    // Function to extract unique values from array fields
    function extractUniqueValues(fieldName, allRecords) {
      const valueCounts = new Map();
      
      allRecords.forEach(record => {
        const fieldValue = record[fieldName];
        if (!fieldValue) return; // Skip null/undefined/empty
        
        if (Array.isArray(fieldValue)) {
          // For array fields, count each individual value
          fieldValue.forEach(value => {
            if (value && value !== '') {
              const count = valueCounts.get(value) || 0;
              valueCounts.set(value, count + 1);
            }
          });
        } else if (typeof fieldValue === 'object') {
          // For object fields like urban_rural from lifestyle_preferences
          if (fieldName === 'urban_rural' && fieldValue.urban_rural) {
            fieldValue.urban_rural.forEach(value => {
              if (value && value !== '') {
                const count = valueCounts.get(value) || 0;
                valueCounts.set(value, count + 1);
              }
            });
          } else if (fieldName === 'pace_of_life' && fieldValue.pace_of_life) {
            fieldValue.pace_of_life.forEach(value => {
              if (value && value !== '') {
                const count = valueCounts.get(value) || 0;
                valueCounts.set(value, count + 1);
              }
            });
          }
        } else {
          // For single values
          if (fieldValue !== '') {
            const count = valueCounts.get(fieldValue) || 0;
            valueCounts.set(fieldValue, count + 1);
          }
        }
      });
      
      // Convert to sorted array
      return Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([value, count]) => ({ value, count }));
    }

    // Special handling for nested object fields
    function extractFromLifestylePreferences(fieldName, allRecords) {
      const valueCounts = new Map();
      
      allRecords.forEach(record => {
        const lifestylePrefs = record.lifestyle_preferences;
        if (!lifestylePrefs || typeof lifestylePrefs !== 'object') return;
        
        const fieldValue = lifestylePrefs[fieldName];
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach(value => {
            if (value && value !== '') {
              const count = valueCounts.get(value) || 0;
              valueCounts.set(value, count + 1);
            }
          });
        }
      });
      
      return Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count }));
    }

    console.log('='.repeat(80));
    console.log('📊 UNIQUE VALUES ANALYSIS FOR CRITICAL PREFERENCE FIELDS');
    console.log('='.repeat(80));

    // Analyze each critical field
    criticalFields.forEach(fieldName => {
      console.log(`\n🔍 ${fieldName.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      let uniqueValues;
      if (fieldName === 'urban_rural' || fieldName === 'pace_of_life') {
        uniqueValues = extractFromLifestylePreferences(fieldName, allPreferences);
      } else {
        uniqueValues = extractUniqueValues(fieldName, allPreferences);
      }
      
      if (uniqueValues.length === 0) {
        console.log('❌ No values found for this field');
      } else {
        uniqueValues.forEach(({ value, count }) => {
          console.log(`  "${value}" → ${count} users`);
        });
        console.log(`Total unique values: ${uniqueValues.length}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(80));
    console.log('\nThis analysis shows ALL unique values currently stored in the database.');
    console.log('Compare these against your UI dropdown options to identify:');
    console.log('• Values that should be standardized (case sensitivity issues)');
    console.log('• Deprecated values that need migration');
    console.log('• Missing validation in the UI');
    console.log('• Data quality issues requiring cleanup');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Preference values analysis completed!');
}

// Run the queries
runQueries().catch(console.error);