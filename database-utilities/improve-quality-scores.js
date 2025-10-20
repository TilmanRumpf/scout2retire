/**
 * Improve quality_of_life scoring granularity
 * Current issue: 97% of towns are scored 8 or 9
 * Solution: Add decimal precision based on other quality indicators
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function improveQualityScores() {
  console.log('🎯 Improving quality_of_life score granularity...\n');

  try {
    // First, get all towns with their relevant quality indicators
    const { data: towns, error } = await supabase
      .from('towns')
      .select(`
        id,
        name,
        quality_of_life,
        cost_index,
        cost_of_living_usd,
        healthcare_score,
        healthcare_cost,
        safety_score,
        nightlife_rating,
        museums_rating,
        restaurants_rating,
        cultural_rating,
        outdoor_rating,
        internet_speed,
        public_transport_quality,
        air_quality_index,
        cultural_events_rating,
        shopping_rating,
        wellness_rating,
        government_efficiency_rating,
        political_stability_rating,
        data_completeness_score
      `)
      .order('quality_of_life', { ascending: false });

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Processing ${towns.length} towns...\n`);

    // Group towns by current quality_of_life score
    const scoreGroups = {};
    towns.forEach(town => {
      const score = town.quality_of_life || 0;
      if (!scoreGroups[score]) {
        scoreGroups[score] = [];
      }
      scoreGroups[score].push(town);
    });

    // Show current distribution
    console.log('Current distribution:');
    Object.entries(scoreGroups).forEach(([score, townsList]) => {
      console.log(`  Score ${score}: ${townsList.length} towns (${(townsList.length / towns.length * 100).toFixed(1)}%)`);
    });
    console.log('');

    // Calculate refined scores for each town
    const updates = [];

    towns.forEach(town => {
      const baseScore = town.quality_of_life || 7;
      let adjustment = 0;

      // Add micro-adjustments based on various factors (max ±0.9 to stay within same integer bracket)

      // Cost of living (inverse - lower is better)
      if (town.cost_index) {
        if (town.cost_index < 40) adjustment += 0.15;
        else if (town.cost_index < 60) adjustment += 0.10;
        else if (town.cost_index < 80) adjustment += 0.05;
        else if (town.cost_index > 120) adjustment -= 0.10;
        else if (town.cost_index > 100) adjustment -= 0.05;
      }

      // Cost in USD (alternative metric)
      if (town.cost_of_living_usd && !town.cost_index) {
        if (town.cost_of_living_usd < 1500) adjustment += 0.10;
        else if (town.cost_of_living_usd < 2500) adjustment += 0.05;
        else if (town.cost_of_living_usd > 4000) adjustment -= 0.10;
        else if (town.cost_of_living_usd > 3500) adjustment -= 0.05;
      }

      // Healthcare score
      if (town.healthcare_score) {
        if (town.healthcare_score >= 9) adjustment += 0.15;
        else if (town.healthcare_score >= 8) adjustment += 0.10;
        else if (town.healthcare_score >= 7) adjustment += 0.05;
        else if (town.healthcare_score < 6) adjustment -= 0.10;
      }

      // Safety score
      if (town.safety_score) {
        if (town.safety_score >= 9) adjustment += 0.10;
        else if (town.safety_score >= 8) adjustment += 0.05;
        else if (town.safety_score < 6) adjustment -= 0.10;
      }

      // Cultural ratings
      if (town.cultural_rating) {
        if (town.cultural_rating >= 9) adjustment += 0.10;
        else if (town.cultural_rating >= 8) adjustment += 0.05;
        else if (town.cultural_rating < 5) adjustment -= 0.05;
      }

      // Museums and culture
      if (town.museums_rating) {
        if (town.museums_rating >= 9) adjustment += 0.05;
        else if (town.museums_rating >= 8) adjustment += 0.02;
      }

      // Outdoor activities
      if (town.outdoor_rating) {
        if (town.outdoor_rating >= 9) adjustment += 0.10;
        else if (town.outdoor_rating >= 8) adjustment += 0.05;
      }

      // Public transport quality
      if (town.public_transport_quality) {
        if (town.public_transport_quality >= 9) adjustment += 0.10;
        else if (town.public_transport_quality >= 8) adjustment += 0.05;
        else if (town.public_transport_quality < 5) adjustment -= 0.05;
      }

      // Internet speed (important for modern retirees)
      if (town.internet_speed) {
        if (town.internet_speed >= 100) adjustment += 0.05;
        else if (town.internet_speed >= 50) adjustment += 0.02;
        else if (town.internet_speed < 25) adjustment -= 0.10;
      }

      // Air quality (inverse - lower is better)
      if (town.air_quality_index) {
        if (town.air_quality_index <= 50) adjustment += 0.10;
        else if (town.air_quality_index <= 100) adjustment += 0.05;
        else if (town.air_quality_index > 150) adjustment -= 0.10;
      }

      // Government efficiency and political stability
      if (town.government_efficiency_rating) {
        if (town.government_efficiency_rating >= 8) adjustment += 0.05;
        else if (town.government_efficiency_rating < 5) adjustment -= 0.05;
      }

      if (town.political_stability_rating) {
        if (town.political_stability_rating >= 8) adjustment += 0.05;
        else if (town.political_stability_rating < 5) adjustment -= 0.05;
      }

      // Data completeness (well-documented towns might be better researched)
      if (town.data_completeness_score) {
        if (town.data_completeness_score >= 90) adjustment += 0.02;
        else if (town.data_completeness_score < 50) adjustment -= 0.02;
      }

      // Cap adjustment to stay within reasonable bounds
      adjustment = Math.max(-0.9, Math.min(0.9, adjustment));

      // Calculate new score (keeping it within 1-10 range)
      let newScore = baseScore + adjustment;
      newScore = Math.max(1, Math.min(10, newScore));

      // Round to 1 decimal place
      newScore = Math.round(newScore * 10) / 10;

      // Only update if score changed
      if (newScore !== baseScore) {
        updates.push({
          id: town.id,
          name: town.name,
          oldScore: baseScore,
          newScore: newScore,
          change: (newScore - baseScore).toFixed(1)
        });
      }
    });

    console.log(`\n📊 Prepared ${updates.length} score updates\n`);

    // Show sample of changes
    console.log('Sample of changes:');
    updates.slice(0, 10).forEach(update => {
      console.log(`  ${update.name}: ${update.oldScore} → ${update.newScore} (${update.change > 0 ? '+' : ''}${update.change})`);
    });

    // Apply updates in batches
    console.log('\n🔄 Applying updates...');

    for (let i = 0; i < updates.length; i += 50) {
      const batch = updates.slice(i, i + 50);

      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ quality_of_life: update.newScore })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating ${update.name}:`, updateError);
        }
      }

      console.log(`  Processed ${Math.min(i + 50, updates.length)} / ${updates.length}`);
    }

    // Verify new distribution
    const { data: verifyData, error: verifyError } = await supabase
      .from('towns')
      .select('quality_of_life');

    if (!verifyError && verifyData) {
      const newDistribution = {};
      verifyData.forEach(town => {
        const score = town.quality_of_life;
        const bucket = Math.floor(score);
        if (!newDistribution[bucket]) {
          newDistribution[bucket] = 0;
        }
        newDistribution[bucket]++;
      });

      console.log('\n✅ New distribution:');
      Object.entries(newDistribution).sort(([a], [b]) => b - a).forEach(([score, count]) => {
        console.log(`  Score ${score}.x: ${count} towns (${(count / verifyData.length * 100).toFixed(1)}%)`);
      });
    }

    console.log('\n✅ Quality score granularity improved successfully!');
    console.log('Towns now have decimal precision based on multiple quality factors.');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

improveQualityScores();