import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function TownRadarChart({ townData }) {
  // Helper to calculate cost rating (inverse relationship)
  const getCostRating = (costIndex) => {
    if (!costIndex) return 5;
    // $1000 = 10/10, $5000 = 1/10
    const rating = Math.max(1, Math.min(10, 11 - (costIndex / 500)));
    return Math.round(rating);
  };

  // Helper to calculate lifestyle rating (average of sub-ratings)
  const getLifestyleRating = () => {
    const ratings = [
      townData.nightlife_rating,
      townData.restaurants_rating,
      townData.cultural_rating,
      townData.outdoor_rating,
      townData.quality_of_life
    ].filter(r => r !== null && r !== undefined);
    
    if (ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return Math.round(avg);
    }
    return 5; // Default if no data
  };



  // Convert percentage scores to 1-10 scale
  const convertScore = (percentage) => {
    if (!percentage && percentage !== 0) return 5; // Default middle value
    return Math.round(percentage / 10); // Convert 0-100 to 0-10
  };

  // Prepare data for the radar chart using the 6 accepted categories
  const data = [
    {
      category: 'Region',
      value: townData.categoryScores?.region ? convertScore(townData.categoryScores.region) : 7,
      fullMark: 10
    },
    {
      category: 'Climate',
      value: townData.categoryScores?.climate ? convertScore(townData.categoryScores.climate) : (townData.climate_rating || 5),
      fullMark: 10
    },
    {
      category: 'Culture',
      value: townData.categoryScores?.culture ? convertScore(townData.categoryScores.culture) : getLifestyleRating(),
      fullMark: 10
    },
    {
      category: 'Hobbies',
      value: townData.categoryScores?.hobbies ? convertScore(townData.categoryScores.hobbies) : 5,
      fullMark: 10
    },
    {
      category: 'Admin',
      value: townData.categoryScores?.administration ? convertScore(townData.categoryScores.administration) : Math.round((townData.healthcare_score || 5) + (townData.safety_score || 5)) / 2,
      fullMark: 10
    },
    {
      category: 'Costs',
      value: townData.categoryScores?.cost ? convertScore(townData.categoryScores.cost) : getCostRating(townData.cost_index),
      fullMark: 10
    }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid 
          gridType="polygon" 
          radialLines={true}
          stroke="#e5e7eb"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fontSize: 10 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 10]} 
          tickCount={6}
          tick={{ fontSize: 10 }}
          className="text-gray-500 dark:text-gray-500"
        />
        <Radar 
          name={townData.name} 
          dataKey="value" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}