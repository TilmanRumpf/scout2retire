-- CHUNKED UPDATES FOR ALL TOWNS
-- Run each chunk separately

-- Chester - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Chester';

-- Chester - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Chester';

-- Digby - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Digby';

-- Digby - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Digby';

-- Lockeport - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Lockeport';

-- Lockeport - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Lockeport';

-- Lunenburg - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Lunenburg';

-- Lunenburg - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Lunenburg';

-- Mahone Bay - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Mahone Bay';

-- Mahone Bay - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Mahone Bay';

-- Peggy's Cove - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Peggy's Cove';

-- Peggy's Cove - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Peggy's Cove';

-- Truro - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Truro';

-- Truro - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Truro';

-- Yarmouth - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Yarmouth';

-- Yarmouth - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Yarmouth';

-- Calgary - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Calgary';

-- Calgary - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Calgary';

-- Charlottetown - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Charlottetown';

-- Charlottetown - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Charlottetown';

-- Halifax - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Halifax';

-- Halifax - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Halifax';

-- Kelowna - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Kelowna';

-- Kelowna - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Kelowna';

-- Kingston - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Kingston';

-- Kingston - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Kingston';

-- London (ON) - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'London (ON)';

-- London (ON) - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'London (ON)';

-- Moncton - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Moncton';

-- Moncton - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Moncton';

-- Niagara-on-the-Lake - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Niagara-on-the-Lake';

-- Niagara-on-the-Lake - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Niagara-on-the-Lake';

-- Ottawa - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Ottawa';

-- Ottawa - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Ottawa';

-- Victoria - Chunk 1
UPDATE towns SET 
-- Chunk 1: Basic ratings and costs
activity_infrastructure = jsonb_build_array('parks','trails','beaches','cultural_sites','shopping','dining'),
environmental_factors = jsonb_build_array('clean_air','green_spaces','low_pollution','four_seasons'),
pet_friendliness = to_jsonb(8),
travel_connectivity_rating = 6,
emergency_services_quality = 8,
environmental_health_rating = 9,
insurance_availability_rating = 9,
solo_living_support = 7 WHERE name = 'Victoria';

-- Victoria - Chunk 2
UPDATE towns SET 
-- Chunk 2: Costs and taxes
min_income_requirement_usd = 0,
natural_disaster_risk_score = 2,
private_healthcare_cost_index = 85,
property_appreciation_rate_pct = 3.5,
income_tax_rate_pct = 54,
sales_tax_rate_pct = 15,
property_tax_rate_pct = 1.5,
government_efficiency_rating = 8,
political_stability_rating = 9,
healthcare_cost_monthly = 0,
air_quality_index = 20,
humidity_average = 75 WHERE name = 'Victoria';

