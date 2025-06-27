# Layout Checkpoint v1 Manifest
Created: 2024-12-26
Purpose: Document current layout state before design consistency updates

## Revert Instructions
If design changes fail, use: `🧼 Claude, revert to layout_checkpoint_v1`
This will run: `git reset --hard layout_checkpoint_v1`

## Current Design State

### Color System (tailwind.config.js)
- Primary: `scout-accent` (sage green #8fbc8f)
- Secondary: `scout-progress` (warm peach #FBB982)
- Navigation: `scout-nav` colors
- Dark mode: Uses Tailwind's dark: prefix

### Central Configuration (uiConfig.ts)
- Defines component styles, typography, spacing
- Not all components use it consistently

### Known Issues

#### 1. Inconsistent Component Styling
- **Onboarding pages**: Mix of inline styles and uiConfig
- **TownDiscovery**: Custom styles instead of uiConfig
- **DailyRedesignV2**: Partial uiConfig usage
- **Compare/Favorites**: Different styling approaches

#### 2. Dark Mode Problems
- Sage green too bright in dark mode
- Poor text contrast (muted text hard to read)
- Selected states too neon/glowing
- Progress bar orange too vibrant

#### 3. Spacing Inconsistencies
- Different padding values across pages
- Inconsistent margins between sections
- No standardized component spacing

#### 4. Button Styles
- Some use uiConfig.components.buttonPrimary
- Others use custom Tailwind classes
- Inconsistent hover states

#### 5. Navigation Components
- OnboardingStepNavigation has its own style system
- QuickNav uses different patterns
- Header styles vary by page

### Component Inventory

#### Onboarding Flow
- `/onboarding/progress` - Custom styling
- `/onboarding/current-status` - Mix of uiConfig and custom
- `/onboarding/region` - Heavy custom styles
- `/onboarding/climate` - Slider styling issues
- `/onboarding/culture` - Custom button groups
- `/onboarding/hobbies` - Grid layouts custom
- `/onboarding/administration` - Form styling mixed
- `/onboarding/costs` - Currency display custom

#### Main App Pages
- `/daily` - DailyRedesignV2 with partial uiConfig
- `/discover` - TownDiscovery with custom styles
- `/compare` - TownComparison inconsistent with others
- `/favorites` - Different card styles than discover
- `/profile` - Basic styling
- `/settings` - Form styles don't match onboarding

### Design Principles Not Followed
1. Many components don't use the central uiConfig
2. Dark mode colors not properly adjusted
3. Spacing is ad-hoc rather than systematic
4. Component styles duplicated rather than shared
5. No consistent hover/active states

### Files That Should Drive Design
1. `CLAUDE.md` - Design philosophy and rules
2. `tailwind.config.js` - Color definitions
3. `src/styles/uiConfig.ts` - Component styles
4. `src/components/OnboardingStepNavigation.jsx` - Navigation pattern

### Next Steps (After Checkpoint)
1. Audit all pages for style consistency
2. Create shared component styles
3. Fix dark mode colors globally
4. Standardize spacing system
5. Ensure all components use uiConfig