import { useState, useEffect } from 'react';
import { X, AlertTriangle, Search, CheckCircle2, Loader2 } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

/**
 * AddTownModal - Add a new town to the database
 *
 * Flow:
 * 1. Request town name and country (mandatory)
 * 2. Verify town doesn't already exist in database
 * 3. External search to verify town can be found
 * 4. Check if multiple towns exist in the country
 * 5. If multiple, request region field
 * 6. Sequentially AI populate editable tabs
 */
export default function AddTownModal({ isOpen, onClose, onTownAdded }) {
  const [step, setStep] = useState('input'); // input, verifying, region, confirm, creating, complete
  const [townName, setTownName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingTowns, setExistingTowns] = useState([]);
  const [requiresRegion, setRequiresRegion] = useState(false);
  const [townInfo, setTownInfo] = useState(null); // Wikipedia info to show user

  // List of all countries for autocomplete
  const COUNTRIES = [
    'Albania', 'Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
    'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
    'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro',
    'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania',
    'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Ukraine', 'United Kingdom', 'Vatican City', 'Canada', 'United States',
    'Mexico', 'Costa Rica', 'Panama', 'Argentina', 'Brazil', 'Chile', 'Colombia',
    'Ecuador', 'Peru', 'Uruguay', 'Australia', 'New Zealand', 'Japan', 'South Korea',
    'Singapore', 'Thailand', 'Malaysia', 'Vietnam', 'Indonesia', 'Philippines',
    'United Arab Emirates', 'Israel', 'Turkey', 'Morocco', 'South Africa'
  ].sort();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('input');
        setTownName('');
        setCountry('');
        setRegion('');
        setVerificationStatus('');
        setExistingTowns([]);
        setRequiresRegion(false);
        setTownInfo(null);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  // Handle country autocomplete
  useEffect(() => {
    if (country.length >= 2) {
      const matches = COUNTRIES.filter(c =>
        c.toLowerCase().includes(country.toLowerCase())
      ).slice(0, 10);
      setCountrySuggestions(matches);
      setShowCountrySuggestions(matches.length > 0);
    } else {
      setShowCountrySuggestions(false);
    }
  }, [country]);

  /**
   * Step 1: Verify town doesn't already exist
   */
  const verifyTownDoesNotExist = async () => {
    setLoading(true);
    setVerificationStatus('Checking if town exists in database...');

    try {
      // Check for towns with the SAME NAME in this country (case-insensitive)
      const { data: existingTownsWithSameName, error } = await supabase
        .from('towns')
        .select('id, name, country, region')
        .ilike('name', townName)
        .eq('country', country);

      if (error) throw error;

      // If exact match exists without region specified, it's a duplicate
      if (existingTownsWithSameName && existingTownsWithSameName.length > 0) {
        // Check if any existing town has no region (exact duplicate)
        const exactDuplicate = existingTownsWithSameName.find(t => !t.region || t.region.trim() === '');

        if (exactDuplicate && existingTownsWithSameName.length === 1) {
          // Exact duplicate exists
          setVerificationStatus('');
          setLoading(false);
          toast.error(`${townName}, ${country} already exists in the database!`);
          return false;
        }

        // Multiple towns with same name exist - need region to differentiate
        if (existingTownsWithSameName.length >= 1) {
          setExistingTowns(existingTownsWithSameName);
          setRequiresRegion(true);
          setStep('region');
          setVerificationStatus('');
          setLoading(false);
          return 'needs_region';
        }
      }

      // No towns with same name - safe to proceed
      return true;
    } catch (error) {
      console.error('Error verifying town:', error);
      toast.error(`Failed to verify town: ${error.message}`);
      setVerificationStatus('');
      setLoading(false);
      return false;
    }
  };

  /**
   * Step 2: External search to identify and verify town
   */
  const externalSearchVerification = async () => {
    setStep('verifying');
    setVerificationStatus('Searching for town online...');

    try {
      // Use Wikipedia API to verify town exists
      const searchQuery = `${townName} ${country}`;
      const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=5&format=json&origin=*`;

      const response = await fetch(wikipediaUrl);
      const data = await response.json();

      // data[1] contains titles, data[2] contains descriptions, data[3] contains URLs
      const titles = data[1] || [];
      const descriptions = data[2] || [];
      const urls = data[3] || [];

      if (titles.length > 0) {
        // Found results - show to user for confirmation
        setTownInfo({
          title: titles[0],
          description: descriptions[0] || 'No description available',
          url: urls[0],
          alternatives: titles.slice(1, 3).map((t, i) => ({
            title: t,
            description: descriptions[i + 1] || ''
          }))
        });
      } else {
        // Not found
        setTownInfo({
          title: `${townName}, ${country}`,
          description: 'Could not find this town on Wikipedia. This may be a small town or the name might be incorrect.',
          url: null,
          alternatives: []
        });
      }

      setStep('confirm');
      setVerificationStatus('');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('External search error:', error);
      // Still show confirmation even if search fails
      setTownInfo({
        title: `${townName}, ${country}`,
        description: 'Search failed. You can still add this town manually.',
        url: null,
        alternatives: []
      });
      setStep('confirm');
      setVerificationStatus('');
      setLoading(false);
      return true;
    }
  };

  /**
   * Step 3: Create town in database and trigger AI population
   */
  const createTown = async () => {
    setStep('creating');
    setLoading(true);
    setVerificationStatus('Creating town in database...');

    try {
      // Helper function to capitalize town names properly
      const capitalizeTownName = (name) => {
        return name
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      // Create new town with minimal data
      const newTown = {
        name: capitalizeTownName(townName),
        country: country.trim(),
        region: region.trim() || null,
        created_at: new Date().toISOString()
      };

      const { data: createdTown, error } = await supabase
        .from('towns')
        .insert([newTown])
        .select()
        .single();

      if (error) throw error;

      toast.success(`${townName} created! Now AI is researching data...`);
      setVerificationStatus('AI is researching and populating town data...');

      // Call AI population edge function
      const { data: { session } } = await supabase.auth.getSession();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const populateResponse = await fetch(
        `${supabaseUrl}/functions/v1/ai-populate-new-town`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            townId: createdTown.id,
            townName: townName.trim(),
            country: country.trim(),
            region: region.trim() || null
          })
        }
      );

      const populateResult = await populateResponse.json();

      if (!populateResponse.ok || !populateResult.success) {
        console.error('AI population failed:', {
          status: populateResponse.status,
          error: populateResult.error,
          fullResponse: populateResult
        });
        toast.error(`AI population failed: ${populateResult.error || 'Unknown error'}. You can fill data manually.`);
      } else {
        toast.success(`AI populated ${populateResult.populatedFields?.length || 0} fields!`);
      }

      setStep('complete');
      setLoading(false);
      setVerificationStatus('');

      // Notify parent component to refresh and select town
      if (onTownAdded) {
        onTownAdded(createdTown);
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

      return createdTown;
    } catch (error) {
      console.error('Error creating town:', error);
      toast.error(`Failed to create town: ${error.message}`);
      setLoading(false);
      setStep('confirm'); // Go back to confirmation
      setVerificationStatus('');
      return null;
    }
  };

  /**
   * Handle form submission - verify and search
   */
  const handleSubmit = async () => {
    // Validate inputs
    if (!townName.trim()) {
      toast.error('Town name is required');
      return;
    }

    if (!country.trim()) {
      toast.error('Country is required');
      return;
    }

    setLoading(true);

    // Step 1: Verify town doesn't exist
    const existsCheck = await verifyTownDoesNotExist();
    if (existsCheck === false) return; // Already exists
    if (existsCheck === 'needs_region') return; // Need region input

    // Step 2: External search and show confirmation
    await externalSearchVerification();
  };

  /**
   * Handle region submission
   */
  const handleRegionSubmit = async () => {
    if (!region.trim()) {
      toast.error('Region is required');
      return;
    }

    setLoading(true);

    // Continue with external search and show confirmation
    await externalSearchVerification();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl mx-4 ${uiConfig.colors.card} rounded-lg shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New Town
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚠️ You are about to add a new town to the database. Please ensure all information is accurate.
            </p>
          </div>

          {/* Step: Input Form */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Town Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Town Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={townName}
                  onChange={(e) => setTownName(e.target.value)}
                  placeholder="e.g., Valencia"
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                />
              </div>

              {/* Country */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onFocus={() => setShowCountrySuggestions(countrySuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                  placeholder="e.g., Spain"
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                />

                {/* Country Autocomplete */}
                {showCountrySuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {countrySuggestions.map((countryOption) => (
                      <button
                        key={countryOption}
                        onClick={() => {
                          setCountry(countryOption);
                          setShowCountrySuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      >
                        {countryOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step: Region Required */}
          {step === 'region' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  A town named <strong>{townName}</strong> already exists in <strong>{country}</strong>. Please specify the region to differentiate this town.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Existing towns with same name: {existingTowns.map(t => `${t.name}${t.region ? ` (${t.region})` : ''}`).join(', ')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Valencia, Andalusia, etc."
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Step: Verifying (searching) */}
          {step === 'verifying' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Searching for {townName}...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {verificationStatus}
              </p>
            </div>
          )}

          {/* Step: Confirmation - Show what was found */}
          {step === 'confirm' && townInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Is this the correct town?
                </h3>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {townInfo.title}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {townInfo.description}
                  </p>
                  {townInfo.url && (
                    <a
                      href={townInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      View on Wikipedia →
                    </a>
                  )}
                </div>
              </div>

              {townInfo.alternatives && townInfo.alternatives.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Other possible matches:
                  </p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    {townInfo.alternatives.map((alt, i) => (
                      <li key={i}>• {alt.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✨ After creation, Claude AI will automatically populate all town data using Anthropic API
                </p>
              </div>
            </div>
          )}

          {/* Step: Creating & AI Populating */}
          {step === 'creating' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {verificationStatus.includes('AI') ? 'AI Researching Town Data...' : `Creating ${townName}...`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {verificationStatus}
              </p>
              {verificationStatus.includes('AI') && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>Claude AI is researching:</p>
                  <p className="mt-1">• Climate & Geography</p>
                  <p>• Culture & Language</p>
                  <p>• Cost of Living</p>
                  <p>• Town Description</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Town Added Successfully!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {townName}, {country} is now in the database
              </p>
            </div>
          )}

          {/* Status Message */}
          {verificationStatus && step !== 'verifying' && step !== 'creating' && step !== 'complete' && step !== 'confirm' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {verificationStatus}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'complete' && step !== 'creating' && step !== 'verifying' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                if (step === 'confirm') {
                  setStep('input');
                  setTownInfo(null);
                } else {
                  onClose();
                }
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {step === 'confirm' ? 'Go Back' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                if (step === 'confirm') {
                  createTown();
                } else if (step === 'region') {
                  handleRegionSubmit();
                } else {
                  handleSubmit();
                }
              }}
              disabled={loading || !townName.trim() || !country.trim() || (requiresRegion && step === 'input' && !region.trim())}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === 'confirm' ? 'Yes, Add This Town' : step === 'region' ? 'Continue' : 'Search & Verify'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
