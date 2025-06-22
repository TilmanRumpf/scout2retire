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