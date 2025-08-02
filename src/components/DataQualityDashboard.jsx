import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function DataQualityDashboard() {
  const [dataQuality, setDataQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeDataQuality();
  }, []);

  const analyzeDataQuality = async () => {
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*');
    
    if (error) {
      console.error('Error fetching towns:', error);
      setLoading(false);
      return;
    }

    // Critical columns for matching
    const criticalColumns = [
      'cost_of_living_usd',
      'safety_score',
      'healthcare_score',
      'rent_1bed',
      'climate',
      'english_speaking_doctors',
      'public_transport_quality',
      'air_quality_index',
      'airport_distance',
      'humidity_average'
    ];

    // Calculate completeness for each column
    const columnStats = criticalColumns.map(col => {
      const filled = towns.filter(t => t[col] !== null && t[col] !== '').length;
      const percentage = Math.round((filled / towns.length) * 100);
      return {
        column: col.replace(/_/g, ' '),
        filled,
        missing: towns.length - filled,
        percentage,
        status: percentage === 100 ? 'complete' : percentage > 80 ? 'good' : percentage > 50 ? 'fair' : 'poor'
      };
    });

    // Overall stats
    const overallStats = {
      totalTowns: towns.length,
      townsWithPhotos: towns.filter(t => t.image_url_1).length,
      avgCompleteness: Math.round(columnStats.reduce((sum, stat) => sum + stat.percentage, 0) / columnStats.length),
      perfectTowns: towns.filter(t => 
        criticalColumns.every(col => t[col] !== null && t[col] !== '')
      ).length
    };

    setDataQuality({ columnStats, overallStats });
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading data quality metrics...</div>;
  if (!dataQuality) return <div className="p-4">Error loading data</div>;

  const { columnStats, overallStats } = dataQuality;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Data Quality Dashboard</h2>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-sm text-gray-600">Total Towns</div>
          <div className="text-2xl font-bold">{overallStats.totalTowns}</div>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <div className="text-sm text-gray-600">Towns with Photos</div>
          <div className="text-2xl font-bold">{overallStats.townsWithPhotos}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <div className="text-sm text-gray-600">Avg Completeness</div>
          <div className="text-2xl font-bold">{overallStats.avgCompleteness}%</div>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <div className="text-sm text-gray-600">Perfect Towns</div>
          <div className="text-2xl font-bold">{overallStats.perfectTowns}</div>
        </div>
      </div>

      {/* Column Completeness Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Critical Column Completeness</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={columnStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="column" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Column</th>
              <th className="text-right p-2">Filled</th>
              <th className="text-right p-2">Missing</th>
              <th className="text-right p-2">%</th>
              <th className="text-center p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {columnStats.map((stat, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{stat.column}</td>
                <td className="text-right p-2">{stat.filled}</td>
                <td className="text-right p-2">{stat.missing}</td>
                <td className="text-right p-2">{stat.percentage}%</td>
                <td className="text-center p-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    stat.status === 'complete' ? 'bg-green-100 text-green-800' :
                    stat.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    stat.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stat.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}