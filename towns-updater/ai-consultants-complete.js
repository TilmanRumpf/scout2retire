// Complete AI Consultant System for Scout2Retire
// Citizenship-aware consultants for comprehensive town data

export const SUPPORTED_CITIZENSHIPS = [
  'US', 'UK', 'Canada', 'Australia', 'EU', 'Other'
]

export const AI_CONSULTANTS = {
  // 1. RETIREMENT LIFESTYLE CONSULTANT
  retirement: {
    persona: `You are a seasoned retirement consultant with 20 years of experience helping retirees find their perfect destinations. You've personally lived in and guided tours in each town, understanding the day-to-day realities of expat life.`,
    
    prompts: {
      description: (town, citizenship) => `As a retirement consultant who has lived in ${town.name}, ${town.country}, write a compelling 2-3 sentence description that captures what makes this town special for retirees. Focus on unique qualities that set it apart.`,
      
      lifestyle_description: (town, citizenship) => `Based on your experience living in ${town.name}, describe the lifestyle in 3-4 sentences. Cover daily rhythm, social scene, cultural offerings, and what a typical week looks like for an expat retiree.`,
      
      pace_of_life: (town, citizenship) => `Rate the pace of life in ${town.name} on a scale of 1-10 (1=very slow/relaxed, 10=fast-paced/bustling). Give just the number.`,
      
      expat_community_size: (town, citizenship) => `Estimate the expat community size in ${town.name}: "None", "Small", "Medium", "Large", or "Very Large".`,
      
      cultural_rating: (town, citizenship) => `Rate the cultural richness of ${town.name} for retirees on a scale of 1-10. Consider museums, concerts, festivals, and cultural activities. Give just the number.`,
      
      social_atmosphere: (town, citizenship) => `Describe the social atmosphere in ${town.name} in 2 sentences. Is it easy to make friends? Are locals welcoming to expats?`
    }
  },
  
  // 2. IMMIGRATION & VISA CONSULTANT
  immigration: {
    persona: `You are an immigration attorney with 15 years specializing in retirement and expat visas. You have deep knowledge of visa requirements, residency paths, and immigration procedures for every country, and understand how these differ based on citizenship.`,
    
    prompts: {
      visa_requirements: (town, citizenship) => `As an immigration expert, summarize in 2-3 sentences the visa requirements for ${citizenship} citizens wanting to retire in ${town.name}, ${town.country}. Be specific to ${citizenship} passport holders.`,
      
      residency_path_info: (town, citizenship) => `Explain in 2-3 sentences the path to permanent residency in ${town.country} specifically for ${citizenship} citizens, including timeline and key requirements.`,
      
      min_income_requirement_usd: (town, citizenship) => `What is the minimum monthly income requirement in USD for a ${citizenship} citizen to get a retirement visa in ${town.country}? Give just the number or "0" if none.`,
      
      retirement_visa_available: (town, citizenship) => `Does ${town.country} offer a specific retirement visa program for ${citizenship} citizens? Answer just "true" or "false".`,
      
      visa_on_arrival_days: (town, citizenship) => `How many days can ${citizenship} citizens stay in ${town.country} without a visa or with visa on arrival? Give just the number or "0" if visa required in advance.`,
      
      digital_nomad_visa: (town, citizenship) => `Does ${town.country} offer a digital nomad visa that ${citizenship} citizens can use? Answer just "true" or "false".`
    }
  },
  
  // 3. INTERNATIONAL TAX CONSULTANT
  tax: {
    persona: `You are an international tax advisor with expertise in expat taxation, specializing in helping retirees optimize their tax situation across different countries. You understand tax treaties, foreign income rules, and retirement income taxation.`,
    
    prompts: {
      tax_implications: (town, citizenship) => `As a tax expert, summarize in 2-3 sentences the key tax considerations for ${citizenship} citizen retirees living in ${town.name}, ${town.country}, including any relevant tax treaties and how retirement income is taxed.`,
      
      income_tax_rate_pct: (town, citizenship) => `What is the typical income tax rate percentage for ${citizenship} retiree's pension income in ${town.country}? Give just the number.`,
      
      tax_treaty_exists: (town, citizenship) => `Does ${town.country} have a tax treaty with ${citizenship === 'US' ? 'the United States' : citizenship} that benefits retirees? Answer just "true" or "false".`,
      
      foreign_income_taxed: (town, citizenship) => `Will ${citizenship} citizens' foreign pension/retirement income be taxed in ${town.country}? Answer "Yes", "No", or "Depends on tax treaty".`,
      
      wealth_tax_exists: (town, citizenship) => `Does ${town.country} have a wealth tax that would apply to ${citizenship} citizen retirees? Answer just "true" or "false".`,
      
      tax_residency_days: (town, citizenship) => `How many days per year triggers tax residency in ${town.country}? Give just the number.`
    }
  },
  
  // 4. HEALTHCARE SYSTEMS CONSULTANT
  healthcare: {
    persona: `You are a healthcare consultant specializing in international medical systems, with deep knowledge of healthcare quality, costs, and accessibility for expats in different countries. You've evaluated hospitals and clinics worldwide and understand how citizenship affects healthcare access.`,
    
    prompts: {
      healthcare_description: (town, citizenship) => `As a healthcare expert, describe in 2-3 sentences the healthcare quality and accessibility for ${citizenship} retirees in ${town.name}, including English-speaking doctor availability and typical costs.`,
      
      healthcare_score: (town, citizenship) => `Rate the overall healthcare quality in ${town.name} for ${citizenship} retirees on a scale of 1-10. Give just the number.`,
      
      public_healthcare_eligible: (town, citizenship) => `Are ${citizenship} citizen retirees eligible for public healthcare in ${town.country}? Answer "Yes immediately", "Yes after residency period", "No", or "EU reciprocal rights only".`,
      
      health_insurance_cost: (town, citizenship) => `What is the typical monthly health insurance cost in USD for a 65-year-old ${citizenship} citizen in ${town.name}? Give a range like "100-200".`,
      
      english_speaking_doctors: (town, citizenship) => `How available are English-speaking doctors in ${town.name}? Answer: "None", "Few", "Some", "Many", or "Abundant".`,
      
      medical_specialties_available: (town, citizenship) => `List the main medical specialties with good availability in ${town.name} (e.g., "Cardiology, Oncology, Orthopedics"). Maximum 5 specialties.`,
      
      prescription_drug_costs: (town, citizenship) => `How do prescription drug costs in ${town.name} compare to the ${citizenship === 'US' ? 'US' : citizenship}? Answer "Much cheaper", "Somewhat cheaper", "Similar", or "More expensive".`
    }
  },
  
  // 5. REAL ESTATE & HOUSING CONSULTANT
  realEstate: {
    persona: `You are a real estate consultant with expertise in international property markets, specializing in helping retirees find suitable housing. You understand rental markets, purchase regulations for foreigners, and property trends.`,
    
    prompts: {
      infrastructure_description: (town, citizenship) => `As a real estate expert, describe in 2-3 sentences the housing market and infrastructure in ${town.name} from a ${citizenship} retiree's perspective.`,
      
      foreign_ownership_allowed: (town, citizenship) => `Can ${citizenship} citizens purchase property in ${town.country}? Answer "Yes", "Yes with restrictions", or "No".`,
      
      property_purchase_process: (town, citizenship) => `Briefly describe in 2 sentences the process for a ${citizenship} citizen to buy property in ${town.name}, including any restrictions.`,
      
      rental_market_description: (town, citizenship) => `Describe the rental market in ${town.name} for ${citizenship} retirees in 2 sentences. Include availability and typical lease terms.`,
      
      property_taxes_annual: (town, citizenship) => `What is the typical annual property tax rate in ${town.name} as a percentage of property value? Give just the number.`,
      
      utilities_reliability: (town, citizenship) => `Rate the reliability of utilities (electricity, water, internet) in ${town.name} on a scale of 1-10. Give just the number.`,
      
      neighborhoods_recommended: (town, citizenship) => `Name 2-3 neighborhoods in ${town.name} that are popular with expat retirees, with a brief reason for each.`
    }
  },
  
  // 6. VETERINARY & PET RELOCATION CONSULTANT
  veterinary: {
    persona: `You are an international veterinary consultant with 20 years experience in pet relocation and international animal health. You specialize in helping expats navigate pet importation rules and understand local health risks for their animals.`,
    
    prompts: {
      pet_import_requirements: (town, citizenship) => `As a veterinary expert, summarize in 3-4 sentences the requirements for ${citizenship} citizens to import dogs and cats to ${town.country}. Include quarantine rules, vaccinations, and documentation needed.`,
      
      pet_import_restrictions: (town, citizenship) => `List any breed restrictions or banned animals in ${town.country}. Be specific about which dog breeds are prohibited or restricted.`,
      
      local_pet_diseases: (town, citizenship) => `What endemic diseases or parasites in ${town.name} pose risks to pets? List the top 3-4 health threats to dogs and cats, including prevention measures.`,
      
      pet_healthcare_quality: (town, citizenship) => `Describe the quality and availability of veterinary care in ${town.name} in 2 sentences. Include typical costs and availability of emergency services.`,
      
      pet_friendly_rating: (town, citizenship) => `Rate how pet-friendly ${town.name} is for retirees with pets on a scale of 1-10. Consider housing, public spaces, and general attitude toward pets. Give just the number.`,
      
      pet_costs_monthly: (town, citizenship) => `Estimate the average monthly cost in USD for maintaining a medium-sized dog in ${town.name}, including food, routine vet care, and supplies. Give a range like "50-100".`,
      
      pet_travel_requirements: (town, citizenship) => `What are the requirements for traveling with pets FROM ${town.country} to other EU countries or back to ${citizenship === 'US' ? 'the US' : citizenship}? Cover pet passports and health certificates in 2 sentences.`
    }
  },
  
  // 7. CLIMATE & ENVIRONMENT CONSULTANT
  climate: {
    persona: `You are a climate and environmental consultant specializing in how weather and environmental factors affect retiree quality of life. You understand seasonal patterns, natural disaster risks, and climate-related health considerations.`,
    
    prompts: {
      climate_description: (town, citizenship) => `Describe ${town.name}'s climate throughout the year in 2-3 sentences, focusing on what ${citizenship} retirees would experience. Include any extreme weather considerations.`,
      
      climate_comparison: (town, citizenship) => {
        const climateComparisons = {
          'US': 'Compare to popular US retirement destinations like Florida or Arizona',
          'UK': 'Compare to the UK climate',
          'Canada': 'Compare to Canadian climate',
          'Australia': 'Compare to Australian climate',
          'EU': 'Compare to Central European climate'
        }
        return `How does ${town.name}'s climate compare to what ${citizenship} retirees are used to? ${climateComparisons[citizenship] || 'Compare to their home climate'}.`
      },
      
      air_quality_assessment: (town, citizenship) => `Assess the air quality in ${town.name} for retirees with respiratory concerns. Include pollution levels and seasonal variations in 2 sentences.`,
      
      natural_disaster_risk: (town, citizenship) => `What natural disaster risks exist in ${town.name}? List any significant risks (earthquakes, floods, fires, etc.) and their likelihood.`,
      
      climate_health_impact: (town, citizenship) => `How might ${town.name}'s climate affect common retiree health conditions (arthritis, respiratory issues, etc.)? Provide assessment in 2 sentences.`,
      
      best_seasons: (town, citizenship) => `What are the best and worst seasons for ${citizenship} retirees in ${town.name}? Explain briefly in 2 sentences.`
    }
  },
  
  // 8. SOCIAL & CULTURAL INTEGRATION CONSULTANT
  cultural: {
    persona: `You are a cultural integration specialist who helps expats navigate social customs, language barriers, and cultural adaptation. You have deep knowledge of local customs and expat integration challenges.`,
    
    prompts: {
      language_barrier_assessment: (town, citizenship) => `How challenging is the language barrier in ${town.name} for English-speaking ${citizenship} retirees? Assess in 2 sentences including local English proficiency.`,
      
      cultural_adaptation_challenges: (town, citizenship) => `What are the main cultural adaptation challenges ${citizenship} retirees face in ${town.name}? List 2-3 key challenges with brief explanations.`,
      
      social_integration_ease: (town, citizenship) => `Rate how easy it is for ${citizenship} retirees to integrate socially in ${town.name} on a scale of 1-10. Give just the number.`,
      
      expat_support_resources: (town, citizenship) => `What expat support resources exist in ${town.name} for ${citizenship} retirees? List key organizations, groups, or services in 2 sentences.`,
      
      local_customs_important: (town, citizenship) => `What 2-3 local customs or cultural norms should ${citizenship} retirees be aware of in ${town.name} to avoid cultural faux pas?`,
      
      religious_considerations: (town, citizenship) => `Are there any religious or cultural considerations that might affect ${citizenship} retirees in ${town.name}? Explain briefly.`
    }
  },
  
  // 9. SAFETY & SECURITY CONSULTANT
  safety: {
    persona: `You are a security consultant specializing in expat safety, with expertise in crime patterns, scam prevention, and emergency preparedness for retirees living abroad.`,
    
    prompts: {
      safety_description: (town, citizenship) => `As a security expert, assess the safety of ${town.name} for ${citizenship} retirees in 2-3 sentences. Cover crime levels, areas to avoid, and specific risks for older expats.`,
      
      crime_types_common: (town, citizenship) => `What types of crime are most common in ${town.name} that might affect ${citizenship} retirees? List 2-3 with prevention tips.`,
      
      scam_risks: (town, citizenship) => `What scams specifically target ${citizenship} expat retirees in ${town.name}? Describe 1-2 common scams and how to avoid them.`,
      
      emergency_services_quality: (town, citizenship) => `Rate the quality and responsiveness of emergency services (police, fire, ambulance) in ${town.name} on a scale of 1-10. Give just the number.`,
      
      safety_precautions: (town, citizenship) => `What specific safety precautions should ${citizenship} retirees take in ${town.name}? Provide 2-3 practical recommendations.`,
      
      safe_neighborhoods: (town, citizenship) => `Which neighborhoods in ${town.name} are safest for ${citizenship} retirees? Name 2-3 areas with brief explanations.`
    }
  },
  
  // 10. FINANCIAL SERVICES CONSULTANT
  financial: {
    persona: `You are an international banking and financial services consultant who helps expats manage their finances across borders, understanding banking regulations, currency exchange, and financial access for foreigners.`,
    
    prompts: {
      banking_ease: (town, citizenship) => `How easy is it for ${citizenship} retirees to open bank accounts and access financial services in ${town.name}? Describe in 2 sentences including any restrictions.`,
      
      currency_considerations: (town, citizenship) => `What currency and exchange rate considerations should ${citizenship} retirees be aware of in ${town.country}? Include stability and conversion costs in 2 sentences.`,
      
      atm_credit_card_access: (town, citizenship) => `How accessible are ATMs and how widely accepted are international credit cards in ${town.name}? Rate accessibility for ${citizenship} retirees.`,
      
      money_transfer_options: (town, citizenship) => `What are the best options for ${citizenship} retirees to transfer money to/from ${town.country}? List 2-3 methods with typical costs.`,
      
      local_banking_requirements: (town, citizenship) => `What documents do ${citizenship} retirees need to open a bank account in ${town.name}? List key requirements.`,
      
      financial_scam_protection: (town, citizenship) => `What financial protections exist for ${citizenship} retirees' bank accounts and investments in ${town.country}? Explain briefly.`
    }
  }
}

// Helper function to get appropriate consultant for a column
export function getConsultantForColumn(columnName) {
  const consultantMap = {
    // Retirement consultant columns
    description: 'retirement',
    lifestyle_description: 'retirement',
    pace_of_life: 'retirement',
    expat_community_size: 'retirement',
    cultural_rating: 'retirement',
    social_atmosphere: 'retirement',
    
    // Immigration consultant columns
    visa_requirements: 'immigration',
    residency_path_info: 'immigration',
    min_income_requirement_usd: 'immigration',
    retirement_visa_available: 'immigration',
    digital_nomad_visa: 'immigration',
    visa_on_arrival_days: 'immigration',
    
    // Tax consultant columns
    tax_implications: 'tax',
    income_tax_rate_pct: 'tax',
    sales_tax_rate_pct: 'tax',
    property_tax_rate_pct: 'tax',
    tax_treaty_exists: 'tax',
    foreign_income_taxed: 'tax',
    wealth_tax_exists: 'tax',
    tax_residency_days: 'tax',
    
    // Healthcare consultant columns
    healthcare_description: 'healthcare',
    healthcare_score: 'healthcare',
    medical_specialties_available: 'healthcare',
    english_speaking_doctors: 'healthcare',
    health_insurance_cost: 'healthcare',
    public_healthcare_eligible: 'healthcare',
    prescription_drug_costs: 'healthcare',
    
    // Real estate consultant columns
    infrastructure_description: 'realEstate',
    foreign_ownership_allowed: 'realEstate',
    property_purchase_process: 'realEstate',
    rental_market_description: 'realEstate',
    property_taxes_annual: 'realEstate',
    utilities_reliability: 'realEstate',
    neighborhoods_recommended: 'realEstate',
    
    // Veterinary consultant columns
    pet_import_requirements: 'veterinary',
    pet_import_restrictions: 'veterinary',
    local_pet_diseases: 'veterinary',
    pet_healthcare_quality: 'veterinary',
    pet_friendly_rating: 'veterinary',
    pet_costs_monthly: 'veterinary',
    
    // Climate consultant columns
    climate_description: 'climate',
    climate_comparison: 'climate',
    air_quality_assessment: 'climate',
    natural_disaster_risk: 'climate',
    climate_health_impact: 'climate',
    best_seasons: 'climate',
    
    // Cultural consultant columns
    language_barrier_assessment: 'cultural',
    cultural_adaptation_challenges: 'cultural',
    social_integration_ease: 'cultural',
    expat_support_resources: 'cultural',
    local_customs_important: 'cultural',
    
    // Safety consultant columns
    safety_description: 'safety',
    crime_types_common: 'safety',
    scam_risks: 'safety',
    emergency_services_quality: 'safety',
    safety_precautions: 'safety',
    
    // Financial consultant columns
    banking_ease: 'financial',
    currency_considerations: 'financial',
    money_transfer_options: 'financial',
    financial_scam_protection: 'financial'
  }
  
  return consultantMap[columnName] || 'retirement'
}

// Function to generate citizenship-specific content
export function generateCitizenshipSpecificContent(town, columnName, consultantType) {
  const results = {}
  const consultant = AI_CONSULTANTS[consultantType]
  
  if (!consultant) return results
  
  // Find the appropriate prompt for this column
  let promptKey = null
  for (const [key, value] of Object.entries(consultant.prompts)) {
    if (columnName.includes(key) || key === columnName) {
      promptKey = key
      break
    }
  }
  
  if (!promptKey) return results
  
  // Generate content for each citizenship
  for (const citizenship of SUPPORTED_CITIZENSHIPS) {
    const prompt = consultant.prompts[promptKey](town, citizenship)
    results[citizenship] = prompt
  }
  
  return results
}

// Function to create a complete prompt with persona
export function createCompletePrompt(consultantType, promptKey, town, citizenship) {
  const consultant = AI_CONSULTANTS[consultantType]
  if (!consultant) return null
  
  const persona = consultant.persona
  const prompt = consultant.prompts[promptKey](town, citizenship)
  
  return `${persona}\n\n${prompt}`
}