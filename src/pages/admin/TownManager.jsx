import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Database, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { importTowns, getTownStats, importFromCSV, validateTownData } from '../../utils/townImporter';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

export default function TownManager() {
  const [stats, setStats] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { user } = await getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    // Add your admin check here
  };

  const loadStats = async () => {
    const townStats = await getTownStats();
    setStats(townStats);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvContent(e.target.result);
      toast.success('File loaded successfully');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent) {
      toast.error('Please upload a file first');
      return;
    }

    setImporting(true);
    setProgress(0);
    setResults(null);

    try {
      const importResults = await importFromCSV(csvContent, {
        skipExisting: true,
        onProgress: (prog, res) => {
          setProgress(prog);
          console.log(`Progress: ${prog}%`);
        }
      });

      setResults(importResults);
      toast.success(`Import completed! ${importResults.imported} towns added.`);
      
      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDryRun = async () => {
    if (!csvContent) {
      toast.error('Please upload a file first');
      return;
    }

    try {
      const results = await importFromCSV(csvContent, {
        dryRun: true,
        skipExisting: true
      });

      console.log('Dry run results:', results);
      toast.success('Dry run completed - check console for details');
    } catch (error) {
      console.error('Dry run error:', error);
      toast.error('Dry run failed');
    }
  };

  const downloadTemplate = () => {
    const template = `Town Name\tContinent\tCountry\tRegion (State/Province)\tRetirement Category
Example Town\tEurope\tSpain\tAndalusia\tMediterranean`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'town_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold ${uiConfig.colors.heading} mb-8`}>
          Town Manager
        </h1>

        {/* Current Statistics */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4 flex items-center`}>
            <Database className="mr-2" size={24} />
            Current Database Statistics
          </h2>
          
          {stats ? (
            <div className="space-y-2">
              <p className={uiConfig.colors.body}>
                <span className="font-semibold">Total Towns:</span> {stats.total}
              </p>
              <p className={uiConfig.colors.body}>
                <span className="font-semibold">Countries:</span> {stats.countries}
              </p>
              
              <div className="mt-4">
                <p className={`font-semibold ${uiConfig.colors.body} mb-2`}>Towns by Country:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {Object.entries(stats.byCountry).sort(([a], [b]) => a.localeCompare(b)).map(([country, count]) => (
                    <div key={country} className={`text-sm ${uiConfig.colors.body}`}>
                      {country}: <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className={uiConfig.colors.hint}>Loading statistics...</p>
          )}
        </div>

        {/* Import Section */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4 flex items-center`}>
            <Upload className="mr-2" size={24} />
            Import Towns
          </h2>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className={`block ${uiConfig.colors.body} mb-2`}>
                Upload CSV/TSV File
              </label>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className={`block w-full text-sm ${uiConfig.colors.body}
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-scout-accent file:text-white
                  hover:file:bg-scout-accent-dark
                  file:cursor-pointer`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className={`${uiConfig.components.buttonSecondary} flex items-center`}
              >
                <Download size={16} className="mr-2" />
                Download Template
              </button>

              <button
                onClick={handleDryRun}
                disabled={!csvContent || importing}
                className={`${uiConfig.components.buttonSecondary}`}
              >
                Dry Run
              </button>

              <button
                onClick={handleImport}
                disabled={!csvContent || importing}
                className={uiConfig.components.buttonPrimary}
              >
                {importing ? `Importing... ${progress}%` : 'Import Towns'}
              </button>
            </div>

            {/* Progress Bar */}
            {importing && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-scout-accent h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Import Results */}
        {results && (
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6`}>
            <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>
              Import Results
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold text-green-600`}>{results.imported}</p>
                  <p className={`text-sm ${uiConfig.colors.hint}`}>Imported</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold text-blue-600`}>{results.skipped}</p>
                  <p className={`text-sm ${uiConfig.colors.hint}`}>Skipped</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold text-orange-600`}>{results.updated}</p>
                  <p className={`text-sm ${uiConfig.colors.hint}`}>Updated</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold text-red-600`}>{results.errors}</p>
                  <p className={`text-sm ${uiConfig.colors.hint}`}>Errors</p>
                </div>
              </div>

              {results.duration && (
                <p className={`text-sm ${uiConfig.colors.hint} text-center`}>
                  Completed in {results.duration.toFixed(2)} seconds
                </p>
              )}

              {/* Detailed Results */}
              {results.details.length > 0 && (
                <details className="mt-4">
                  <summary className={`cursor-pointer ${uiConfig.colors.body} font-semibold`}>
                    View Details
                  </summary>
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {results.details.map((detail, index) => (
                      <div 
                        key={index} 
                        className={`text-sm py-1 px-2 ${
                          detail.status === 'imported' ? 'text-green-600' :
                          detail.status === 'skipped' ? 'text-blue-600' :
                          detail.status === 'error' ? 'text-red-600' :
                          uiConfig.colors.body
                        }`}
                      >
                        {detail.status === 'imported' && <CheckCircle size={14} className="inline mr-1" />}
                        {detail.status === 'error' && <AlertCircle size={14} className="inline mr-1" />}
                        {detail.town} - {detail.status}
                        {detail.reason && ` (${detail.reason})`}
                        {detail.error && ` - ${detail.error}`}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={`mt-6 ${uiConfig.colors.hint} text-sm`}>
          <p className="mb-2"><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload a CSV or TSV file with town data</li>
            <li>Required columns: Town Name, Country</li>
            <li>Optional columns: Continent, Region, Category</li>
            <li>Use "Dry Run" to preview what will be imported</li>
            <li>Duplicate towns (same name & country) will be skipped by default</li>
          </ul>
        </div>
      </div>
    </div>
  );
}