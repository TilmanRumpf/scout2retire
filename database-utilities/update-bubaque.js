#!/usr/bin/env node

// DATABASE HELPER UTILITY - BUBAQUE DATA ENRICHMENT
// Comprehensive update of Bubaque with researched data

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateBubaque() {
  console.log('🔧 UPDATING BUBAQUE WITH COMPREHENSIVE DATA');
  console.log('='.repeat(80));

  // Comprehensive data update based on research
  const updates = {
    // BASIC INFORMATION
    description: 'Bubaque is the most populated island in the Bijagós Archipelago, a UNESCO Biosphere Reserve off the coast of Guinea-Bissau. Known for pristine beaches, lush tropical vegetation, and vibrant Bijago culture, it serves as the administrative capital of the archipelago. The island offers an authentic West African island experience with fishing villages, mangrove forests, and world-class beaches like Bruce Beach.',

    population: 6427, // 2009 census - island population

    primary_language: 'Portuguese',

    // CLIMATE (completing existing data)
    climate: 'tropical',
    climate_description: 'Tropical climate with warm temperatures year-round (26-27°C average). High rainfall (1539mm annually) concentrated in wet season (May-October). Best time to visit is the dry season from November to April, with December and January being the coolest months.',

    humidity_level_actual: 'humid', // Tropical island
    seasonal_variation_actual: 'moderate', // Distinct wet/dry seasons

    // GEOGRAPHIC FEATURES
    geographic_features_actual: ['coastal', 'island', 'beaches', 'mangroves', 'archipelago'],
    vegetation_type_actual: ['tropical', 'palm trees', 'mangroves', 'rainforest'],
    water_bodies: ['Atlantic Ocean', 'Bijagós Archipelago'],

    elevation_meters: '10', // Low-lying island
    distance_to_ocean_km: '0', // It IS on the ocean

    // BEACHES & COASTAL
    beaches_nearby: true,

    // COST OF LIVING (Guinea-Bissau averages + island premium)
    cost_of_living_usd: 900, // Monthly for individual
    typical_monthly_living_cost: 900,
    rent_1bed: 250, // Slightly higher than mainland due to scarcity
    meal_cost: 5,
    groceries_cost: 300,
    utilities_cost: 50,

    // LIFESTYLE
    pace_of_life_actual: 'relaxed', // Valid: slow, relaxed, moderate, fast
    social_atmosphere: 'friendly',
    urban_rural_character: 'rural',
    traditional_progressive_lean: 'traditional',

    // COMMUNITY
    expat_community_size: 'small',
    retirement_community_presence: 'none',
    english_proficiency_level: 'low',

    // SAFETY
    safety_score: 7, // Generally safe but basic infrastructure
    safety_description: 'Safe and peaceful island with low crime rates. Main concerns are related to basic infrastructure, healthcare access, and transportation reliability rather than security threats.',

    // HEALTHCARE
    healthcare_score: 3, // Limited facilities
    healthcare_description: 'Very limited healthcare facilities on the island. Small local clinic for basic needs. Serious medical issues require evacuation to Bissau (4-hour ferry) or beyond. Not suitable for retirees with significant health needs.',
    hospital_count: 0, // No hospital, only clinic
    nearest_major_hospital_km: '60', // Bissau via ferry
    english_speaking_doctors: false,

    // INFRASTRUCTURE
    internet_speed: 5, // Mbps - very limited
    public_transport_quality: 1, // Minimal
    walkability: 6, // Small island, walkable but limited infrastructure
    airport_distance: '1', // Has local airstrip
    nearest_airport: 'Bubaque Airport (BQE)',

    // TRANSPORTATION
    has_uber: false,
    has_public_transit: false,
    requires_car: false, // Small island, boat/bicycle more common

    // ACTIVITIES
    activities_available: [
      'fishing',
      'beach activities',
      'snorkeling',
      'diving',
      'kayaking',
      'island hopping',
      'bird watching',
      'cultural tours',
      'cycling',
      'boating',
      'wildlife viewing',
      'hiking'
    ],

    interests_supported: [
      'nature',
      'beaches',
      'fishing',
      'wildlife',
      'culture',
      'adventure',
      'relaxation',
      'water sports',
      'eco-tourism',
      'photography'
    ],

    // RATINGS
    outdoor_activities_rating: 9, // Excellent for nature/beach
    cultural_events_rating: 5, // Limited but authentic
    quality_of_life: 6, // Beautiful but very basic

    // SPECIAL FEATURES
    environmental_factors: {
      unesco_biosphere_reserve: true,
      unesco_world_heritage: true,
      pristine_nature: true,
      tropical_island: true
    },

    // Update metadata
    last_ai_update: new Date().toISOString(),
    needs_update: false
  };

  console.log('📝 Updating fields:', Object.keys(updates).length);
  console.log('');

  // Perform the update
  const { data, error } = await supabase
    .from('towns')
    .update(updates)
    .eq('name', 'Bubaque')
    .eq('country', 'Guinea-Bissau')
    .select();

  if (error) {
    console.error('❌ Update failed:', error);
    return;
  }

  console.log('✅ Successfully updated Bubaque!');
  console.log('');
  console.log('📊 UPDATED FIELDS:');
  console.log('='.repeat(80));
  console.log('Basic Info: description, population, primary_language');
  console.log('Climate: climate, climate_description, humidity_level_actual, seasonal_variation_actual');
  console.log('Geography: geographic_features_actual, vegetation_type_actual, water_bodies, elevation');
  console.log('Cost: cost_of_living_usd, rent_1bed, groceries, meals, utilities');
  console.log('Lifestyle: pace_of_life, social_atmosphere, urban_rural_character');
  console.log('Community: expat_community_size, retirement_community_presence, english_proficiency');
  console.log('Healthcare: healthcare_score, healthcare_description, hospital_count');
  console.log('Infrastructure: internet_speed, walkability, airport_distance');
  console.log('Activities: 12 activities, 10 interests');
  console.log('Ratings: outdoor_activities, cultural_events, quality_of_life');
  console.log('');
  console.log('='.repeat(80));
  console.log('🎉 Bubaque is now comprehensively populated!');
  console.log('');
  console.log('🔍 Next: View in Admin UI at http://localhost:5173/admin/towns-manager');
  console.log('   Search for "Bubaque" to see all the new data!');
}

updateBubaque().catch(console.error);
