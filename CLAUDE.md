# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scout2Retire is a retirement planning application that helps users discover and evaluate potential retirement locations through a personalized, data-driven approach. Built with React, Vite, and Supabase.

## Essential Commands

```bash
# Development
npm run dev          # Start development server with hot reload

# Build & Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
```

## Architecture & Key Components

### Tech Stack
- **Frontend**: React 18.2 with React Router v6
- **Build**: Vite 6.3
- **Styling**: Tailwind CSS 3.3 with custom sage green theme
- **Backend**: Supabase (authentication + PostgreSQL database)
- **UI Libraries**: Lucide React (icons), Recharts (data viz), React Hot Toast (notifications)

### Authentication Flow
- Handled via `src/utils/authUtils.js` using Supabase Auth
- User profiles stored in `users` table with onboarding status tracking
- Protected routes check both authentication and onboarding completion
- Session management is automatic with Supabase

### Routing Structure
1. **Public Routes**: `/welcome`, `/login`, `/signup`, `/reset-password`
2. **Onboarding Flow** (authenticated): Sequential multi-step process from `/onboarding/progress` through various preference steps to `/onboarding/review`
3. **Protected Routes** (authenticated + onboarded): `/daily`, `/discover`, `/compare`, `/favorites`, `/schedule`, `/journal`, `/chat`, `/profile`, `/settings`

### State Management
- **Global State**: Theme context (`src/contexts/ThemeContext.jsx`) for dark/light mode
- **Auth State**: Managed by Supabase with listeners in App.jsx
- **Component State**: Local state with React hooks, form data passed via props in onboarding

### Database Integration
- Supabase client configured in `src/utils/supabaseClient.js`
- Environment variables required: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Key tables: `users`, `saved_locations`, `journal_entries`
- Real-time subscriptions available

### Key Utility Modules
- `authUtils.js`: Authentication functions (signUp, signIn, signOut, getCurrentUser)
- `townUtils.jsx`: Town data management and display utilities
- `matchingAlgorithm.js`: Logic for matching towns to user preferences
- `onboardingUtils.js`: Onboarding data management

### Component Organization
- **Layout Components**: `AuthenticatedLayout`, `QuickNav`
- **Feature Components**: `DailyTownCard`, `TownCard`, `TownRadarChart`, `LikeButton`
- **Pages**: Organized in `src/pages/` with onboarding steps in subdirectory
- **Shared UI**: `BaseStepNavigation`, `OnboardingStepNavigation`, `ThemeToggle`

## Development Notes

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add Supabase project URL and anon key
3. Ensure Supabase tables are properly configured

### Color Scheme
Primary brand color is sage green (`scout-accent-*` in Tailwind config) with full dark mode support.

### Navigation Pattern
- Onboarding uses wrapper component for consistent navigation between steps
- Main app uses bottom navigation on mobile (`QuickNav`) and sidebar on desktop
- All navigation state is managed by React Router

### Error Handling
- Toast notifications for user-facing errors
- Comprehensive error logging in authentication and database operations
- Connection diagnostics in development mode

## Design Standards - CRITICAL

### Visual Design Rules
- **SUBTLE DESIGN ONLY** - No exceptions
- **NO EMOJIS** - Never use emojis anywhere in the UI
- **NO STARS** - Do not use star ratings or star symbols
- **ICONS ONLY** - Use only subtle Lucide React icons when visual elements are needed
- **PROFESSIONAL** - Maintain a clean, professional, minimalist aesthetic
- **TEXT-BASED** - Prefer text descriptions over symbols (e.g., "Excellent" not "⭐⭐⭐⭐⭐")

### UI Principles
- Keep all visual elements understated and refined
- Use the sage green accent color sparingly for key actions only
- Rely on typography hierarchy and spacing for visual interest
- Avoid decorative elements that don't serve a functional purpose

## Working Relationship

### Communication Style
- **NO PRAISE OR FLATTERY** - Focus on the work, not compliments
- **DIRECT COMMUNICATION** - Be straightforward and efficient
- **ASK QUESTIONS** - Don't hesitate to clarify requirements
- **TEAM APPROACH** - We work together; both make mistakes and improve
- **PERFORMANCE FOCUSED** - Deliver the best work possible without social pleasantries

## Scoring Transparency - CRITICAL

### Match Score Display
- **ALWAYS SHOW WEIGHTED AVERAGE** - When displaying category scores, indicate that the overall score is a weighted average
- **FORMAT**: "Matching your preferences (weighted avg: XX%)" to clarify the calculation method
- **RATIONALE**: Users see individual category scores as whole numbers and may calculate a simple average, which won't match the displayed overall score due to adaptive weighting
- **CONSISTENCY**: Apply this pattern wherever category breakdowns are shown (TownDiscovery, DailyTownCard, etc.)

### CLAUDE.md Maintenance
- **ANALYZE EACH CHANGE** - After implementing user requests, evaluate if the change represents a pattern or principle that should be documented
- **DOCUMENT PATTERNS** - Record recurring decisions, terminology choices, or design principles that should be consistent across the codebase
- **Examples to document**:
  - Terminology standards (e.g., always use "Favorites" not "saved places")
  - UI patterns that should be reused
  - Technical decisions that affect future development
  - User preferences that apply broadly

## Data Consistency & Usability - CRITICAL

### Core Principles
- **DATA CONSISTENCY IS PARAMOUNT** - All data points must align across the entire application
- **ONBOARDING DRIVES EVERYTHING** - The 6 onboarding categories (Region, Climate, Culture, Hobbies, Administration, Budget) define how all data is structured
- **AUTOMATIC UPDATES** - The app should self-improve through triggers, functions, and smart data relationships
- **QUERY EFFICIENCY** - Database queries are expensive; always optimize for minimal queries
- **ASK WHEN IN DOUBT** - If data consistency is unclear, ALWAYS ask for guidance before proceeding

### Data Alignment Requirements
1. **Town Data** must include fields that map to ALL onboarding categories
2. **Regional Data** must aggregate from actual town data, not be hardcoded
3. **User Preferences** from onboarding must directly match queryable fields
4. **Matching Algorithm** weights must be reflected in data importance

### Specific Requirements
- Geographic features (Coastal, Mountains, Island, etc.) MUST be stored consistently
- Climate data MUST use standardized tags matching onboarding options
- Cost indices MUST align with budget ranges users select
- Healthcare/Safety scores MUST map to Good/Functional/Basic ratings
- Language data MUST support English Only/Will Learn/Flexible preferences

### Query Optimization
- Use materialized views for expensive calculations
- Cache frequently accessed data
- Batch operations wherever possible
- Use database triggers for automatic updates
- Minimize real-time calculations

## Data Migration Guidelines

### Creating Database Structures
When creating new tables or migrating data to Supabase:
1. **Start with exact onboarding alignment** - Every field should trace back to an onboarding question
2. **Use appropriate data types** - Arrays for multi-select options, enums for fixed choices
3. **Include both raw data and calculated fields** - Store source data and cache calculations
4. **Design for personalization** - Include functions to match user preferences
5. **Build in analytics** - Track views, clicks, and effectiveness

### Example: Regional Inspirations
The `regional_inspirations` table demonstrates proper data structure:
- Direct mapping to all 6 onboarding categories
- Proper use of CHECK constraints for data validation
- Materialized view for performance (`regional_inspiration_stats`)
- Automatic updates via triggers
- Personalization function (`get_personalized_inspirations`)
- Built-in analytics (view_count, click_count, click_through_rate)

### Data Consistency Checklist
Before implementing any data changes:
- [ ] Does it align with onboarding categories?
- [ ] Are the field names consistent with existing data?
- [ ] Will it work with the matching algorithm?
- [ ] Is it optimized for minimal queries?
- [ ] Does it support future personalization?

## Towns Table Update Requirements - CRITICAL

### Current State
The towns table contains good foundational data (id, name, country, description, population, images) but is **missing critical fields** that were added during onboarding improvements.

### Missing Alignment Fields
The following fields must be added to align with onboarding:

#### Culture & Lifestyle (from OnboardingCulture)
- `living_environments[]` - matches onboarding exactly (rural/suburban/urban)
- `pace_of_life_category` - standardized (relaxed/moderate/fast)
- `social_preference` - new field (very_social/balanced/private)
- `expat_community_size` - standardized (small/moderate/large)
- `language_schools_count`, `language_exchange_programs`
- `social_atmosphere[]` - community vibe
- `traditional_progressive_scale` - 1-10 scale

#### Administration (from OnboardingAdministration)
- `healthcare_quality` - standardized to good/functional/basic
- `safety_quality` - standardized to good/functional/basic
- `emergency_services_quality` - matches onboarding
- `healthcare_access_level` - specific access types
- Special medical facilities booleans (dialysis, cancer, cardiac, diabetes)

#### Climate (standardization needed)
- `summer_climate[]` - must use exact values: mild/warm/hot
- `winter_climate[]` - must use exact values: cold/cool/mild
- `humidity_category` - dry/balanced/humid
- `sunshine_category` - often_sunny/balanced/less_sunny

#### Mobility (from OnboardingCosts)
- `local_mobility_options[]` - walk_bike/public_transit/need_car/taxi_rideshare
- `regional_mobility_options[]` - train_access/bus_network/need_car/not_important
- `flight_connection_type` - major_airport/regional_airport/train_connections/not_important

### Implementation Notes
1. Use `update_towns_table_v2.sql` to add missing fields
2. Create triggers to derive categories from existing numeric scores
3. Add proper indexes for performance
4. Ensure all array fields use CHECK constraints for data validity
5. Update matching algorithm to use new standardized fields

## Image Management System - CRITICAL

### The Problem
- **NEVER** show inappropriate images (animals, rabbits, random objects)
- **NEVER** have missing images - every location must have a visual
- **ALWAYS** show location-relevant, high-quality images

### Solution Components

#### 1. Image Validation System (`imageValidation.js`)
- Validates all image URLs against blocked patterns
- Provides intelligent fallbacks based on country/region/features
- Handles image loading failures gracefully
- Maintains curated fallback images for every country

#### 2. Enhanced Component (`LazyImageValidated.jsx`)
- Drop-in replacement for LazyImage
- Automatically validates and fixes bad images
- Shows location-appropriate fallbacks
- Provides attribution for generic images

#### 3. Database Support (`add_image_validation_fields.sql`)
- `curated_location_images` table with high-quality verified images
- Automatic validation triggers on image insert/update
- Tracking of image sources and validation status
- Function to get best available image for any location

### Image Guidelines

#### Acceptable Images Must Be:
- **Location-specific**: Clearly identifiable as the town/city/region
- **Professional quality**: Well-composed, good lighting, appropriate resolution
- **Culturally appropriate**: Respectful representation of the location
- **Relevant features**: Show actual characteristics (coastal, mountain, urban, etc.)

#### Blocked Patterns:
- Animals (rabbits, cats, dogs, etc.) unless part of location identity
- Generic stock photos (office workers, meetings)
- Error images (404, placeholder, broken)
- Unrelated objects or scenes

#### Fallback Hierarchy:
1. Town-specific verified image
2. Country-specific curated image
3. Geographic feature image (coastal, mountain, etc.)
4. Living environment image (urban, rural)
5. Generic travel planning image (last resort)

### Implementation
```javascript
// Always use LazyImageValidated for town images
import LazyImageValidated from '../components/LazyImageValidated';

// Pass full location object for context
<LazyImageValidated
  location={town}  // Full town object
  src={town.image_url_1}
  alt={`${town.name}, ${town.country}`}
  className="w-full h-48 object-cover"
/>
```

### Database Queries
```sql
-- Get validated image for a town
SELECT get_best_image_for_town('Portugal', 'Porto', ARRAY['coastal', 'urban']);

-- Check towns with bad images
SELECT id, name, country, image_url_1 
FROM towns 
WHERE image_url_1 ~* 'rabbit|bunny|animal|placeholder|error|404'
   OR image_url_1 IS NULL;