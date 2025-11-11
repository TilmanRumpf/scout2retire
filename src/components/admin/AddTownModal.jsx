import { useState, useEffect } from 'react';
import { X, AlertTriangle, Search, CheckCircle2, Loader2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import Anthropic from '@anthropic-ai/sdk';
import { validateAIResults, getFieldDisplayName, formatValueForDisplay } from '../../utils/validation/aiResultValidator';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * AddTownModal - Professional duplicate-aware town addition
 *
 * WORKFLOW:
 * 1. User enters town + country
 * 2. Check database for duplicates
 * 3. If duplicates exist:
 *    a. Show warning + existing towns
 *    b. Ask: "Still want to add different one?"
 *    c. Ask: "Do you know the region/state?"
 *       - YES → Manual entry
 *       - NO → AI deep search → Dropdown selection
 * 4. Verify with Wikipedia (with region)
 * 5. Confirm and create
 */
export default function AddTownModal({ isOpen, onClose, onTownAdded, initialTownName = '' }) {
  // Steps: input, duplicate_warning, region_choice, region_manual, region_ai_search, region_dropdown, verifying, confirm, creating, audit, complete
  const [step, setStep] = useState('input');
  const [townName, setTownName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingTowns, setExistingTowns] = useState([]);
  const [aiDiscoveredTowns, setAiDiscoveredTowns] = useState([]);
  const [selectedTownOption, setSelectedTownOption] = useState(null);
  const [townInfo, setTownInfo] = useState(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);

  // Audit step state
  const [createdTownId, setCreatedTownId] = useState(null);
  const [populatedData, setPopulatedData] = useState(null);
  const [auditResults, setAuditResults] = useState(null);

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
        setAiDiscoveredTowns([]);
        setSelectedTownOption(null);
        setTownInfo(null);
        setLoading(false);
        setManualEntryMode(false);
      }, 300);
    }
  }, [isOpen]);

  // Pre-fill town name from initialTownName prop
  useEffect(() => {
    if (isOpen && initialTownName && initialTownName !== townName) {
      setTownName(initialTownName);
    }
  }, [isOpen, initialTownName]);

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
   * Step 1: Check for duplicates in database
   */
  const checkForDuplicates = async () => {
    setLoading(true);
    setVerificationStatus('Checking database for existing towns...');

    try {
      const { data: existingTownsWithSameName, error } = await supabase
        .from('towns')
        .select('id, town_name, country, region')
        .ilike('town_name', townName)
        .eq('country', country);

      if (error) throw error;

      if (existingTownsWithSameName && existingTownsWithSameName.length > 0) {
        // Duplicates found - show warning
        setExistingTowns(existingTownsWithSameName);
        setStep('duplicate_warning');
        setVerificationStatus('');
        setLoading(false);
        return;
      }

      // No duplicates - proceed directly to verification
      setExistingTowns([]);
      await externalSearchVerification();
    } catch (error) {
      console.error('Error checking duplicates:', error);
      toast.error(`Failed to check database: ${error.message}`);
      setVerificationStatus('');
      setLoading(false);
    }
  };

  /**
   * AI Deep Search: Find all instances of this town name in country
   */
  const aiDeepSearch = async () => {
    setStep('region_ai_search');
    setLoading(true);
    setVerificationStatus('AI is searching for all instances of this town...');

    try {
      const prompt = `You are a geography expert. Find ALL towns/cities named "${townName}" in "${country}".

TASK:
Return a complete list of EVERY location with this exact name in this country, including:
- State/Province/Region for disambiguation
- Any additional identifiers (like "town" vs "village" if both exist)

EXAMPLES:
For "Gainesville, United States":
- Gainesville, Alabama
- Gainesville, Arkansas
- Gainesville, Florida
- Gainesville, Georgia
... (all 11 instances)

For "Springfield, United States":
- Springfield, Illinois
- Springfield, Massachusetts
- Springfield, Missouri
... (dozens of instances)

RESPONSE FORMAT (JSON array):
[
  {
    "displayName": "Gainesville, Alabama, United States",
    "region": "Alabama"
  },
  {
    "displayName": "Gainesville (town), New York, United States",
    "region": "New York"
  }
]

Return ONLY the JSON array, no explanation.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = response.content[0].text;
      console.log('AI deep search response:', responseText);

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON array');
      }

      const discoveredTowns = JSON.parse(jsonMatch[0]);

      if (!discoveredTowns || discoveredTowns.length === 0) {
        throw new Error('AI found no matching towns');
      }

      console.log(`✅ AI found ${discoveredTowns.length} instances`);
      setAiDiscoveredTowns(discoveredTowns);
      setStep('region_dropdown');
      setVerificationStatus('');
      setLoading(false);

    } catch (error) {
      console.error('AI deep search error:', error);
      toast.error(`AI search failed: ${error.message}. Please enter region manually.`);
      setStep('region_manual');
      setVerificationStatus('');
      setLoading(false);
    }
  };

  /**
   * External search (Wikipedia) to verify town
   */
  const externalSearchVerification = async () => {
    setStep('verifying');
    setVerificationStatus('Searching Wikipedia...');
    setLoading(true);

    try {
      // Build search query with region if available
      const searchQuery = region.trim()
        ? `${townName} ${region} ${country}`
        : `${townName} ${country}`;

      const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=5&format=json&origin=*`;

      const response = await fetch(wikipediaUrl);
      const data = await response.json();

      const titles = data[1] || [];
      const descriptions = data[2] || [];
      const urls = data[3] || [];

      if (titles.length > 0) {
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
        setTownInfo({
          title: region ? `${townName}, ${region}, ${country}` : `${townName}, ${country}`,
          description: 'Could not find this town on Wikipedia. This may be a small town or the name might be incorrect.',
          url: null,
          alternatives: []
        });
      }

      setStep('confirm');
      setVerificationStatus('');
      setLoading(false);
    } catch (error) {
      console.error('Wikipedia search error:', error);
      setTownInfo({
        title: region ? `${townName}, ${region}, ${country}` : `${townName}, ${country}`,
        description: 'Search failed. You can still add this town manually.',
        url: null,
        alternatives: []
      });
      setStep('confirm');
      setVerificationStatus('');
      setLoading(false);
    }
  };

  /**
   * Create town in database
   */
  const createTown = async () => {
    setStep('creating');
    setLoading(true);
    setVerificationStatus('Creating town in database...');

    try {
      const capitalizeTownName = (name) => {
        return name
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      const newTown = {
        town_name: capitalizeTownName(townName),
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

      toast.success(`${townName} created! AI is researching data...`);
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
        console.error('AI population failed:', populateResult);
        toast.error(`AI population failed. You can fill data manually.`);

        // Skip audit if AI failed
        setStep('complete');
        setLoading(false);
        setVerificationStatus('');

        if (onTownAdded) {
          onTownAdded(createdTown);
        }

        setTimeout(() => {
          onClose();
        }, 2000);
        return;
      }

      // AI populated successfully - fetch data for audit
      toast.success(`AI populated ${populateResult.populatedFields?.length || 0} fields! Reviewing...`);
      setVerificationStatus('Fetching populated data for review...');

      const { data: populatedTown, error: fetchError } = await supabase
        .from('towns')
        .select('*')
        .eq('id', createdTown.id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch populated town:', fetchError);
        toast.error('Could not fetch data for audit');
        setStep('complete');
        setLoading(false);
        return;
      }

      // Run validation on AI results
      const validation = validateAIResults(populatedTown);

      // Store for audit step
      setCreatedTownId(createdTown.id);
      setPopulatedData(populatedTown);
      setAuditResults(validation);

      // Move to audit step
      setStep('audit');
      setLoading(false);
      setVerificationStatus('');

    } catch (error) {
      console.error('Error creating town:', error);
      toast.error(`Failed to create town: ${error.message}`);
      setLoading(false);
      setStep('confirm');
      setVerificationStatus('');
    }
  };

  /**
   * Handle audit approval - proceed to complete
   */
  const handleAuditApprove = () => {
    toast.success('AI results approved!');
    setStep('complete');

    if (onTownAdded && populatedData) {
      onTownAdded(populatedData);
    }

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  /**
   * Handle audit rejection - delete town and restart
   */
  const handleAuditReject = async () => {
    if (!createdTownId) return;

    const confirmDelete = window.confirm(
      'Reject AI results? This will delete the town and you can start over.'
    );

    if (!confirmDelete) return;

    setLoading(true);
    setVerificationStatus('Deleting town...');

    try {
      const { error } = await supabase
        .from('towns')
        .delete()
        .eq('id', createdTownId);

      if (error) throw error;

      toast.success('Town deleted. You can try again.');

      // Reset to initial step
      setTimeout(() => {
        setStep('input');
        setTownName('');
        setCountry('');
        setRegion('');
        setCreatedTownId(null);
        setPopulatedData(null);
        setAuditResults(null);
        setLoading(false);
        setVerificationStatus('');
      }, 300);

    } catch (error) {
      console.error('Error deleting town:', error);
      toast.error(`Failed to delete town: ${error.message}`);
      setLoading(false);
      setVerificationStatus('');
    }
  };

  /**
   * Handle initial form submission
   */
  const handleInitialSubmit = async () => {
    if (!townName.trim()) {
      toast.error('Town name is required');
      return;
    }
    if (!country.trim()) {
      toast.error('Country is required');
      return;
    }

    await checkForDuplicates();
  };

  /**
   * Handle "Yes, add different town" from duplicate warning
   */
  const handleConfirmAddDifferent = () => {
    setStep('region_choice');
  };

  /**
   * Handle region choice
   */
  const handleRegionChoiceYes = () => {
    setStep('region_manual');
    setManualEntryMode(true);
  };

  const handleRegionChoiceNo = async () => {
    await aiDeepSearch();
  };

  /**
   * Handle manual region submission
   */
  const handleManualRegionSubmit = async () => {
    if (!region.trim()) {
      toast.error('Region is required');
      return;
    }

    setLoading(true);

    // Check if this specific combination already exists
    try {
      const { data: exactMatch, error } = await supabase
        .from('towns')
        .select('id, town_name, country, region')
        .ilike('town_name', townName)
        .eq('country', country)
        .ilike('region', region);

      if (error) throw error;

      if (exactMatch && exactMatch.length > 0) {
        setLoading(false);
        toast.error(`${townName}, ${region}, ${country} already exists!`);
        return;
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
      toast.error(`Failed to verify: ${error.message}`);
      setLoading(false);
      return;
    }

    await externalSearchVerification();
  };

  /**
   * Handle dropdown selection
   */
  const handleDropdownSelection = async (townOption) => {
    // Check if already exists
    const alreadyExists = existingTowns.some(t =>
      t.region?.toLowerCase() === townOption.region.toLowerCase()
    );

    if (alreadyExists) {
      toast.error('This town already exists in the database');
      return;
    }

    setSelectedTownOption(townOption);
    setRegion(townOption.region);
    setLoading(true);
    await externalSearchVerification();
  };

  /**
   * Handle "My town isn't listed" option
   */
  const handleTownNotListed = () => {
    setStep('region_manual');
    setManualEntryMode(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${uiConfig.colors.card} rounded-lg shadow-2xl`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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

          {/* Step: Initial Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Town Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={townName}
                  onChange={(e) => setTownName(e.target.value)}
                  placeholder="e.g., Gainesville"
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                  autoFocus
                />
              </div>

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
                  placeholder="e.g., United States"
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                />

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

          {/* Step: Duplicate Warning */}
          {step === 'duplicate_warning' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                  ⚠️ Town Already Exists
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  A town named <strong>{townName}</strong> already exists in <strong>{country}</strong>:
                </p>
                <div className="space-y-2 mb-4">
                  {existingTowns.map((town, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 rounded">
                      <MapPin size={16} />
                      <span>
                        {town.town_name}
                        {town.region && `, ${town.region}`}
                        , {town.country}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Do you still want to add a different {townName}?
                </p>
              </div>
            </div>
          )}

          {/* Step: Region Choice */}
          {step === 'region_choice' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Do you know the specific region/state within {country}?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  This helps us distinguish between multiple towns with the same name.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  For example: "Georgia" or "Alabama" for Gainesville in the United States
                </p>
              </div>
            </div>
          )}

          {/* Step: Manual Region Entry */}
          {step === 'region_manual' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  Enter the region/state to differentiate this town from existing entries.
                </p>
                {existingTowns.length > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Existing: {existingTowns.map(t => `${t.town_name}${t.region ? ` (${t.region})` : ''}`).join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region / State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Georgia, Andalusia, etc."
                  className={`w-full px-4 py-2 border ${uiConfig.colors.border} rounded-lg ${uiConfig.colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step: AI Search in Progress */}
          {step === 'region_ai_search' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                AI is searching for all {townName} locations...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {verificationStatus}
              </p>
            </div>
          )}

          {/* Step: Dropdown Selection */}
          {step === 'region_dropdown' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Select which {townName} you want to add:
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  AI found {aiDiscoveredTowns.length} location{aiDiscoveredTowns.length !== 1 ? 's' : ''} with this name
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {aiDiscoveredTowns.map((town, i) => {
                  const alreadyExists = existingTowns.some(t =>
                    t.region?.toLowerCase() === town.region.toLowerCase()
                  );

                  return (
                    <button
                      key={i}
                      onClick={() => !alreadyExists && handleDropdownSelection(town)}
                      disabled={alreadyExists || loading}
                      className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                        alreadyExists
                          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className={alreadyExists ? 'text-gray-400' : 'text-blue-500'} />
                          <span className={`text-sm font-medium ${alreadyExists ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {town.displayName}
                          </span>
                        </div>
                        {alreadyExists && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            Already exists
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* "My town isn't listed" option */}
                <button
                  onClick={handleTownNotListed}
                  className="w-full text-left px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      My town isn't listed - enter manually
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step: Verifying (Wikipedia search) */}
          {step === 'verifying' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Verifying town information...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {verificationStatus}
              </p>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === 'confirm' && townInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Is this the correct town?
                </h3>
                <div className="mt-3 space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {townInfo.title}
                  </p>
                  {region.trim() && (
                    <div className="inline-block">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                        Region: {region}
                      </span>
                    </div>
                  )}
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
                  ✨ After creation, Claude AI will automatically populate all town data
                </p>
              </div>
            </div>
          )}

          {/* Step: Creating */}
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

          {/* Step: Audit AI Results */}
          {step === 'audit' && auditResults && populatedData && (
            <div className="py-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Review AI-Populated Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI has populated {Object.keys(populatedData).filter(k => populatedData[k] !== null && populatedData[k] !== '').length} fields.
                  Please review for accuracy before finalizing.
                </p>
              </div>

              {/* Summary Badge */}
              <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  {auditResults.hasErrors ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{auditResults.issues.filter(i => i.severity === 'error').length} Errors Found</span>
                    </div>
                  ) : auditResults.hasWarnings ? (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">{auditResults.issues.filter(i => i.severity === 'warning').length} Warnings</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">All Clear - No Issues Detected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Issues List */}
              {auditResults.totalIssues > 0 && (
                <div className="mb-4 max-h-96 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issues Detected:
                  </h4>
                  <div className="space-y-2">
                    {auditResults.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          issue.severity === 'error'
                            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                            : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {issue.severity === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getFieldDisplayName(issue.field)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {issue.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                              Value: {formatValueForDisplay(issue.field, issue.value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample of Populated Fields */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sample Populated Fields:
                </h4>
                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  {['population', 'description', 'airport_distance', 'cost_of_living_usd']
                    .filter(field => populatedData[field])
                    .map(field => (
                      <div key={field} className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">{getFieldDisplayName(field)}:</span>
                        <span className="text-gray-900 dark:text-white">{formatValueForDisplay(field, populatedData[field])}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={handleAuditReject}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reject & Delete
                </button>
                <button
                  onClick={handleAuditApprove}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve & Finalize
                </button>
              </div>

              {auditResults.hasErrors && (
                <p className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">
                  ⚠️ Errors detected - review carefully before approving
                </p>
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
        </div>

        {/* Footer */}
        {!['creating', 'audit', 'complete', 'verifying', 'region_ai_search'].includes(step) && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => {
                if (step === 'confirm') {
                  setStep('input');
                  setTownInfo(null);
                  setRegion('');
                } else if (step === 'duplicate_warning') {
                  onClose();
                } else if (step === 'region_choice') {
                  setStep('duplicate_warning');
                } else if (step === 'region_manual') {
                  setStep('region_choice');
                  setRegion('');
                } else if (step === 'region_dropdown') {
                  setStep('region_choice');
                } else {
                  onClose();
                }
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {step === 'confirm' || step === 'duplicate_warning' ? 'Go Back' : 'Cancel'}
            </button>

            {step === 'input' && (
              <button
                onClick={handleInitialSubmit}
                disabled={loading || !townName.trim() || !country.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Search & Verify
              </button>
            )}

            {step === 'duplicate_warning' && (
              <button
                onClick={handleConfirmAddDifferent}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Add Different Town
              </button>
            )}

            {step === 'region_choice' && (
              <>
                <button
                  onClick={handleRegionChoiceNo}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  No, Let AI Find Options
                </button>
                <button
                  onClick={handleRegionChoiceYes}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Yes, I Know It
                </button>
              </>
            )}

            {step === 'region_manual' && (
              <button
                onClick={handleManualRegionSubmit}
                disabled={loading || !region.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
              </button>
            )}

            {step === 'confirm' && (
              <>
                <button
                  onClick={() => {
                    // Wrong town - offer to refine search
                    setTownInfo(null);
                    setStep('region_choice');
                    toast('Let\'s find the correct town with more details', { duration: 3000 });
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  No, Wrong Town
                </button>
                <button
                  onClick={createTown}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Yes, Add This Town
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
