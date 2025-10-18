-- ADD MISSING COLUMNS FOR ADMIN PANELS
-- These columns are referenced in the admin panels but don't exist in the database yet
-- Created: 2025-10-18

-- Infrastructure Panel columns
ALTER TABLE towns ADD COLUMN IF NOT EXISTS internet_reliability TEXT CHECK (internet_reliability IN ('poor', 'fair', 'good', 'very_good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS mobile_coverage TEXT CHECK (mobile_coverage IN ('poor', 'fair', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS bike_infrastructure TEXT CHECK (bike_infrastructure IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS road_quality TEXT CHECK (road_quality IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS traffic_congestion TEXT CHECK (traffic_congestion IN ('minimal', 'low', 'moderate', 'high', 'severe'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS parking_availability TEXT CHECK (parking_availability IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS banking_infrastructure TEXT CHECK (banking_infrastructure IN ('very_poor', 'poor', 'fair', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS digital_services_availability TEXT CHECK (digital_services_availability IN ('very_low', 'low', 'moderate', 'high', 'very_high'));

-- Activities Panel columns
ALTER TABLE towns ADD COLUMN IF NOT EXISTS sports_facilities TEXT CHECK (sports_facilities IN ('very_limited', 'limited', 'moderate', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS mountain_activities TEXT CHECK (mountain_activities IN ('none', 'limited', 'moderate', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS water_sports_available TEXT CHECK (water_sports_available IN ('none', 'limited', 'moderate', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS cultural_activities TEXT CHECK (cultural_activities IN ('very_limited', 'limited', 'moderate', 'good', 'excellent'));
ALTER TABLE towns ADD COLUMN IF NOT EXISTS recreation_centers INTEGER DEFAULT 0;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS parks_per_capita NUMERIC(10, 2) DEFAULT 0;

-- Region Panel columns (check if coastline_access, mountain_access, lake_river_access exist)
ALTER TABLE towns ADD COLUMN IF NOT EXISTS coastline_access BOOLEAN DEFAULT false;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS mountain_access BOOLEAN DEFAULT false;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS lake_river_access BOOLEAN DEFAULT false;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS nearest_major_city TEXT;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN towns.internet_reliability IS 'Reliability and consistency of internet service (poor, fair, good, very_good, excellent)';
COMMENT ON COLUMN towns.mobile_coverage IS 'Quality of mobile phone coverage (poor, fair, good, excellent)';
COMMENT ON COLUMN towns.bike_infrastructure IS 'Quality of bicycle lanes and bike-friendly infrastructure (very_poor, poor, fair, good, excellent)';
COMMENT ON COLUMN towns.road_quality IS 'Overall quality and maintenance of roads (very_poor, poor, fair, good, excellent)';
COMMENT ON COLUMN towns.traffic_congestion IS 'Level of traffic congestion during peak hours (minimal, low, moderate, high, severe)';
COMMENT ON COLUMN towns.parking_availability IS 'Availability and ease of finding parking (very_poor, poor, fair, good, excellent)';
COMMENT ON COLUMN towns.banking_infrastructure IS 'Quality and availability of banking services (very_poor, poor, fair, good, excellent)';
COMMENT ON COLUMN towns.digital_services_availability IS 'Availability of government and public digital services (very_low, low, moderate, high, very_high)';
COMMENT ON COLUMN towns.sports_facilities IS 'Overall availability and quality of sports facilities (very_limited, limited, moderate, good, excellent)';
COMMENT ON COLUMN towns.mountain_activities IS 'Availability of mountain activities like skiing, climbing, hiking (none, limited, moderate, good, excellent)';
COMMENT ON COLUMN towns.water_sports_available IS 'Availability of water sports like surfing, sailing, kayaking (none, limited, moderate, good, excellent)';
COMMENT ON COLUMN towns.cultural_activities IS 'Availability of cultural activities like theaters, concerts, museums (very_limited, limited, moderate, good, excellent)';
COMMENT ON COLUMN towns.recreation_centers IS 'Number of public recreation centers';
COMMENT ON COLUMN towns.parks_per_capita IS 'Number of parks per 100,000 residents';
COMMENT ON COLUMN towns.coastline_access IS 'Whether the town has direct access to coastline';
COMMENT ON COLUMN towns.mountain_access IS 'Whether the town has access to mountains';
COMMENT ON COLUMN towns.lake_river_access IS 'Whether the town has access to lakes or rivers';
COMMENT ON COLUMN towns.nearest_major_city IS 'Name of the nearest major city';
COMMENT ON COLUMN towns.timezone IS 'Timezone (e.g., UTC+1, EST, PST)';
