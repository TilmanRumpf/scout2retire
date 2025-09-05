/**
 * HOBBY VERIFICATION AUDIT REPORT
 * 
 * Shows current state of hobby verification classification
 * Identifies what still needs to be done
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function generateAuditReport() {
  console.log('🔍 HOBBY VERIFICATION AUDIT REPORT');
  console.log('=' .repeat(60));
  console.log(`Generated: ${new Date().toISOString()}\n`);
  
  // Fetch all hobbies
  const { data: hobbies, error } = await supabase
    .from('hobbies')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('❌ Error fetching hobbies:', error);
    return;
  }
  
  // Categorize by verification status
  const stats = {
    total: hobbies.length,
    universal: 0,
    classified: 0,
    unclassified: 0,
    byMethod: {}
  };
  
  const classified = [];
  const unclassified = [];
  const needsReview = [];
  
  hobbies.forEach(hobby => {
    if (hobby.is_universal) {
      stats.universal++;
    }
    
    if (hobby.required_conditions?.verification) {
      stats.classified++;
      classified.push(hobby);
      
      const method = hobby.required_conditions.verification.method;
      stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;
      
      // Check if review is old (>30 days)
      if (hobby.required_conditions.verification.reviewed_at) {
        const reviewDate = new Date(hobby.required_conditions.verification.reviewed_at);
        const daysSince = (Date.now() - reviewDate) / (1000 * 60 * 60 * 24);
        if (daysSince > 30) {
          needsReview.push({ ...hobby, daysSince: Math.round(daysSince) });
        }
      }
    } else {
      stats.unclassified++;
      unclassified.push(hobby);
    }
  });
  
  // Print summary statistics
  console.log('📊 SUMMARY STATISTICS:');
  console.log(`Total Hobbies: ${stats.total}`);
  console.log(`Universal (no verification needed): ${stats.universal}`);
  console.log(`Classified: ${stats.classified}`);
  console.log(`Unclassified: ${stats.unclassified}`);
  console.log(`Progress: ${((stats.classified / stats.total) * 100).toFixed(1)}%\n`);
  
  // Print verification method breakdown
  console.log('🎯 VERIFICATION METHODS ASSIGNED:');
  Object.entries(stats.byMethod).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} hobbies`);
  });
  
  // Print unclassified hobbies
  if (unclassified.length > 0) {
    console.log('\n❌ UNCLASSIFIED HOBBIES (need verification):');
    console.log('Priority order by category:\n');
    
    const byCategory = {};
    unclassified.forEach(h => {
      if (!byCategory[h.category]) byCategory[h.category] = [];
      byCategory[h.category].push(h.name);
    });
    
    Object.entries(byCategory).forEach(([category, names]) => {
      console.log(`  ${category.toUpperCase()} (${names.length}):`);
      names.slice(0, 10).forEach(name => {
        console.log(`    - ${name}`);
      });
      if (names.length > 10) {
        console.log(`    ... and ${names.length - 10} more`);
      }
    });
  }
  
  // Print hobbies needing review
  if (needsReview.length > 0) {
    console.log('\n⚠️  NEEDS REVIEW (>30 days old):');
    needsReview.slice(0, 10).forEach(h => {
      console.log(`  - ${h.name} (${h.daysSince} days old)`);
    });
    if (needsReview.length > 10) {
      console.log(`  ... and ${needsReview.length - 10} more`);
    }
  }
  
  // Print sample of classified hobbies
  if (classified.length > 0) {
    console.log('\n✅ SAMPLE CLASSIFIED HOBBIES:');
    
    // Group by method
    const samplesByMethod = {};
    classified.forEach(h => {
      const method = h.required_conditions.verification.method;
      if (!samplesByMethod[method]) samplesByMethod[method] = [];
      samplesByMethod[method].push(h);
    });
    
    Object.entries(samplesByMethod).forEach(([method, hobbies]) => {
      console.log(`\n  ${method.toUpperCase()}:`);
      hobbies.slice(0, 3).forEach(h => {
        console.log(`    - ${h.name}`);
        if (h.required_conditions.verification.query) {
          console.log(`      Query: ${h.required_conditions.verification.query}`);
        }
        if (h.required_conditions.verification.notes) {
          console.log(`      Notes: ${h.required_conditions.verification.notes}`);
        }
      });
    });
  }
  
  // Data quality checks
  console.log('\n🔍 DATA QUALITY CHECKS:');
  
  // Check for conflicting data
  const conflicts = hobbies.filter(h => 
    h.is_universal === true && 
    h.required_conditions?.needs?.length > 0
  );
  
  if (conflicts.length > 0) {
    console.log(`⚠️  Conflicts found: ${conflicts.length} universal hobbies have conditions`);
    conflicts.forEach(h => {
      console.log(`  - ${h.name}: marked universal but needs ${JSON.stringify(h.required_conditions.needs)}`);
    });
  } else {
    console.log('✅ No conflicts between universal flag and conditions');
  }
  
  // Check for missing categories
  const missingCategory = hobbies.filter(h => !h.category);
  if (missingCategory.length > 0) {
    console.log(`⚠️  ${missingCategory.length} hobbies missing category`);
  } else {
    console.log('✅ All hobbies have categories');
  }
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (stats.unclassified > 0) {
    console.log(`1. Run hobby-verification-classifier.js to classify ${stats.unclassified} remaining hobbies`);
    console.log(`   Suggested batch size: 10-20 at a time for quality control`);
  }
  
  if (needsReview.length > 0) {
    console.log(`2. Review ${needsReview.length} hobbies with outdated verification`);
  }
  
  if (conflicts.length > 0) {
    console.log(`3. Resolve ${conflicts.length} conflicts between universal flag and conditions`);
  }
  
  console.log('\n✨ Audit complete!');
  
  // Export to JSON for further analysis
  const report = {
    generated: new Date().toISOString(),
    statistics: stats,
    unclassified: unclassified.map(h => ({ name: h.name, category: h.category })),
    needsReview: needsReview.map(h => ({ name: h.name, daysSince: h.daysSince })),
    conflicts: conflicts.map(h => ({ name: h.name, conditions: h.required_conditions?.needs }))
  };
  
  return report;
}

// Run the audit
generateAuditReport()
  .then(report => {
    if (report) {
      console.log('\n💾 Full report available in JSON format');
      // Optionally save to file
      // fs.writeFileSync('hobby-verification-audit.json', JSON.stringify(report, null, 2));
    }
  })
  .catch(console.error);