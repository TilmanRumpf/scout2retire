import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import { expandedTownData, insertExpandedTownData } from '../../data/expandedTownData';
import { getCurrentUser } from '../../utils/authUtils';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

export default function DataImport() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedTowns, setSelectedTowns] = useState([]);
  const navigate = useNavigate();

  // Check if user is admin (you might want to implement proper admin check)
  useState(() => {
    const checkAdmin = async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      // For now, only allow specific user IDs (replace with your admin user ID)
      const adminUserIds = ['your-admin-user-id'];
      if (!adminUserIds.includes(user.id)) {
        toast.error('Unauthorized access');
        navigate('/');
      }
    };
    checkAdmin();
  }, []);

  const handleImportAll = async () => {
    setImporting(true);
    try {
      const result = await insertExpandedTownData(supabase);
      setResults(result);
      if (result.success) {
        toast.success('Data import completed!');
      } else {
        toast.error('Import failed - check console for details');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedTowns.length === 0) {
      toast.error('Please select towns to import');
      return;
    }

    setImporting(true);
    try {
      const townsToImport = expandedTownData.filter(town => 
        selectedTowns.includes(`${town.name}-${town.country}`)
      );

      const { error } = await supabase
        .from('towns')
        .upsert(townsToImport, { 
          onConflict: 'name,country',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Import error:', error);
        toast.error('Import failed');
      } else {
        toast.success(`Successfully imported ${townsToImport.length} towns`);
        setResults({ success: true, count: townsToImport.length });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const toggleTownSelection = (townKey) => {
    setSelectedTowns(prev => 
      prev.includes(townKey) 
        ? prev.filter(k => k !== townKey)
        : [...prev, townKey]
    );
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-6`}>
          Town Data Import Tool
        </h1>

        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 mb-6`}>
          <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
            Import Options
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={handleImportAll}
              disabled={importing}
              className={`px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${
                importing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importing ? 'Importing...' : `Import All ${expandedTownData.length} Towns`}
            </button>

            <button
              onClick={handleImportSelected}
              disabled={importing || selectedTowns.length === 0}
              className={`px-6 py-3 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} ${
                importing || selectedTowns.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importing ? 'Importing...' : `Import Selected (${selectedTowns.length})`}
            </button>
          </div>

          {results && (
            <div className={`mt-6 p-4 ${results.success ? uiConfig.colors.statusSuccess : uiConfig.colors.statusError} ${uiConfig.layout.radius.md}`}>
              <h3 className="font-semibold mb-2">Import Results:</h3>
              {results.results ? (
                <ul className="text-sm space-y-1">
                  {results.results.map((r, i) => (
                    <li key={i}>
                      Batch {r.batch}: {r.success ? `✓ ${r.count} towns` : `✗ Error: ${r.error?.message}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Imported {results.count} towns successfully</p>
              )}
            </div>
          )}
        </div>

        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
          <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
            Available Towns ({expandedTownData.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {expandedTownData.map((town) => {
              const townKey = `${town.name}-${town.country}`;
              const isSelected = selectedTowns.includes(townKey);

              return (
                <div
                  key={townKey}
                  className={`p-4 ${uiConfig.layout.radius.md} border ${
                    isSelected ? uiConfig.colors.borderActive : uiConfig.colors.borderDefault
                  } cursor-pointer ${uiConfig.animation.transition}`}
                  onClick={() => toggleTownSelection(townKey)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${uiConfig.colors.heading}`}>
                        {town.name}
                      </h3>
                      <p className={`text-sm ${uiConfig.colors.body}`}>
                        {town.country} • ${town.cost_index}/mo
                      </p>
                      <p className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                        Healthcare: {town.healthcare_score}/10 • Safety: {town.safety_score}/10
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}