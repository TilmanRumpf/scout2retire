import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function TownComparison({ towns }) {
  if (!towns || towns.length < 2) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Select at least 2 towns to compare</p>
      </div>
    );
  }

  // Prepare comparison data
  const categories = [
    { key: 'cost_of_living_usd', label: 'Cost', invert: true, max: 5000 },
    { key: 'safety_score', label: 'Safety', invert: false, max: 10 },
    { key: 'healthcare_score', label: 'Healthcare', invert: false, max: 10 },
    { key: 'air_quality_index', label: 'Air Quality', invert: true, max: 150 },
    { key: 'walkability', label: 'Walkability', invert: false, max: 10 },
    { key: 'expat_rating', label: 'Expat Life', invert: false, max: 5 }
  ];

  const radarData = categories.map(cat => {
    const dataPoint = { category: cat.label };
    
    towns.forEach((town, index) => {
      let value = town[cat.key] || 0;
      
      // Normalize to 0-100 scale
      if (cat.invert) {
        // Lower is better (cost, air quality)
        value = Math.max(0, 100 - (value / cat.max * 100));
      } else {
        // Higher is better
        value = (value / cat.max * 100);
      }
      
      dataPoint[`town${index}`] = Math.round(value);
    });
    
    return dataPoint;
  });

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Town Comparison</h3>
      
      {/* Town Names */}
      <div className="flex gap-4 mb-6">
        {towns.map((town, i) => (
          <div key={town.id} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: colors[i] }}
            />
            <span className="font-medium">{town.name}, {town.country}</span>
          </div>
        ))}
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          {towns.map((town, i) => (
            <Radar
              key={town.id}
              name={town.name}
              dataKey={`town${i}`}
              stroke={colors[i]}
              fill={colors[i]}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>

      {/* Detailed Comparison Table */}
      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Metric</th>
              {towns.map(town => (
                <th key={town.id} className="text-right p-2">{town.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Monthly Cost</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  ${town.typical_monthly_living_cost || 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">1BR Rent</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  ${town.rent_1bed || 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">Healthcare</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.healthcare_score}/10
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">Safety</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.safety_score}/10
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">Climate</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.climate || 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">English Doctors</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.english_speaking_doctors ? '✅' : '❌'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">Airport Distance</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.airport_distance}km
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2">Tax Rate</td>
              {towns.map(town => (
                <td key={town.id} className="text-right p-2">
                  {town.income_tax_rate_pct}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}