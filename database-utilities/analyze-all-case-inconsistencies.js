#!/usr/bin/env node

// COMPREHENSIVE CASE INCONSISTENCY ANALYZER FOR TOWNS TABLE
// Mission: Find ALL columns with uppercase data that need normalization

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// EXCLUDED COLUMNS - DO NOT NORMALIZE THESE
const EXCLUDED_COLUMNS = [
  'id', 
  'name', 
  'state_code', 
  'country', 
  'primary_language', 
  'secondary_languages', 
  'languages_spoken'
];

async function analyzeAllColumns() {
  console.log('🔍 COMPREHENSIVE CASE INCONSISTENCY ANALYSIS');
  console.log('=' .repeat(80));
  console.log('Excluding:', EXCLUDED_COLUMNS.join(', '));
  console.log('=' .repeat(80) + '\n');

  const results = [];
  
  try {
    // First get all data from towns table
    console.log('📊 Fetching all towns data...');
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching towns:', error);
      return;
    }
    
    console.log(`✅ Fetched ${towns.length} towns\n`);
    
    // Get all columns from first row
    const allColumns = Object.keys(towns[0] || {});
    const columnsToAnalyze = allColumns.filter(col => !EXCLUDED_COLUMNS.includes(col));
    
    console.log(`📋 Total columns: ${allColumns.length}`);
    console.log(`🔍 Columns to analyze: ${columnsToAnalyze.length}\n`);
    
    // Analyze each column
    for (const column of columnsToAnalyze) {
      const columnData = {
        column: column,
        hasUppercase: false,
        uppercaseCount: 0,
        totalNonNull: 0,
        samples: [],
        patterns: new Set()
      };
      
      // Check each town for this column
      for (const town of towns) {
        const value = town[column];
        
        // Skip null/undefined values
        if (value === null || value === undefined) continue;
        
        columnData.totalNonNull++;
        
        // Convert to string for analysis
        const strValue = String(value);
        
        // Check for uppercase letters
        if (/[A-Z]/.test(strValue)) {
          columnData.hasUppercase = true;
          columnData.uppercaseCount++;
          
          // Collect samples (first 5)
          if (columnData.samples.length < 5) {
            columnData.samples.push({
              town: town.name,
              value: strValue
            });
          }
          
          // Track patterns
          columnData.patterns.add(strValue);
        }
      }
      
      // Only add to results if column has uppercase data
      if (columnData.hasUppercase) {
        results.push(columnData);
      }
    }
    
    // Display results
    console.log('🚨 COLUMNS WITH UPPERCASE DATA (NEED NORMALIZATION)');
    console.log('=' .repeat(80));
    
    for (const result of results) {
      console.log(`\n📌 ${result.column}`);
      console.log(`   Records with uppercase: ${result.uppercaseCount}/${result.totalNonNull}`);
      console.log(`   Unique patterns: ${result.patterns.size}`);
      
      if (result.samples.length > 0) {
        console.log('   Sample values:');
        result.samples.forEach(s => {
          console.log(`     - ${s.town}: "${s.value}"`);
        });
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(80));
    console.log('📊 SUMMARY');
    console.log(`Total columns analyzed: ${columnsToAnalyze.length}`);
    console.log(`Columns with uppercase data: ${results.length}`);
    console.log('\n🔴 COLUMNS REQUIRING LOWERCASE NORMALIZATION:');
    results.forEach(r => {
      console.log(`  - ${r.column} (${r.uppercaseCount} records)`);
    });
    
    // Export for documentation
    const exportData = {
      timestamp: new Date().toISOString(),
      excludedColumns: EXCLUDED_COLUMNS,
      analyzedColumns: columnsToAnalyze.length,
      columnsWithUppercase: results.map(r => ({
        column: r.column,
        affectedRecords: r.uppercaseCount,
        totalRecords: r.totalNonNull,
        percentageAffected: ((r.uppercaseCount / r.totalNonNull) * 100).toFixed(2) + '%'
      }))
    };
    
    console.log('\n📝 Exporting results to JSON...');
    require('fs').writeFileSync(
      'database-utilities/case-analysis-results.json',
      JSON.stringify(exportData, null, 2)
    );
    console.log('✅ Results exported to case-analysis-results.json');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
analyzeAllColumns();