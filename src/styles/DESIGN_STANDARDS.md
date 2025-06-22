# Scout2Retire Design Standards

## Overview
This document outlines the design standards and visual guidelines for Scout2Retire. All components and pages must adhere to these standards to ensure consistency across the application.

## Core Principles

### 1. Zero Tolerance for Hardcoded Colors
- **ALL** colors must reference `uiConfig.ts`
- No inline color styles (e.g., `text-gray-500`, `bg-white`)
- Every color value must use the centralized design system

### 2. Design System Reference
All styling must use the centralized configuration from `/src/styles/uiConfig.ts`:

```javascript
import { uiConfig } from '../styles/uiConfig';
```

## Component Standards

### Icons
- **Exclusive Library**: Lucide React icons only
- **Standard Sizes**:
  - Small: `size={12}` - for inline badges
  - Default: `size={16}` - for most UI elements
  - Medium: `size={20}` - for buttons and prominent features
  - Large: `size={24}` - for empty states and headers

### Match Percentage Display
- Display format: `"82%"` (number + % only)
- Never include the word "match"
- Use subtle badge styling from uiConfig
- Position: top-left corner of cards

### Cards (TownCard Component)
- Mobile-first responsive design
- Consistent border radius: `uiConfig.layout.radius.lg`
- Shadow: `uiConfig.layout.shadow.md` (hover: `shadow.lg`)
- Overflow: hidden for image containment

### Option Buttons
- Selected state: 
  ```
  border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20
  ```
- Unselected state:
  ```
  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30
  ```
- Minimum height: 44px (accessibility)

### Sliders
- Display format: Percentage (0-100%)
- Formula: `((value - 1) * 25)%` for 1-5 scale
- Visual feedback with gradient fill
- Scout accent colors for active state

## Color Palette Usage

### Primary Brand Color
- Scout Accent (sage green): Used for primary actions, selections, and brand identity
- Available shades: 50-900

### Semantic Colors
- Success: Green indicators for positive feedback
- Warning: Yellow/amber for cautions
- Error/Danger: Red for errors and destructive actions
- Info: Blue for informational content

### Dark Mode
- All components must support dark mode
- Use appropriate color variants from uiConfig
- Ensure sufficient contrast ratios

## Typography

### Font Sizes
- Use Tailwind classes with responsive modifiers
- Mobile-first approach: `text-xs sm:text-sm`
- Consistent hierarchy across all pages

### Font Weights
- Headers: `font-bold` or `font-semibold`
- Body text: `font-normal`
- Emphasis: `font-medium`

## Layout Standards

### Spacing
- Consistent padding: `p-4 sm:p-5` for containers
- Gap utilities for grid/flex layouts
- Mobile: smaller spacing (p-3, gap-1.5)
- Desktop: larger spacing (p-4, gap-2)

### Responsive Design
- Mobile-first approach required
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Test all components at mobile sizes first

### Navigation
- Fixed bottom nav on mobile
- Sticky/relative positioning on desktop
- Consistent height and spacing

## Form Elements

### Input Fields
- Border: `border-gray-300 dark:border-gray-600`
- Focus: `focus:border-scout-accent-300`
- Background: `bg-white dark:bg-gray-700`
- Min height: 44px for touch targets

### Buttons
- Primary: `uiConfig.colors.btnPrimary`
- Secondary: `uiConfig.colors.btnSecondary`
- Consistent padding: `px-4 py-2` or `px-6 py-2.5`
- Border radius: `uiConfig.layout.radius.md`

## Animation Standards

### Transitions
- Use `uiConfig.animation.transition` for smooth effects
- Standard duration: 200ms
- Properties: colors, transform, shadow

### Loading States
- Pulse animation: `uiConfig.animation.pulse`
- Skeleton screens for content loading
- Progress indicators for long operations

## Accessibility Requirements

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing between interactive elements
- Clear focus indicators

### Color Contrast
- WCAG AA compliance minimum
- Test all color combinations
- Special attention to dark mode contrast

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus indicators

## File Organization

### Component Structure
```
/src/
  /components/     # Reusable components
  /pages/         # Page components
  /styles/        # Global styles and config
    uiConfig.ts   # Central design system
  /utils/         # Utility functions
```

### Import Order
1. React and core libraries
2. Third-party libraries
3. Internal components
4. Utils and helpers
5. Styles and configs

## Code Standards

### Component Props
- Use TypeScript interfaces when possible
- Document prop types and defaults
- Consistent naming conventions

### Style Application
```javascript
// Good
className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg}`}

// Bad
className="bg-white rounded-lg"
```

## Testing Requirements

### Visual Testing
- Test all color modes (light/dark)
- Verify responsive behavior
- Check hover/focus states

### Cross-browser
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome)
- Different screen sizes and orientations

## Maintenance

### Regular Audits
- Monthly review of hardcoded values
- Component consistency checks
- Performance optimization reviews

### Documentation Updates
- Update this document with new patterns
- Document any exceptions with justification
- Keep examples current

---

Last Updated: 2025-06-21
Version: 1.0.0