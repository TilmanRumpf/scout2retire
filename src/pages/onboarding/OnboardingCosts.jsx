import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Home, Heart, Car, Lightbulb, Receipt, Plane, Train, MapPin, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

// Multi-Select Mobility Dropdown Component - styled to match HealthSelect from administration
const MobilityDropdown = ({ values = [], onChange, label, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle toggling individual options
  const handleToggle = (optionId) => {
    if (values.includes(optionId)) {
      onChange(values.filter(v => v !== optionId));
    } else {
      onChange([...values, optionId]);
    }
  };
  
  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };
  
  // Get display text for button
  const getDisplayText = () => {
    if (values.length === 0) return 'Select your preferences';
    const labels = values.map(v => options.find(opt => opt.id === v)?.label).filter(Boolean);
    if (labels.length <= 2) {
      return labels.join(', ');
    }
    // Show first two items and "..." for more
    return `${labels.slice(0, 2).join(', ')}...`;
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 sm:p-4 min-h-[70px] sm:min-h-[80px] ${uiConfig.layout.radius.lg} 
          border-2 ${uiConfig.animation.transition} text-left relative overflow-hidden cursor-pointer
          ${values.length > 0
            ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/30 hover:border-scout-accent-300 hover:shadow-md'
          }
          hover:-translate-y-0.5 active:scale-[0.98]
        `}
      >
        {/* Checkmark indicator like SelectionCard */}
        {values.length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-scout-accent-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        <div className={values.length > 0 ? 'pr-10' : 'pr-2'}>
          {/* Title with icon and label */}
          <div className={`${uiConfig.font.weight.medium} ${
            values.length > 0 ? 'text-scout-accent-700 dark:text-scout-accent-300' : uiConfig.colors.heading
          } text-sm sm:text-base flex items-center`}>
            {Icon && <Icon size={16} className="mr-2 flex-shrink-0" />}
            {label}
          </div>
          {/* Subtitle with selected items or prompt */}
          <div className={`text-xs mt-0.5 ${uiConfig.colors.hint} truncate`}>
            {values.length === 0 ? 'Select your preferences' : getDisplayText()}
          </div>
        </div>
      </button>
      
      {/* Dropdown menu with checkboxes */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 
            ${uiConfig.layout.radius.lg} border-2 border-gray-300 dark:border-gray-600 shadow-lg 
            max-h-60 overflow-y-auto`}>
            
            {/* Clear all option */}
            {values.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                  ${uiConfig.animation.transition} border-b border-gray-200 dark:border-gray-700`}
              >
                <div className="text-gray-500 dark:text-gray-400">Clear all</div>
              </button>
            )}
            
            {/* Options with checkboxes */}
            {options.map(opt => {
              const isSelected = values.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggle(opt.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 
                    ${uiConfig.animation.transition} ${isSelected ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20' : ''}`}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 mt-0.5 mr-3 border-2 rounded flex-shrink-0 ${uiConfig.animation.transition}
                      ${isSelected 
                        ? 'bg-scout-accent-500 border-scout-accent-500' 
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300 font-medium' : ''}`}>
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div className={`text-xs mt-0.5 ${uiConfig.colors.hint}`}>
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default function OnboardingCosts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    total_monthly_budget: [], // Now array for multi-select
    housing_preference: 'both', // 'rent', 'buy', or 'both'
    max_monthly_rent: [], // Now array for multi-select
    max_home_price: [], // Now array for multi-select
    monthly_healthcare_budget: 500, // Keep single select for healthcare
    mobility: {
      local: [], // Now arrays for multi-select
      regional: [],
      international: []
    },
    property_tax_sensitive: false,
    sales_tax_sensitive: false,
    income_tax_sensitive: false
  });
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'costs');

  // Budget tier options
  const budgetTiers = [
    { value: 1500, label: '$1,500-2,000', description: 'Budget' },
    { value: 2000, label: '$2,000-3,000', description: 'Moderate' },
    { value: 3000, label: '$3,000-4,000', description: 'Comfortable' },
    { value: 4000, label: '$4,000-5,000', description: 'Premium' },
    { value: 5000, label: '$5,000+', description: 'Luxury' }
  ];

  // Rent tier options
  const rentTiers = [
    { value: 500, label: '$500-750', description: 'Budget' },
    { value: 750, label: '$750-1,000', description: 'Moderate' },
    { value: 1000, label: '$1,000-1,500', description: 'Comfortable' },
    { value: 1500, label: '$1,500-2,000', description: 'Premium' },
    { value: 2000, label: '$2,000+', description: 'Luxury' }
  ];

  // Home price tier options
  const homePriceTiers = [
    { value: 100000, label: '$100k-200k', description: 'Budget' },
    { value: 200000, label: '$200k-300k', description: 'Moderate' },
    { value: 300000, label: '$300k-400k', description: 'Comfortable' },
    { value: 400000, label: '$400k-500k', description: 'Premium' },
    { value: 500000, label: '$500k+', description: 'Luxury' }
  ];

  // Healthcare budget tier options
  const healthcareTiers = [
    { value: 500, label: '$500-750', description: 'Basic' },
    { value: 750, label: '$750-1,000', description: 'Standard' },
    { value: 1000, label: '$1,000-1,250', description: 'Enhanced' },
    { value: 1250, label: '$1,250-1,500', description: 'Comprehensive' },
    { value: 1500, label: '$1,500+', description: 'Premium' }
  ];

  // Local Mobility options
  const localMobilityOptions = [
    { id: 'walk_bike', label: 'Walk/Bike', description: 'Walkable neighborhoods' },
    { id: 'public_transit', label: 'Public Transit', description: 'Bus/metro access' },
    { id: 'need_car', label: 'Own Vehicle', description: 'Car required' },
    { id: 'taxi_rideshare', label: 'Taxi/Rideshare', description: 'On-demand transport' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  // Regional Mobility options
  const regionalMobilityOptions = [
    { id: 'train_access', label: 'Train Access', description: 'Rail connections' },
    { id: 'bus_network', label: 'Bus Network', description: 'Regional buses' },
    { id: 'need_car', label: 'Own Vehicle', description: 'Car required' },
    { id: 'not_important', label: 'Not Important', description: 'Rarely travel regionally' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  // International Mobility options
  const intlMobilityOptions = [
    { id: 'major_airport', label: 'Major Airport', description: 'International hub nearby' },
    { id: 'regional_airport', label: 'Regional Airport', description: 'Domestic flights' },
    { id: 'train_connections', label: 'Train Connections', description: 'Cross-border rail' },
    { id: 'not_important', label: 'Not Important', description: 'Rarely travel internationally' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  // Housing preference options
  const housingPreferenceOptions = [
    { 
      id: 'rent', 
      label: 'Rent Only', 
      description: 'Looking to rent a home'
    },
    { 
      id: 'buy', 
      label: 'Buy Only', 
      description: 'Looking to purchase a home'
    },
    { 
      id: 'both', 
      label: 'Rent or Buy', 
      description: 'Open to both options'
    }
  ];

  // Tax options
  const taxOptions = [
    { 
      id: 'property_tax_sensitive', 
      label: 'Property Tax', 
      description: 'Prioritize lower property tax rates'
    },
    { 
      id: 'sales_tax_sensitive', 
      label: 'Sales Tax', 
      description: 'Prioritize lower sales tax rates'
    },
    { 
      id: 'income_tax_sensitive', 
      label: 'Income Tax', 
      description: 'Prioritize lower state income tax rates'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.user) {
          navigate('/welcome');
          return;
        }
        
        const progressResult = await getOnboardingProgress(userResult.user.id);
        if (progressResult.success) {
          if (progressResult.data && (progressResult.data.costs || progressResult.data.budget)) {
            const budgetData = progressResult.data.costs || progressResult.data.budget;
            console.log('Loading costs data:', budgetData);
            console.log('Mobility data loaded:', budgetData.mobility);
            
            setFormData(prev => ({ 
              ...prev, 
              ...budgetData,
              // Convert old single values to arrays if needed
              total_monthly_budget: Array.isArray(budgetData.total_monthly_budget) 
                ? budgetData.total_monthly_budget 
                : (budgetData.total_monthly_budget ? [budgetData.total_monthly_budget] : []),
              max_monthly_rent: Array.isArray(budgetData.max_monthly_rent)
                ? budgetData.max_monthly_rent
                : (budgetData.max_monthly_rent ? [budgetData.max_monthly_rent] : []),
              max_home_price: Array.isArray(budgetData.max_home_price)
                ? budgetData.max_home_price
                : (budgetData.max_home_price ? [budgetData.max_home_price] : []),
              mobility: {
                // Convert old string format to array, or use existing array
                local: Array.isArray(budgetData.mobility?.local) 
                  ? budgetData.mobility.local 
                  : (budgetData.mobility?.local ? [budgetData.mobility.local] : []),
                regional: Array.isArray(budgetData.mobility?.regional)
                  ? budgetData.mobility.regional
                  : (budgetData.mobility?.regional ? [budgetData.mobility.regional] : []),
                international: Array.isArray(budgetData.mobility?.international)
                  ? budgetData.mobility.international
                  : (budgetData.mobility?.international ? [budgetData.mobility.international] : [])
              },
              // Handle legacy need_car data
              need_car: undefined
            }));
            
            console.log('Form data after loading:', {
              mobility: {
                local: Array.isArray(budgetData.mobility?.local) 
                  ? budgetData.mobility.local 
                  : (budgetData.mobility?.local ? [budgetData.mobility.local] : []),
                regional: Array.isArray(budgetData.mobility?.regional)
                  ? budgetData.mobility.regional
                  : (budgetData.mobility?.regional ? [budgetData.mobility.regional] : []),
                international: Array.isArray(budgetData.mobility?.international)
                  ? budgetData.mobility.international
                  : (budgetData.mobility?.international ? [budgetData.mobility.international] : [])
              }
            });
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

  const handleBudgetSelect = (field, value) => {
    // For housing_preference, keep single select
    if (field === 'housing_preference') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      return;
    }
    
    // For budget fields, toggle multi-select
    setFormData(prev => {
      const currentValues = Array.isArray(prev[field]) ? prev[field] : [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [field]: isSelected 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleMobilityUpdate = (field, values) => {
    setFormData(prev => ({
      ...prev,
      mobility: {
        ...prev.mobility,
        [field]: values
      }
    }));
  };

  const handleTaxToggle = (taxType) => {
    setFormData(prev => ({
      ...prev,
      [taxType]: !prev[taxType]
    }));
  };

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/review');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      // Debug log to see what we're saving
      console.log('Saving costs data:', JSON.stringify(formData, null, 2));
      console.log('Mobility data being saved:', formData.mobility);
      
      const { success, error } = await saveOnboardingStep(userResult.user.id, formData, 'costs');
      
      if (!success) {
        toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
        return;
      }
      
      toast.success('Budget information saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'costs',
          formData
        );
        if (prefSuccess) {
          console.log('✅ Saved costs to user_preferences table');
        } else {
          console.error('❌ Failed to save costs to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving costs to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/review');
      }, 100);
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


  return (
    <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <form onSubmit={handleSubmit} className="py-6">
        {/* Pro Tip at top */}
        <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
          <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
          <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
            <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Select budget ranges that match your retirement plans. You can always adjust these later as your preferences evolve.
          </p>
        </div>
        
        {/* Total Monthly Budget - More compact */}
        <SelectionSection icon={DollarSign} title="Total Monthly Budget">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {budgetTiers.map((tier) => (
              <SelectionCard
                key={tier.value}
                title={tier.label}
                description={tier.description}
                isSelected={formData.total_monthly_budget?.includes(tier.value)}
                onClick={() => handleBudgetSelect('total_monthly_budget', tier.value)}
                size="small"
              />
            ))}
          </div>
        </SelectionSection>

        {/* Housing Costs */}
        <SelectionSection icon={Home} title="Housing Budget">
          {/* Housing Preference Selector */}
          <div className="mb-4">
            <h4 className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
              What are you looking for?
            </h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {housingPreferenceOptions.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.label}
                  description={option.description}
                  isSelected={formData.housing_preference === option.id}
                  onClick={() => handleBudgetSelect('housing_preference', option.id)}
                  size="small"
                />
              ))}
            </div>
          </div>

          {/* Maximum Monthly Rent - Show only if rent or both selected */}
          {(formData.housing_preference === 'rent' || formData.housing_preference === 'both') && (
            <div className="mb-4">
              <h4 className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
                Maximum Monthly Rent
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {rentTiers.map((tier) => (
                  <SelectionCard
                    key={tier.value}
                    title={tier.label}
                    description={tier.description}
                    isSelected={formData.max_monthly_rent?.includes(tier.value)}
                    onClick={() => handleBudgetSelect('max_monthly_rent', tier.value)}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Maximum Home Purchase Price - Show only if buy or both selected */}
          {(formData.housing_preference === 'buy' || formData.housing_preference === 'both') && (
            <div>
              <h4 className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
                Maximum Home Purchase Price
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {homePriceTiers.map((tier) => (
                  <SelectionCard
                    key={tier.value}
                    title={tier.label}
                    description={tier.description}
                    isSelected={formData.max_home_price?.includes(tier.value)}
                    onClick={() => handleBudgetSelect('max_home_price', tier.value)}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}
        </SelectionSection>

        {/* Healthcare Budget */}
        <SelectionSection icon={Heart} title="Monthly Healthcare Budget">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {healthcareTiers.map((tier) => (
              <SelectionCard
                key={tier.value}
                title={tier.label}
                description={tier.description}
                isSelected={findClosestTier(formData.monthly_healthcare_budget, healthcareTiers) === tier.value}
                onClick={() => handleBudgetSelect('monthly_healthcare_budget', tier.value)}
                size="small"
              />
            ))}
          </div>
        </SelectionSection>

        {/* Mobility Preferences - Using styled dropdowns like administration page */}
        <SelectionSection icon={Car} title="Transportation Preferences">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MobilityDropdown
              values={formData.mobility.local || []}
              onChange={(values) => handleMobilityUpdate('local', values)}
              label="Local Mobility"
              options={localMobilityOptions}
              icon={MapPin}
            />
            
            <MobilityDropdown
              values={formData.mobility.regional || []}
              onChange={(values) => handleMobilityUpdate('regional', values)}
              label="Regional Mobility"
              options={regionalMobilityOptions}
              icon={Train}
            />
            
            <MobilityDropdown
              values={formData.mobility.international || []}
              onChange={(values) => handleMobilityUpdate('international', values)}
              label="International Travel"
              options={intlMobilityOptions}
              icon={Plane}
            />
          </div>
        </SelectionSection>

        {/* Tax Sensitivity */}
        <SelectionSection icon={Receipt} title="Tax Considerations">
          <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3`}>
            Select which taxes are important to minimize in your retirement location
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {taxOptions.map((option) => (
              <SelectionCard
                key={option.id}
                title={option.label}
                description={option.description}
                isSelected={formData[option.id]}
                onClick={() => handleTaxToggle(option.id)}
                size="small"
              />
            ))}
          </div>
        </SelectionSection>

        {/* Summary Section */}
        <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
          <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
            <span className={`${uiConfig.font.weight.medium}`}>Your Preferences Summary:</span>
            <div className={`mt-2 ${uiConfig.font.size.xs} space-y-1`}>
              <div>• Total Budget: {formData.total_monthly_budget?.length > 0 
                ? formData.total_monthly_budget.map(v => budgetTiers.find(t => t.value === v)?.label).filter(Boolean).join(', ')
                : 'Not selected'}</div>
              <div>• Housing: {housingPreferenceOptions.find(o => o.id === formData.housing_preference)?.label || 'Not selected'}</div>
              {(formData.housing_preference === 'rent' || formData.housing_preference === 'both') && (
                <div>• Max Rent: {formData.max_monthly_rent?.length > 0
                  ? formData.max_monthly_rent.map(v => rentTiers.find(t => t.value === v)?.label).filter(Boolean).join(', ')
                  : 'Not selected'}</div>
              )}
              {(formData.housing_preference === 'buy' || formData.housing_preference === 'both') && (
                <div>• Max Home Price: {formData.max_home_price?.length > 0
                  ? formData.max_home_price.map(v => homePriceTiers.find(t => t.value === v)?.label).filter(Boolean).join(', ')
                  : 'Not selected'}</div>
              )}
              <div>• Healthcare: {healthcareTiers.find(t => t.value === formData.monthly_healthcare_budget)?.label || 'Not selected'}</div>
              {(formData.mobility.local?.length > 0 || formData.mobility.regional?.length > 0 || formData.mobility.international?.length > 0) && (
                <div>• Transportation: {[
                  formData.mobility.local?.length > 0 && `Local: ${formData.mobility.local.map(id => localMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`,
                  formData.mobility.regional?.length > 0 && `Regional: ${formData.mobility.regional.map(id => regionalMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`,
                  formData.mobility.international?.length > 0 && `Int'l: ${formData.mobility.international.map(id => intlMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`
                ].filter(Boolean).join('; ')}</div>
              )}
              {(formData.property_tax_sensitive || formData.sales_tax_sensitive || formData.income_tax_sensitive) && (
                <div>• Tax concerns: {[
                  formData.property_tax_sensitive && 'Property',
                  formData.sales_tax_sensitive && 'Sales',
                  formData.income_tax_sensitive && 'Income'
                ].filter(Boolean).join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
      <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
          <div className="flex items-center">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await autoSave();
                setLoading(false);
                navigate('/onboarding/administration');
              }}
              disabled={loading}
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
  );
}