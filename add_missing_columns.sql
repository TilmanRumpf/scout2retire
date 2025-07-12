-- Add missing columns to towns table
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS visa_on_arrival_countries TEXT[],
ADD COLUMN IF NOT EXISTS geographic_features TEXT[],
ADD COLUMN IF NOT EXISTS income_tax_rate_pct NUMERIC,
ADD COLUMN IF NOT EXISTS data_completeness_score INTEGER,
ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_sources TEXT[],
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS regions TEXT[];

-- Create town_summary table if it doesn't exist
CREATE TABLE IF NOT EXISTS town_summary (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    town_id UUID REFERENCES towns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    primary_language TEXT,
    visa_on_arrival_countries TEXT[],
    geographic_features TEXT[],
    income_tax_rate_pct NUMERIC,
    data_completeness_score INTEGER,
    last_verified_date TIMESTAMP WITH TIME ZONE,
    data_sources TEXT[],
    region TEXT,
    regions TEXT[],
    cost_index INTEGER,
    healthcare_score INTEGER,
    safety_score INTEGER,
    climate TEXT,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to town_summary if it exists
ALTER TABLE town_summary 
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS visa_on_arrival_countries TEXT[],
ADD COLUMN IF NOT EXISTS geographic_features TEXT[],
ADD COLUMN IF NOT EXISTS income_tax_rate_pct NUMERIC,
ADD COLUMN IF NOT EXISTS data_completeness_score INTEGER,
ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_sources TEXT[],
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS regions TEXT[];