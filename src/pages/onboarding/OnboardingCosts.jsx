import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Home, Heart, Car } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Option Button Component - Responsive for mobile and desktop
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${uiConfig.components.buttonSizes.default} lg:py-3 lg:px-4 xl:py-4 xl:px-5 ${uiConfig.layout.radius.md} lg:rounded-lg border-2 ${uiConfig.animation.transition} text-center ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${isSelected ? 'text-white' : uiConfig.colors.body}`}>{label}</div>
    {description && <div className={`${uiConfig.font.size.xs} lg:text-sm mt-0.5 lg:mt-1 ${isSelected ? 'text-white' : uiConfig.colors.hint}`}>{description}</div>}
  </button>
);

// Mobility Select Component - styled like dropdowns in other pages
const MobilitySelect = ({ value, onChange, label, options }) => (
  <div>
    <label className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} block mb-0.5 lg:mb-1`}>{label}</label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 text-xs sm:text-sm lg:text-base ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-0 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] lg:h-[52px] border-2 flex items-center text-center ${
        value 
          ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-300 dark:text-scout-accent-300 font-medium'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
      }`}
      style={{ lineHeight: '44px', paddingTop: '0', paddingBottom: '0' }}
    >
      <option value="">None</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function OnboardingCosts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  
  const [formData, setFormData] = useState({
    total_monthly_budget: 1500,
    max_monthly_rent: 500,
    max_home_price: 100000,
    monthly_healthcare_budget: 500,
    mobility: {
      local: '',
      regional: '',
      international: ''
    },
    property_tax_sensitive: false,
    sales_tax_sensitive: false,
    income_tax_sensitive: false
  });

  // Local Mobility options
  const localMobilityOptions = [
    { id: 'walk_bike', label: 'Walk/bike' },
    { id: 'public_transit', label: 'Public transit' },
    { id: 'need_car', label: 'Own Vehicle' },
    { id: 'taxi_rideshare', label: 'Taxi/rideshare' }
  ];

  // Regional Mobility options
  const regionalMobilityOptions = [
    { id: 'train_access', label: 'Train access' },
    { id: 'bus_network', label: 'Bus network' },
    { id: 'need_car', label: 'Own Vehicle' },
    { id: 'not_important', label: 'Not important' }
  ];

  // International Mobility options
  const intlMobilityOptions = [
    { id: 'major_airport', label: 'Major airport' },
    { id: 'regional_airport', label: 'Regional airport' },
    { id: 'train_connections', label: 'Train connections' },
    { id: 'not_important', label: 'Not important' }
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
          // FIXED: Check for both 'costs' and 'budget' for backward compatibility
          if (data && (data.costs || data.budget)) {
            const budgetData = data.costs || data.budget;
            setFormData(prev => ({ 
              ...prev, 
              ...budgetData,
              mobility: budgetData.mobility || {
                local: '',
                regional: '',
                international: ''
              },
              // Handle legacy need_car data
              need_car: undefined
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

    const handleMobilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      mobility: {
        ...prev.mobility,
        [field]: value
      }
    }));
  };

  const handleSkip = () => {
    navigate('/onboarding/review');
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
      
      // FIXED: Changed from 'budget' to 'costs' to match database expectation
      const { success, error } = await saveOnboardingStep(user.id, formData, 'costs');
      
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
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
    <>
      
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Total Monthly Budget Slider */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <DollarSign size={16} className="mr-1.5 lg:mr-2" />
              Total Monthly Budget
            </label>
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
              Your total available monthly budget
            </p>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$1,500</span>
                <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.success}`}>
                  {formatCurrency(formData.total_monthly_budget)}{formData.total_monthly_budget >= 5000 && '+'}
                </span>
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$5,000+</span>
              </div>
              <input
                type="range"
                min="1500"
                max="5000"
                step="100"
                value={Math.min(formData.total_monthly_budget, 5000)}
                onChange={(e) => handleSliderChange('total_monthly_budget', e.target.value)}
                className={`w-full h-1.5 ${uiConfig.progress.track} ${uiConfig.layout.radius.lg} appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer`}
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.total_monthly_budget, 5000) - 1500) / 3500) * 100}%, #e5e7eb ${((Math.min(formData.total_monthly_budget, 5000) - 1500) / 3500) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Housing Costs */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Home size={16} className="mr-1.5 lg:mr-2" />
              Housing Budget
            </label>
            
            {/* Maximum Monthly Rent Slider */}
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-2 lg:mb-3`}>
              Maximum monthly rent
            </p>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$500</span>
                <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.success}`}>
                  {formatCurrency(formData.max_monthly_rent)}{formData.max_monthly_rent >= 2000 && '+'}
                </span>
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$2,000+</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                step="50"
                value={Math.min(formData.max_monthly_rent, 2000)}
                onChange={(e) => handleSliderChange('max_monthly_rent', e.target.value)}
                className={`w-full h-1.5 ${uiConfig.progress.track} ${uiConfig.layout.radius.lg} appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer`}
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.max_monthly_rent, 2000) - 500) / 1500) * 100}%, #e5e7eb ${((Math.min(formData.max_monthly_rent, 2000) - 500) / 1500) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Maximum Home Purchase Price Slider */}
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-2 lg:mb-3`}>
              Maximum home purchase price
            </p>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$100k</span>
                <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.success}`}>
                  {formatHomePrice(formData.max_home_price)}{formData.max_home_price >= 500000 && '+'}
                </span>
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$500k+</span>
              </div>
              <input
                type="range"
                min="100000"
                max="500000"
                step="10000"
                value={Math.min(formData.max_home_price, 500000)}
                onChange={(e) => handleSliderChange('max_home_price', e.target.value)}
                className={`w-full h-1.5 ${uiConfig.progress.track} ${uiConfig.layout.radius.lg} appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer`}
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.max_home_price, 500000) - 100000) / 400000) * 100}%, #e5e7eb ${((Math.min(formData.max_home_price, 500000) - 100000) / 400000) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Healthcare Budget Slider */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Heart size={16} className="mr-1.5 lg:mr-2" />
              Healthcare Budget
            </label>
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
              Monthly healthcare budget including insurance
            </p>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$500</span>
                <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.success}`}>
                  {formatCurrency(formData.monthly_healthcare_budget)}{formData.monthly_healthcare_budget >= 1500 && '+'}
                </span>
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>$1,500+</span>
              </div>
              <input
                type="range"
                min="500"
                max="1500"
                step="50"
                value={Math.min(formData.monthly_healthcare_budget, 1500)}
                onChange={(e) => handleSliderChange('monthly_healthcare_budget', e.target.value)}
                className={`w-full h-1.5 ${uiConfig.progress.track} ${uiConfig.layout.radius.lg} appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer`}
                style={{
                  background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${((Math.min(formData.monthly_healthcare_budget, 1500) - 500) / 1000) * 100}%, #e5e7eb ${((Math.min(formData.monthly_healthcare_budget, 1500) - 500) / 1000) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Mobility Preferences */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Car size={16} className="mr-1.5 lg:mr-2" />
              Mobility Preferences
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              {/* Local Mobility */}
              <MobilitySelect
                value={formData.mobility.local || ''}
                onChange={(e) => handleMobilityChange('local', e.target.value)}
                label="Local Mobility"
                options={localMobilityOptions}
              />
              
              {/* Regional Mobility */}
              <MobilitySelect
                value={formData.mobility.regional || ''}
                onChange={(e) => handleMobilityChange('regional', e.target.value)}
                label="Regional Mobility"
                options={regionalMobilityOptions}
              />
              
              {/* International Mobility */}
              <MobilitySelect
                value={formData.mobility.international || ''}
                onChange={(e) => handleMobilityChange('international', e.target.value)}
                label="Int'l Mobility"
                options={intlMobilityOptions}
              />
            </div>
          </div>

          {/* Tax Sensitivity */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
              Tax Considerations
            </label>
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
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
                <label htmlFor="property_tax_sensitive" className={`ml-2 ${uiConfig.font.size.xs} ${uiConfig.colors.body} cursor-pointer`}>
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
                <label htmlFor="sales_tax_sensitive" className={`ml-2 ${uiConfig.font.size.xs} ${uiConfig.colors.body} cursor-pointer`}>
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
                <label htmlFor="income_tax_sensitive" className={`ml-2 ${uiConfig.font.size.xs} ${uiConfig.colors.body} cursor-pointer`}>
                  State income tax rates are important to me
                </label>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
            <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Budget Summary:</span>
              <div className={`mt-1 ${uiConfig.font.size.xs} space-y-1`}>
                <div>• Total monthly: {formatCurrency(formData.total_monthly_budget)}{formData.total_monthly_budget >= 5000 && '+'}</div>
                <div>• Max rent: {formatCurrency(formData.max_monthly_rent)}{formData.max_monthly_rent >= 2000 && '+'}</div>
                <div>• Max home price: {formatHomePrice(formData.max_home_price)}{formData.max_home_price >= 500000 && '+'}</div>
                <div>• Healthcare: {formatCurrency(formData.monthly_healthcare_budget)}{formData.monthly_healthcare_budget >= 1500 && '+'}/month</div>
                {(formData.mobility.local || formData.mobility.regional || formData.mobility.international) && (
                  <div>• Mobility: {[
                    formData.mobility.local && localMobilityOptions.find(o => o.id === formData.mobility.local)?.label,
                    formData.mobility.regional && regionalMobilityOptions.find(o => o.id === formData.mobility.regional)?.label,
                    formData.mobility.international && intlMobilityOptions.find(o => o.id === formData.mobility.international)?.label
                  ].filter(Boolean).join(', ')}</div>
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
          <ProTip>
            These budgets will be matched against actual costs in your home currency. Locations exceeding your budget will be filtered out.
          </ProTip>

          {/* Remove inline navigation - will be replaced outside form */}
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => navigate('/onboarding/administration')}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={uiConfig.components.buttonPrimary}
              >
                {loading ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}