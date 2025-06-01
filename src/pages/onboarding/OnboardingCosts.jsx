import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

export default function OnboardingCosts() {
  const [formData, setFormData] = useState({
    monthly_budget: 2000,
    housing_preference: 'rent', // rent, buy, either
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
        
        const { success, data, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // If cost data exists, load it
        if (data && data.budget) {
          setFormData(data.budget);
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const arrayName = name.split('.')[0];
      const arrayValue = name.split('.')[1];
      
      setFormData(prev => {
        const currentArray = [...(prev[arrayName] || [])];
        
        if (checked) {
          if (!currentArray.includes(arrayValue)) {
            currentArray.push(arrayValue);
          }
        } else {
          const index = currentArray.indexOf(arrayValue);
          if (index !== -1) {
            currentArray.splice(index, 1);
          }
        }
        
        return {
          ...prev,
          [arrayName]: currentArray
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
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
        'budget'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Budget preferences saved!');
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
        <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Cost category options for priorities
  const costCategories = [
    { id: 'food', label: 'Food & Dining' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'entertainment', label: 'Entertainment & Activities' },
    { id: 'transportation', label: 'Transportation' },
    { id: 'utilities', label: 'Utilities & Services' }
  ];

  // Options for compromise and deal breakers
  const costFactors = [
    { id: 'high_food', label: 'High food costs' },
    { id: 'high_healthcare', label: 'Expensive healthcare' },
    { id: 'high_rent', label: 'High housing costs' },
    { id: 'high_taxes', label: 'High taxes' },
    { id: 'expensive_utilities', label: 'Expensive utilities' },
    { id: 'high_transportation', label: 'Expensive transportation' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/hobbies')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full ${
                    step === 6
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 6
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Budget & Costs</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Help us understand your budget preferences for retirement.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Budget (USD)
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="monthly_budget"
                min="500"
                max="10000"
                step="100"
                value={formData.monthly_budget}
                onChange={handleInputChange}
                className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 py-3 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your total monthly budget for all expenses.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Housing Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'rent', label: 'Rent' },
                { value: 'buy', label: 'Buy' },
                { value: 'either', label: 'Either' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, housing_preference: option.value })}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.housing_preference === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Housing Budget (% of total)
            </label>
            <input
              type="range"
              name="housing_budget_percentage"
              min="10"
              max="70"
              step="5"
              value={formData.housing_budget_percentage}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10%</span>
              <span>{formData.housing_budget_percentage}%</span>
              <span>70%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Approximate percentage of your budget allocated to housing.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Cost Priorities (1-5 scale)
            </label>
            <div className="space-y-4">
              {costCategories.map((category) => (
                <div key={category.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formData.cost_priorities[category.id]} / 5
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handlePriorityChange(category.id, value)}
                        className={`flex-1 py-2 rounded-md ${
                          formData.cost_priorities[category.id] === value
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Rate how important each category is to you (1 = least important, 5 = most important).
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Willing to Compromise On
            </label>
            <div className="grid grid-cols-1 gap-2">
              {costFactors.map((factor) => (
                <div key={factor.id} className="flex items-center">
                  <input
                    id={`compromise.${factor.id}`}
                    name={`willing_to_compromise.${factor.id}`}
                    type="checkbox"
                    checked={formData.willing_to_compromise.includes(factor.id)}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`compromise.${factor.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {factor.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select areas where you're willing to spend more if necessary.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deal Breakers
            </label>
            <div className="grid grid-cols-1 gap-2">
              {costFactors.map((factor) => (
                <div key={factor.id} className="flex items-center">
                  <input
                    id={`dealbreaker.${factor.id}`}
                    name={`deal_breakers.${factor.id}`}
                    type="checkbox"
                    checked={formData.deal_breakers.includes(factor.id)}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`dealbreaker.${factor.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {factor.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select cost factors that would eliminate a location from consideration.
            </p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}