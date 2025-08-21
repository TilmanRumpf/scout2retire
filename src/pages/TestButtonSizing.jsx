import React, { useState } from 'react';
import { Calendar, Users, Globe, PawPrint, Lightbulb } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../components/onboarding/SelectionCard';

export default function TestButtonSizing() {
  const [selections, setSelections] = useState({
    retirement_status: '',
    family_situation: '',
    citizenship: '',
    pet_owner: []
  });

  const handleRetirementStatusChange = (status) => {
    setSelections(prev => ({
      ...prev,
      retirement_status: status
    }));
  };

  const handleFamilyStatusChange = (status) => {
    setSelections(prev => ({
      ...prev,
      family_situation: status
    }));
  };

  const handleCitizenshipChange = (citizenship) => {
    setSelections(prev => ({
      ...prev,
      citizenship: citizenship
    }));
  };

  const handlePetChange = (petType) => {
    setSelections(prev => ({
      ...prev,
      pet_owner: (prev.pet_owner || []).includes(petType)
        ? (prev.pet_owner || []).filter(p => p !== petType)
        : [...(prev.pet_owner || []), petType]
    }));
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Button Sizing Test - OnboardingCurrentStatus</h1>
          
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Testing button consistency across different viewport sizes.
            </p>
          </div>
          
          {/* Retirement Status */}
          <SelectionSection icon={Calendar} title="Retirement Timeline">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Where are you in your retirement journey?
            </p>
            <SelectionGrid>
              <SelectionCard
                title="Planning"
                description="5+ years away"
                isSelected={selections.retirement_status === 'planning'}
                onClick={() => handleRetirementStatusChange('planning')}
              />
              <SelectionCard
                title="Retiring Soon"
                description="Within 5 years"
                isSelected={selections.retirement_status === 'retiring_soon'}
                onClick={() => handleRetirementStatusChange('retiring_soon')}
              />
              <SelectionCard
                title="Retired"
                description="Living the dream"
                isSelected={selections.retirement_status === 'already_retired'}
                onClick={() => handleRetirementStatusChange('already_retired')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Family Situation */}
          <SelectionSection icon={Users} title="Family Situation">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Who's joining you on this adventure? *
            </p>
            <SelectionGrid>
              <SelectionCard
                title="Solo"
                description="Just me"
                isSelected={selections.family_situation === 'solo'}
                onClick={() => handleFamilyStatusChange('solo')}
              />
              <SelectionCard
                title="Couple"
                description="Me & partner"
                isSelected={selections.family_situation === 'couple'}
                onClick={() => handleFamilyStatusChange('couple')}
              />
              <SelectionCard
                title="Family"
                description="With dependents"
                isSelected={selections.family_situation === 'family'}
                onClick={() => handleFamilyStatusChange('family')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Citizenship Options */}
          <SelectionSection icon={Globe} title="Citizenship">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              What's your primary citizenship?
            </p>
            <SelectionGrid>
              <SelectionCard
                title="United States"
                description="US Citizen"
                isSelected={selections.citizenship === 'us'}
                onClick={() => handleCitizenshipChange('us')}
              />
              <SelectionCard
                title="United Kingdom"
                description="UK Citizen"
                isSelected={selections.citizenship === 'uk'}
                onClick={() => handleCitizenshipChange('uk')}
              />
              <SelectionCard
                title="Other"
                description="Other country"
                isSelected={selections.citizenship === 'other'}
                onClick={() => handleCitizenshipChange('other')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Pet Owner */}
          <SelectionSection icon={PawPrint} title="Pet Owner">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Do you have any pets?
            </p>
            <SelectionGrid>
              <SelectionCard
                title="Cat"
                description="Feline friend"
                isSelected={selections.pet_owner?.includes('cat') || false}
                onClick={() => handlePetChange('cat')}
              />
              <SelectionCard
                title="Dog"
                description="Canine companion"
                isSelected={selections.pet_owner?.includes('dog') || false}
                onClick={() => handlePetChange('dog')}
              />
              <SelectionCard
                title="Other"
                description="Different pet"
                isSelected={selections.pet_owner?.includes('other') || false}
                onClick={() => handlePetChange('other')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Test with different button configurations */}
          <SelectionSection icon={Calendar} title="Button Size Testing">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Testing buttons with various text lengths to check for sizing consistency.
            </p>
            
            {/* Grid with 2 columns */}
            <SelectionGrid columns="two">
              <SelectionCard
                title="Short"
                description="Brief"
                isSelected={false}
                onClick={() => {}}
              />
              <SelectionCard
                title="Medium Length Title"
                description="Moderate description text"
                isSelected={false}
                onClick={() => {}}
              />
            </SelectionGrid>
            
            <div className="mt-4">
              {/* Grid with 3 columns (default) */}
              <SelectionGrid>
                <SelectionCard
                  title="A"
                  description="Tiny"
                  isSelected={false}
                  onClick={() => {}}
                />
                <SelectionCard
                  title="Very Long Button Title That Might Wrap"
                  description="Extended description that could cause layout issues"
                  isSelected={true}
                  onClick={() => {}}
                />
                <SelectionCard
                  title="Normal"
                  description="Regular length"
                  isSelected={false}
                  onClick={() => {}}
                />
              </SelectionGrid>
            </div>
            
            <div className="mt-4">
              {/* Grid with 4 columns */}
              <SelectionGrid columns="four">
                <SelectionCard
                  title="1"
                  isSelected={false}
                  onClick={() => {}}
                />
                <SelectionCard
                  title="2"
                  description="Two"
                  isSelected={true}
                  onClick={() => {}}
                />
                <SelectionCard
                  title="3"
                  description="Three"
                  isSelected={false}
                  onClick={() => {}}
                />
                <SelectionCard
                  title="4"
                  description="Four"
                  isSelected={false}
                  onClick={() => {}}
                />
              </SelectionGrid>
            </div>
          </SelectionSection>

          {/* Summary */}
          <div className={`mt-6 p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
            <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Current Selections:</span>
              <div className={`mt-1 ${uiConfig.font.size.xs}`}>
                Retirement: {selections.retirement_status || 'None'} • 
                Family: {selections.family_situation || 'None'} • 
                Citizenship: {selections.citizenship || 'None'} • 
                Pets: {selections.pet_owner?.join(', ') || 'None'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}