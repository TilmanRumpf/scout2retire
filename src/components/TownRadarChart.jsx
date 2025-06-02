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

  // Helper to calculate infrastructure rating (average of sub-ratings)
  const getInfrastructureRating = () => {
    const ratings = [
      townData.public_transport_quality,
      townData.walkability,
      townData.infrastructure_rating
    ].filter(r => r !== null && r !== undefined);
    
    if (ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return Math.round(avg);
    }
    return 5; // Default if no data
  };

  // Helper to calculate overall rating (average of all categories)
  const getOverallRating = () => {
    const ratings = [
      townData.climate_rating || 5,
      getCostRating(townData.cost_index),
      townData.healthcare_score || 5,
      getLifestyleRating(),
      townData.safety_score || 5,
      getInfrastructureRating()
    ];
    
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round(avg);
  };

  // Prepare data for the radar chart
  const data = [
    {
      category: 'Overall',
      value: getOverallRating(),
      fullMark: 10
    },
    {
      category: 'Climate',
      value: townData.climate_rating || 5,
      fullMark: 10
    },
    {
      category: 'Cost of Living',
      value: getCostRating(townData.cost_index),
      fullMark: 10
    },
    {
      category: 'Healthcare',
      value: townData.healthcare_score || 5,
      fullMark: 10
    },
    {
      category: 'Lifestyle',
      value: getLifestyleRating(),
      fullMark: 10
    },
    {
      category: 'Safety',
      value: townData.safety_score || 5,
      fullMark: 10
    },
    {
      category: 'Infrastructure',
      value: getInfrastructureRating(),
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