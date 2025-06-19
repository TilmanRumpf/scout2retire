import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Home, TrendingUp, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-md border-2 transition-all text-center ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-xs mt-1 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingCosts() {
  const [formData, setFormData] = useState({
    monthly_budget: 2000,
    housing_preference: [],
    housing_budget_percentage: 30,
    cost_priorities: {
      food: 3,
      entertainment: 2,
      healthcare: 4,
      transportation: 3,
      utilities: 3
    },
    willing_to_compromise: [],
    deal_breakers: []
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        setProgress(userProgress);
        
        // If costs data exists, load it
        if (data && data.costs) {
          // Convert single values to arrays for housing_preference if needed
          const loadedData = data.costs;
          setFormData({
            ...loadedData,
            housing_preference: Array.isArray(loadedData.housing_preference) 
              ? loadedData.housing_preference 
              : (loadedData.housing_preference ? [loadedData.housing_preference] : [])
          });
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleHousingToggle = (value) => {
    setFormData(prev => {
      const currentPreferences = prev.housing_preference || [];
      const isSelected = currentPreferences.includes(value);
      
      return {
        ...prev,
        housing_preference: isSelected 
          ? currentPreferences.filter(v => v !== value)
          : [...currentPreferences, value]
      };
    });
  };

  const handleCompromiseToggle = (factor) => {
    setFormData(prev => ({
      ...prev,
      willing_to_compromise: prev.willing_to_compromise.includes(factor)
        ? prev.willing_to_compromise.filter(f => f !== factor)
        : [...prev.willing_to_compromise, factor]
    }));
  };

  const handleDealBreakerToggle = (factor) => {
    setFormData(prev => ({
      ...prev,
      deal_breakers: prev.deal_breakers.includes(factor)
        ? prev.deal_breakers.filter(f => f !== factor)
        : [...prev.deal_breakers, factor]
    }));
  };

  const handlePriorityChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      cost_priorities: {
        ...prev.cost_priorities,
        [category]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await saveOnboardingStep(
        user.id,
        formData,
        'costs' // Changed from 'budget' to 'costs'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Budget & cost preferences saved!');
      navigate('/onboarding/review');
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Housing options
  const housingOptions = [
    { value: 'rent', label: 'Rent' },
    { value: 'buy', label: 'Buy' },
    { value: 'either', label: 'Either' }
  ];

  // Cost categories with icons
  const costCategories = [
    { id: 'healthcare', label: 'Healthcare', icon: DollarSign },
    { id: 'food', label: 'Food & Dining', icon: DollarSign },
    { id: 'transportation', label: 'Transportation', icon: DollarSign },
    { id: 'utilities', label: 'Utilities', icon: DollarSign },
    { id: 'entertainment', label: 'Entertainment', icon: DollarSign }
  ];

  // Compromise options
  const compromiseOptions = [
    { id: 'high_food', label: 'High Food' },
    { id: 'high_healthcare', label: 'Healthcare' },
    { id: 'high_rent', label: 'High Rent' },
    { id: 'high_taxes', label: 'High Taxes' },
    { id: 'expensive_utilities', label: 'Utilities' },
    { id: 'high_transport', label: 'Transport' }
  ];

  // Deal breaker options
  const dealBreakerOptions = [
    { id: 'very_high_cost', label: 'Very High Cost' },
    { id: 'poor_healthcare', label: 'Poor Healthcare' },
    { id: 'no_affordable_housing', label: 'No Housing' },
    { id: 'extreme_taxes', label: 'Extreme Taxes' },
    { id: 'unsafe_area', label: 'Unsafe Area' },
    { id: 'no_infrastructure', label: 'No Infrastructure' }
  ];

  // Simple slider component - matching culture/hobbies pages
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.cost_priorities[category.id];
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Icon size={16} className="text-scout-accent-600 mr-1.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {category.label}
            </span>
          </div>
          <span className="text-xs font-medium text-scout-accent-600 dark:text-scout-accent-400">
            {value}/5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => handlePriorityChange(category.id, parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${(value - 1) * 25}%, #e5e7eb ${(value - 1) * 25}%, #e5e7eb 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <OnboardingStepNavigation 
          currentStep="budget" 
          completedSteps={progress.completedSteps} 
          className="mb-4" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
          {/* Header - mb-4 */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Budget & Costs</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Help us understand your budget and cost preferences
            </p>
          </div>

          {/* Monthly Budget - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <DollarSign size={18} className="mr-1.5" />
              Monthly Budget (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm">$</span>
              </div>
              <input
                type="number"
                name="monthly_budget"
                min="500"
                max="50000"
                step="100"
                value={formData.monthly_budget}
                onChange={handleInputChange}
                className="pl-7 w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Your total monthly budget for all expenses
            </p>
          </div>

          {/* Housing Preference - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Home size={18} className="mr-1.5" />
              Housing Preference
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {housingOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.housing_preference.includes(option.value)}
                  onClick={() => handleHousingToggle(option.value)}
                />
              ))}
            </div>
          </div>

          {/* Housing Budget Percentage - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Housing Budget ({formData.housing_budget_percentage}% of total)
            </label>
            <input
              type="range"
              name="housing_budget_percentage"
              min="10"
              max="70"
              step="5"
              value={formData.housing_budget_percentage}
              onChange={handleInputChange}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((formData.housing_budget_percentage - 10) / 60) * 100}%, #e5e7eb ${((formData.housing_budget_percentage - 10) / 60) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10%</span>
              <span>${Math.round(formData.monthly_budget * formData.housing_budget_percentage / 100)}/mo</span>
              <span>70%</span>
            </div>
          </div>

          {/* Cost Priorities - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Cost Priorities
            </label>
            <div className="space-y-2">
              {costCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
          </div>

          {/* Willing to Compromise - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <TrendingUp size={18} className="mr-1.5" />
              Willing to Compromise On
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Select areas where you're flexible on costs
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {compromiseOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  label={option.label}
                  isSelected={formData.willing_to_compromise.includes(option.id)}
                  onClick={() => handleCompromiseToggle(option.id)}
                />
              ))}
            </div>
          </div>

          {/* Deal Breakers - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <AlertCircle size={18} className="mr-1.5" />
              Deal Breakers
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Factors that would eliminate a location
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {dealBreakerOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  label={option.label}
                  isSelected={formData.deal_breakers.includes(option.id)}
                  onClick={() => handleDealBreakerToggle(option.id)}
                />
              ))}
            </div>
          </div>

          {/* Summary Section - mb-4 */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Summary:</span>
              <div className="mt-1 text-xs space-y-1">
                <div>• Monthly budget: ${formData.monthly_budget}</div>
                <div>• Housing budget: ${Math.round(formData.monthly_budget * formData.housing_budget_percentage / 100)} ({formData.housing_budget_percentage}%)</div>
                {formData.housing_preference.length > 0 && (
                  <div>• Housing: {formData.housing_preference.join(', ')}</div>
                )}
                {formData.willing_to_compromise.length > 0 && (
                  <div>• Flexible on: {formData.willing_to_compromise.length} areas</div>
                )}
                {formData.deal_breakers.length > 0 && (
                  <div>• Deal breakers: {formData.deal_breakers.length} factors</div>
                )}
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mb-4 p-3 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="mr-2">
                <svg className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Pro Tip:</span> Consider both current costs and future inflation. Many retirees find that healthcare becomes a larger portion of their budget over time.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/onboarding/administration')}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-scout-accent-300 hover:bg-scout-accent-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}