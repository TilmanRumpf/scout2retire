import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';
import { checkAdminAccess } from '../../utils/paywallUtils';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const HobbiesDisplay = ({ townId, townName }) => {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);
  const [hobbiesData, setHobbiesData] = useState({
    universal: { activities: [], interests: [], custom: [] },
    specific: { activities: [], interests: [], custom: [] },
    excluded: { activities: [], interests: [], custom: [] },
    loading: true,
    error: null
  });
  const [excludeMode, setExcludeMode] = useState(false);
  const [allUniversalHobbies, setAllUniversalHobbies] = useState([]);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

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

      // Get town-specific hobbies (both included and excluded)
      const { data: townHobbies, error: townError } = await supabase
        .from('towns_hobbies')
        .select('hobby_id, is_excluded')
        .eq('town_id', townId);

      if (townError) throw townError;

      const townHobbyIds = new Set(
        townHobbies?.filter(th => !th.is_excluded).map(th => th.hobby_id) || []
      );
      const excludedHobbyIds = new Set(
        townHobbies?.filter(th => th.is_excluded).map(th => th.hobby_id) || []
      );

      // Categorize hobbies
      const universal = { activities: [], interests: [], custom: [] };
      const specific = { activities: [], interests: [], custom: [] };
      const excluded = { activities: [], interests: [], custom: [] };
      const universalHobbies = [];

      allHobbies.forEach(hobby => {
        const categoryKey = hobby.category === 'activity' ? 'activities' :
                          hobby.category === 'interest' ? 'interests' : 'custom';

        if (hobby.is_universal) {
          universalHobbies.push(hobby);
          if (excludedHobbyIds.has(hobby.id)) {
            excluded[categoryKey].push(hobby);
          } else {
            universal[categoryKey].push(hobby);
          }
        } else if (townHobbyIds.has(hobby.id)) {
          specific[categoryKey].push(hobby);
        }
      });

      setAllUniversalHobbies(universalHobbies);
      setHobbiesData({
        universal,
        specific,
        excluded,
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

  const excludeHobby = async (hobbyId) => {
    try {
      // Check if already in towns_hobbies
      const { data: existing } = await supabase
        .from('towns_hobbies')
        .select('id')
        .eq('town_id', townId)
        .eq('hobby_id', hobbyId)
        .single();

      if (existing) {
        // Update to excluded
        const { error } = await supabase
          .from('towns_hobbies')
          .update({ is_excluded: true })
          .eq('town_id', townId)
          .eq('hobby_id', hobbyId);

        if (error) throw error;
      } else {
        // Insert as excluded
        const { error } = await supabase
          .from('towns_hobbies')
          .insert({
            town_id: townId,
            hobby_id: hobbyId,
            is_excluded: true
          });

        if (error) throw error;
      }

      toast.success('Hobby excluded from this town');
      loadHobbiesData();
    } catch (error) {
      console.error('Error excluding hobby:', error);
      toast.error('Failed to exclude hobby');
    }
  };

  const unexcludeHobby = async (hobbyId) => {
    try {
      const { error } = await supabase
        .from('towns_hobbies')
        .delete()
        .eq('town_id', townId)
        .eq('hobby_id', hobbyId)
        .eq('is_excluded', true);

      if (error) throw error;

      toast.success('Hobby restored to this town');
      loadHobbiesData();
    } catch (error) {
      console.error('Error unexcluding hobby:', error);
      toast.error('Failed to restore hobby');
    }
  };

  const renderHobbyList = (hobbies, label, color = 'gray', showExcludeButton = false) => {
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
              className={`group px-3 py-1 text-sm rounded-full bg-${color}-100 text-${color}-700 border border-${color}-200 flex items-center gap-2`}
              title={hobby.is_universal ? 'Available everywhere' : `Specific to ${townName}`}
            >
              {hobby.name}
              {hobby.is_universal && (
                <span className="text-xs opacity-60">🌍</span>
              )}
              {isExecutiveAdmin && showExcludeButton && (
                <button
                  onClick={() => excludeHobby(hobby.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-red-200 rounded-full p-0.5"
                  title="Exclude this hobby from this town"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
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

  const totalExcluded = hobbiesData.excluded.activities.length +
                       hobbiesData.excluded.interests.length +
                       hobbiesData.excluded.custom.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold text-blue-700">Universal:</span>
            <span className="ml-2 text-blue-600">{totalUniversal} hobbies</span>
          </div>
          <div>
            <span className="font-semibold text-green-700">Location-Specific:</span>
            <span className="ml-2 text-green-600">{totalSpecific} hobbies</span>
          </div>
          <div>
            <span className="font-semibold text-red-700">Excluded:</span>
            <span className="ml-2 text-red-600">{totalExcluded} hobbies</span>
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
          {isExecutiveAdmin && (
            <span className="ml-2 text-xs text-gray-400 italic">
              Hover to exclude
            </span>
          )}
        </h4>

        {renderHobbyList(hobbiesData.universal.activities, 'Activities', 'blue', true)}
        {renderHobbyList(hobbiesData.universal.interests, 'Interests', 'indigo', true)}
        {renderHobbyList(hobbiesData.universal.custom, 'Custom Hobbies', 'purple', true)}

        {totalUniversal === 0 && (
          <p className="text-gray-400 italic">No universal hobbies defined</p>
        )}
      </div>

      {/* Excluded Hobbies (Executive Admin Only) */}
      {(isExecutiveAdmin || totalExcluded > 0) && (
        <div className="border-l-4 border-red-400 pl-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🚫</span>
            Excluded Hobbies
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Not available in {townName})
            </span>
          </h4>

          {totalExcluded > 0 ? (
            <>
              <div className="mb-4">
                {hobbiesData.excluded.activities.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Activities
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {hobbiesData.excluded.activities.map(hobby => (
                        <span
                          key={hobby.id}
                          className="group px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"
                        >
                          {hobby.name}
                          <span className="text-xs opacity-60">🌍</span>
                          {isExecutiveAdmin && (
                            <button
                              onClick={() => unexcludeHobby(hobby.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-green-200 rounded-full p-0.5"
                              title="Restore this hobby to this town"
                            >
                              <X className="w-3 h-3 text-green-600 rotate-45" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hobbiesData.excluded.interests.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Interests
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {hobbiesData.excluded.interests.map(hobby => (
                        <span
                          key={hobby.id}
                          className="group px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"
                        >
                          {hobby.name}
                          <span className="text-xs opacity-60">🌍</span>
                          {isExecutiveAdmin && (
                            <button
                              onClick={() => unexcludeHobby(hobby.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-green-200 rounded-full p-0.5"
                              title="Restore this hobby to this town"
                            >
                              <X className="w-3 h-3 text-green-600 rotate-45" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hobbiesData.excluded.custom.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Custom Hobbies
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {hobbiesData.excluded.custom.map(hobby => (
                        <span
                          key={hobby.id}
                          className="group px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"
                        >
                          {hobby.name}
                          <span className="text-xs opacity-60">🌍</span>
                          {isExecutiveAdmin && (
                            <button
                              onClick={() => unexcludeHobby(hobby.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-green-200 rounded-full p-0.5"
                              title="Restore this hobby to this town"
                            >
                              <X className="w-3 h-3 text-green-600 rotate-45" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic">
              No hobbies excluded from this town
            </p>
          )}
        </div>
      )}

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