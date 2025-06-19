import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Home, Heart, Car } from 'lucide-react';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  
  const [formData, setFormData] = useState({
    total_monthly_budget: 3000,
    max_monthly_rent: 1000,
    max_home_price: 300000,
    monthly_healthcare_budget: 800,
    need_car: [],
    property_tax_sensitive: false,
    sales_tax_sensitive: false,
    income_tax_sensitive: false
  });

  // Car need options
  const carOptions = [
    { value: 'yes', label: 'Yes', description: 'Need a car' },
    { value: 'no', label: 'No', description: 'No car needed' },
    { value: 'maybe', label: 'Maybe', description: 'Depends on location' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress } = await getOnboardingProgress(user.id);
        if (success) {
          setProgress(userProgress || { completedSteps: {} });
          // Fixed: Changed from data.costs to data.budget
          if (data && data.budget) {
            setFormData(prev => ({ 
              ...prev, 
              ...data.budget,
              need_car: data.budget.need_car || []
            }));
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleMultiSelect = (fieldName, value) => {
    setFormData(prev => {
      const current = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: current.includes(value) 
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
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
      
      // Fixed: Changed from 'costs' to 'budget' to match database key
      const { success, error } = await saveOnboardingStep(user.id, formData, 'budget');
      
      if (!success) {
        toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
        return;
      }
      
      toast.success('Budget information saved!');
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

  // Format currency (TODO: Add currency conversion based on user location)
  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  
  // Format home price for display
  const formatHomePrice = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
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
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Budget & Costs</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Set your budget limits for retirement locations
            </p>
          </div>

          {/* Total Monthly Budget Slider */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <DollarSign size={18} className="mr-1.5" />
              Total Monthly Budget
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Your total available monthly budget
            </p>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">$1,500</span>
                <span className="text-sm font-medium text-scout-accent-600 dark:text-scout-accent-400">
                  {formatCurrency(formData.total_monthly_budget)}{formData.total_monthly_budget >= 5000 && '+'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">$5,000+</span>
              </div>
              <input
                type="range"
                min="1500"
                max="5000"
                step="100"
                value={Math.min(formData.total_monthly_budget, 5000)}
                onChange={(e) => handleSliderChange('total_monthly_budget', e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.total_monthly_budget, 5000) - 1500) / 3500) * 100}%, #e5e7eb ${((Math.min(formData.total_monthly_budget, 5000) - 1500) / 3500) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Housing Costs */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Home size={18} className="mr-1.5" />
              Housing Budget
            </label>
            
            {/* Maximum Monthly Rent Slider */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Maximum monthly rent
            </p>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">$500</span>
                <span className="text-sm font-medium text-scout-accent-600 dark:text-scout-accent-400">
                  {formatCurrency(formData.max_monthly_rent)}{formData.max_monthly_rent >= 2000 && '+'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">$2,000+</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                step="50"
                value={Math.min(formData.max_monthly_rent, 2000)}
                onChange={(e) => handleSliderChange('max_monthly_rent', e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.max_monthly_rent, 2000) - 500) / 1500) * 100}%, #e5e7eb ${((Math.min(formData.max_monthly_rent, 2000) - 500) / 1500) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Maximum Home Purchase Price Slider */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Maximum home purchase price
            </p>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">$100k</span>
                <span className="text-sm font-medium text-scout-accent-600 dark:text-scout-accent-400">
                  {formatHomePrice(formData.max_home_price)}{formData.max_home_price >= 500000 && '+'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">$500k+</span>
              </div>
              <input
                type="range"
                min="100000"
                max="500000"
                step="10000"
                value={Math.min(formData.max_home_price, 500000)}
                onChange={(e) => handleSliderChange('max_home_price', e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.max_home_price, 500000) - 100000) / 400000) * 100}%, #e5e7eb ${((Math.min(formData.max_home_price, 500000) - 100000) / 400000) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Healthcare Budget Slider */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Heart size={18} className="mr-1.5" />
              Healthcare Budget
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Monthly healthcare budget including insurance
            </p>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">$500</span>
                <span className="text-sm font-medium text-scout-accent-600 dark:text-scout-accent-400">
                  {formatCurrency(formData.monthly_healthcare_budget)}{formData.monthly_healthcare_budget >= 1500 && '+'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">$1,500+</span>
              </div>
              <input
                type="range"
                min="500"
                max="1500"
                step="50"
                value={Math.min(formData.monthly_healthcare_budget, 1500)}
                onChange={(e) => handleSliderChange('monthly_healthcare_budget', e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.monthly_healthcare_budget, 1500) - 500) / 1000) * 100}%, #e5e7eb ${((Math.min(formData.monthly_healthcare_budget, 1500) - 500) / 1000) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Transportation */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Car size={18} className="mr-1.5" />
              Transportation Needs
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Will you need a car?
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {carOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.need_car.includes(option.value)}
                  onClick={() => handleMultiSelect('need_car', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Tax Sensitivity */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Tax Considerations
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Which taxes are important to minimize?
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="property_tax_sensitive"
                  type="checkbox"
                  checked={formData.property_tax_sensitive}
                  onChange={handleInputChange}
                  name="property_tax_sensitive"
                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                  style={{ 
                    accentColor: '#8fbc8f',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    backgroundColor: formData.property_tax_sensitive ? '#8fbc8f' : 'transparent',
                    border: formData.property_tax_sensitive ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundImage: formData.property_tax_sensitive 
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                      : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.15s ease-in-out'
                  }}
                />
                <label htmlFor="property_tax_sensitive" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  Property tax rates are important to me
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="sales_tax_sensitive"
                  type="checkbox"
                  checked={formData.sales_tax_sensitive}
                  onChange={handleInputChange}
                  name="sales_tax_sensitive"
                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                  style={{ 
                    accentColor: '#8fbc8f',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    backgroundColor: formData.sales_tax_sensitive ? '#8fbc8f' : 'transparent',
                    border: formData.sales_tax_sensitive ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundImage: formData.sales_tax_sensitive 
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                      : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.15s ease-in-out'
                  }}
                />
                <label htmlFor="sales_tax_sensitive" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  Sales tax rates are important to me
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="income_tax_sensitive"
                  type="checkbox"
                  checked={formData.income_tax_sensitive}
                  onChange={handleInputChange}
                  name="income_tax_sensitive"
                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                  style={{ 
                    accentColor: '#8fbc8f',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    backgroundColor: formData.income_tax_sensitive ? '#8fbc8f' : 'transparent',
                    border: formData.income_tax_sensitive ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundImage: formData.income_tax_sensitive 
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                      : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.15s ease-in-out'
                  }}
                />
                <label htmlFor="income_tax_sensitive" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  State income tax rates are important to me
                </label>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Budget Summary:</span>
              <div className="mt-1 text-xs space-y-1">
                <div>• Total monthly: {formatCurrency(formData.total_monthly_budget)}{formData.total_monthly_budget >= 5000 && '+'}</div>
                <div>• Max rent: {formatCurrency(formData.max_monthly_rent)}{formData.max_monthly_rent >= 2000 && '+'}</div>
                <div>• Max home price: {formatHomePrice(formData.max_home_price)}{formData.max_home_price >= 500000 && '+'}</div>
                <div>• Healthcare: {formatCurrency(formData.monthly_healthcare_budget)}{formData.monthly_healthcare_budget >= 1500 && '+'}/month</div>
                {formData.need_car.length > 0 && (
                  <div>• Transportation: {formData.need_car.join(', ')}</div>
                )}
                {(formData.property_tax_sensitive || formData.sales_tax_sensitive || formData.income_tax_sensitive) && (
                  <div>• Tax concerns: {[
                    formData.property_tax_sensitive && 'property',
                    formData.sales_tax_sensitive && 'sales',
                    formData.income_tax_sensitive && 'income'
                  ].filter(Boolean).join(', ')}</div>
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
                  <span className="font-medium">Pro Tip:</span> These budgets will be matched against actual costs in your home currency. Locations exceeding your budget will be filtered out.
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