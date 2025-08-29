import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';

const HobbiesDisplay = ({ townId, townName }) => {
  const [hobbiesData, setHobbiesData] = useState({
    universal: { activities: [], interests: [], custom: [] },
    specific: { activities: [], interests: [], custom: [] },
    loading: true,
    error: null
  });

  useEffect(() => {
    loadHobbiesData();
  }, [townId]);

  const loadHobbiesData = async () => {
    try {
      setHobbiesData(prev => ({ ...prev, loading: true, error: null }));

      // Get all hobbies
      const { data: allHobbies, error: hobbiesError } = await supabase
        .from('hobbies')
        .select('*')
        .order('name');

      if (hobbiesError) throw hobbiesError;

      // Get town-specific hobbies
      const { data: townHobbies, error: townError } = await supabase
        .from('town_hobbies')  // TEMPORARY: Using existing table name until renamed in Supabase
        .select('hobby_id')
        .eq('town_id', townId);

      if (townError) throw townError;

      const townHobbyIds = new Set(townHobbies?.map(th => th.hobby_id) || []);

      // Categorize hobbies
      const universal = { activities: [], interests: [], custom: [] };
      const specific = { activities: [], interests: [], custom: [] };

      allHobbies.forEach(hobby => {
        const categoryKey = hobby.category === 'activity' ? 'activities' : 
                          hobby.category === 'interest' ? 'interests' : 'custom';
        
        if (hobby.is_universal) {
          universal[categoryKey].push(hobby);
        } else if (townHobbyIds.has(hobby.id)) {
          specific[categoryKey].push(hobby);
        }
      });

      setHobbiesData({
        universal,
        specific,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading hobbies:', error);
      setHobbiesData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  if (hobbiesData.loading) {
    return (
      <div className="text-gray-500 animate-pulse">
        Loading hobbies data...
      </div>
    );
  }

  if (hobbiesData.error) {
    return (
      <div className="text-red-600">
        Error loading hobbies: {hobbiesData.error}
      </div>
    );
  }

  const renderHobbyList = (hobbies, label, color = 'gray') => {
    if (hobbies.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          {label}
        </h5>
        <div className="flex flex-wrap gap-2">
          {hobbies.map(hobby => (
            <span
              key={hobby.id}
              className={`px-3 py-1 text-sm rounded-full bg-${color}-100 text-${color}-700 border border-${color}-200`}
              title={hobby.is_universal ? 'Available everywhere' : `Specific to ${townName}`}
            >
              {hobby.name}
              {hobby.is_universal && (
                <span className="ml-1 text-xs opacity-60">🌍</span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const totalUniversal = hobbiesData.universal.activities.length + 
                        hobbiesData.universal.interests.length + 
                        hobbiesData.universal.custom.length;
  
  const totalSpecific = hobbiesData.specific.activities.length + 
                       hobbiesData.specific.interests.length + 
                       hobbiesData.specific.custom.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-blue-700">Universal:</span>
            <span className="ml-2 text-blue-600">{totalUniversal} hobbies</span>
          </div>
          <div>
            <span className="font-semibold text-green-700">Location-Specific:</span>
            <span className="ml-2 text-green-600">{totalSpecific} hobbies</span>
          </div>
          <div>
            <span className="font-semibold text-purple-700">Total Available:</span>
            <span className="ml-2 text-purple-600">{totalUniversal + totalSpecific} hobbies</span>
          </div>
        </div>
      </div>

      {/* Universal Hobbies */}
      <div className="border-l-4 border-blue-400 pl-4">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">🌍</span>
          Universal Hobbies
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Available in all locations)
          </span>
        </h4>
        
        {renderHobbyList(hobbiesData.universal.activities, 'Activities', 'blue')}
        {renderHobbyList(hobbiesData.universal.interests, 'Interests', 'indigo')}
        {renderHobbyList(hobbiesData.universal.custom, 'Custom Hobbies', 'purple')}
        
        {totalUniversal === 0 && (
          <p className="text-gray-400 italic">No universal hobbies defined</p>
        )}
      </div>

      {/* Location-Specific Hobbies */}
      <div className="border-l-4 border-green-400 pl-4">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📍</span>
          Location-Specific Hobbies
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Unique to {townName})
          </span>
        </h4>
        
        {renderHobbyList(hobbiesData.specific.activities, 'Activities', 'green')}
        {renderHobbyList(hobbiesData.specific.interests, 'Interests', 'emerald')}
        {renderHobbyList(hobbiesData.specific.custom, 'Custom Hobbies', 'teal')}
        
        {totalSpecific === 0 && (
          <p className="text-gray-400 italic">
            No location-specific hobbies for this town
          </p>
        )}
      </div>

      {/* Comparison Helper */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h5 className="font-semibold text-gray-700 mb-2">
          How to Compare with User Preferences:
        </h5>
        <ul className="space-y-1 text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Universal hobbies (🌍) are available everywhere - always match if user selects them</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Location-specific hobbies (📍) are unique attractions - bonus points for matching</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Higher match score when user's hobbies align with location-specific offerings</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HobbiesDisplay;