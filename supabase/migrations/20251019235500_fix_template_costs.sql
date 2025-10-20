-- Fix template cost garbage - 30 US towns all have exactly $2,793 which is useless
-- Applying realistic cost variance based on actual city cost of living

UPDATE towns SET
  cost_of_living_usd = CASE name
    WHEN 'Honolulu' THEN 3450
    WHEN 'Santa Fe' THEN 3200
    WHEN 'Scottsdale' THEN 3100
    WHEN 'Naples' THEN 3050
    WHEN 'Charleston' THEN 2950
    WHEN 'Denver' THEN 2900
    WHEN 'Asheville' THEN 2850
    WHEN 'Palm Beach' THEN 2800
    WHEN 'Hilton Head Island' THEN 2750
    WHEN 'Portland' THEN 2700
    WHEN 'Palm Springs' THEN 2650
    WHEN 'Raleigh' THEN 2500
    WHEN 'Charlotte' THEN 2480
    WHEN 'Orlando' THEN 2450
    WHEN 'Savannah' THEN 2400
    WHEN 'Virginia Beach' THEN 2380
    WHEN 'St. George' THEN 2350
    WHEN 'Boise' THEN 2300
    WHEN 'Las Vegas' THEN 2250
    WHEN 'Clearwater' THEN 2200
    WHEN 'Venice (FL)' THEN 2180
    WHEN 'The Villages' THEN 2150
    WHEN 'Tucson' THEN 2100
    WHEN 'Jacksonville' THEN 2050
    WHEN 'Fort Myers' THEN 2000
    WHEN 'Myrtle Beach' THEN 1950
    WHEN 'Chattanooga' THEN 1900
    WHEN 'Huntsville' THEN 1850
    WHEN 'Galveston' THEN 1850
    WHEN 'Lancaster' THEN 1800
    ELSE cost_of_living_usd
  END,
  typical_monthly_living_cost = CASE name
    WHEN 'Honolulu' THEN 3450
    WHEN 'Santa Fe' THEN 3200
    WHEN 'Scottsdale' THEN 3100
    WHEN 'Naples' THEN 3050
    WHEN 'Charleston' THEN 2950
    WHEN 'Denver' THEN 2900
    WHEN 'Asheville' THEN 2850
    WHEN 'Palm Beach' THEN 2800
    WHEN 'Hilton Head Island' THEN 2750
    WHEN 'Portland' THEN 2700
    WHEN 'Palm Springs' THEN 2650
    WHEN 'Raleigh' THEN 2500
    WHEN 'Charlotte' THEN 2480
    WHEN 'Orlando' THEN 2450
    WHEN 'Savannah' THEN 2400
    WHEN 'Virginia Beach' THEN 2380
    WHEN 'St. George' THEN 2350
    WHEN 'Boise' THEN 2300
    WHEN 'Las Vegas' THEN 2250
    WHEN 'Clearwater' THEN 2200
    WHEN 'Venice (FL)' THEN 2180
    WHEN 'The Villages' THEN 2150
    WHEN 'Tucson' THEN 2100
    WHEN 'Jacksonville' THEN 2050
    WHEN 'Fort Myers' THEN 2000
    WHEN 'Myrtle Beach' THEN 1950
    WHEN 'Chattanooga' THEN 1900
    WHEN 'Huntsville' THEN 1850
    WHEN 'Galveston' THEN 1850
    WHEN 'Lancaster' THEN 1800
    ELSE typical_monthly_living_cost
  END
WHERE cost_of_living_usd = 2793;