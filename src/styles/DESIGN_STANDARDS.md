# Scout2Retire Design Standards

## Overview
This document outlines the design standards and visual guidelines for Scout2Retire. All components and pages must adhere to these standards to ensure consistency across the application.

## Core Principles

### 1. Consistent Design Tokens
- **ALL** color definitions must live in `tailwind.config.js` (already compliant ✅)
- Use semantic color names: `scout-accent-300`, `scout-orange-500`, not hex codes
- Maintain consistent spacing, typography, and visual hierarchy

### 2. Two Valid Styling Approaches

**Option A: Semantic Naming (via uiConfig)**
```javascript
import { uiConfig } from '../styles/uiConfig';
<div className={uiConfig.colors.card}>
```
✅ Good for: Frequently reused patterns, semantic naming
✅ Used in: ~70 files (30% of codebase)

**Option B: Direct Tailwind Utilities**
```javascript
<div className="bg-white dark:bg-gray-900 rounded-lg p-4">
```
✅ Good for: Clear, explicit styling, one-off components
✅ Used in: Most of codebase (70%)

**Both are professional and acceptable.** Choose based on clarity and maintainability.

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

### Option Buttons & Dropdowns

#### Visual Consistency Requirements
- **Border Width**: Always use `border-2` for ALL interactive elements (buttons, dropdowns, selects)
- **Minimum Height**: 44px (accessibility requirement)
- **Text Alignment**: Center-aligned for both buttons and dropdowns
- **Font Weight**: Medium (`font-medium`) for selected state
- **Font Size**: Responsive sizing `text-xs sm:text-sm` (12px mobile, 14px desktop)
- **Padding**: Responsive padding `p-2.5 sm:p-3` for space efficiency

#### Color States
**Selected State (Light Mode)**:
```
border-2 border-scout-accent-300
bg-scout-accent-50
text-scout-accent-300
font-medium
```

**Selected State (Dark Mode)**:
```
border-2 border-scout-accent-300
bg-scout-accent-900/20
text-scout-accent-300
font-medium
```

**Unselected State (Light Mode)**:
```
border-2 border-gray-300
bg-white
text-gray-700
```

**Unselected State (Dark Mode)**:
```
border-2 border-gray-600
bg-gray-700/30
text-gray-200
```

**Hover State (Unselected)**:
```
hover:border-scout-accent-200 dark:hover:border-scout-accent-400
```

#### Implementation Notes
- Text color in selected state MUST be light green (`text-scout-accent-300`) in both light and dark modes
- Ensure vertical text alignment using `lineHeight` style for dropdowns
- All interactive elements must have consistent border thickness for visual harmony
- Button labels use responsive font sizing to prevent text overflow on mobile
- Description text (if present) uses `text-[10px] sm:text-xs` for secondary information

### Sliders (ImportanceSlider Component)

#### Mandatory Layout Structure
```javascript
<div className="mb-2">
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center">
      <Icon size={16} className="mr-1.5 {text-color}" />
      <span className="text-xs sm:text-sm {text-color}">{label}</span>
    </div>
    <span className="text-xs sm:text-sm font-medium text-scout-accent-300 dark:text-scout-accent-300">
      {percentage}%
    </span>
  </div>
  <input type="range" ... />
</div>
```

#### Color Specifications

**Light Mode**:
- Label text: `text-gray-700`
- Icon color: Inherits from label text (`text-gray-700`)
- Percentage value: `text-scout-accent-300` (light green)
- Track background: `bg-gray-200`
- Active track: `bg-scout-accent-300`
- Thumb: `bg-scout-accent-300`

**Dark Mode**:
- Label text: `text-gray-300`
- Icon color: Inherits from label text (`text-gray-300`)
- Percentage value: `text-scout-accent-300` (light green)
- Track background: `bg-gray-700`
- Active track: `bg-scout-accent-300`
- Thumb: `bg-scout-accent-300`

#### Implementation Requirements
- **Font Size Consistency**: Both label and percentage MUST use `text-xs sm:text-sm`
- **Icon Behavior**: Icons MUST inherit parent text color (no forced accent)
- **Percentage Format**: Display as `{value}%` where value = `((sliderValue - 1) * 25)`
- **Visual Feedback**: Gradient fill showing progress
- **Spacing**: Container `mb-2`, header row `mb-1`
- **Accessibility**: Minimum touch target 44px for thumb

## Color Palette Usage

### Primary Brand Color - Scout Accent (Sage Green)
- **Hex Value**: #8fbc8f
- **Usage**: Primary actions, selections, active states, and brand identity
- **Available Shades**: 50-900
- **Key Shade**: scout-accent-300 (primary interactive color)

### Light Green Text Color
**Critical Rule**: The light green color (`text-scout-accent-300`) is used consistently across both light and dark modes for:
- Selected button/dropdown text
- Slider percentage values
- Active/selected state indicators
- Form field focus states

### Component-Specific Color Guidelines

#### Buttons & Dropdowns
| State | Light Mode | Dark Mode |
|-------|------------|------------|
| Selected Text | `text-scout-accent-300` | `text-scout-accent-300` |
| Selected Background | `bg-scout-accent-50` | `bg-scout-accent-900/20` |
| Selected Border | `border-scout-accent-300` | `border-scout-accent-300` |
| Unselected Text | `text-gray-700` | `text-gray-200` |
| Unselected Background | `bg-white` | `bg-gray-700/30` |
| Unselected Border | `border-gray-300` | `border-gray-600` |

#### Text & Icons
| Element | Light Mode | Dark Mode |
|---------|------------|------------|
| Headings | `text-gray-800` | `text-white` |
| Body Text | `text-gray-700` | `text-gray-300` |
| Hint Text | `text-gray-500` | `text-gray-400` |
| Icons (inherit) | Parent text color | Parent text color |

### Semantic Colors
- **Success**: Scout accent shades for positive feedback
- **Warning**: Yellow/amber (`yellow-500`) for cautions
- **Error**: Red (`red-600`) for errors and destructive actions
- **Info**: Blue (`blue-600`) for informational content

### Dark Mode Requirements
- All components MUST support dark mode
- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test all color combinations in both modes
- Special attention to `text-scout-accent-300` which remains the same in both modes

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

### Input Fields & Selects
- **Border**: `border-2 border-gray-300 dark:border-gray-600`
- **Focus**: `focus:border-scout-accent-300`
- **Background**: `bg-white dark:bg-gray-700`
- **Text**: `text-gray-800 dark:text-white`
- **Min height**: 44px (accessibility requirement)
- **Padding**: `px-3` for horizontal padding

### Dropdowns (Select Elements)
**Special Requirements**:
- Must match button styling when selected
- Text must be vertically centered using `lineHeight` style
- Center-aligned text to match buttons
- Selected state uses same colors as buttons:
  - Border: `border-2 border-scout-accent-300`
  - Background: `bg-scout-accent-50 dark:bg-scout-accent-900/20`
  - Text: `text-scout-accent-300 dark:text-scout-accent-300`
  - Font weight: `font-medium`

### Buttons
- **Primary**: Scout accent 300 background with white text
  - Light: `bg-scout-accent-300 text-white hover:bg-scout-accent-400`
  - Dark: Same as light mode
- **Secondary**: Gray borders with theme-aware text
  - Light: `border-gray-300 text-gray-700 bg-white`
  - Dark: `border-gray-600 text-gray-300 bg-gray-800`
- **Padding**: `px-3 py-2.5` (updated for space efficiency)
- **Font Size**: `text-xs sm:text-sm` (12px mobile, 14px desktop)
- **Border**: Always `border-2` for consistency
- **Border radius**: `rounded-lg`

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

## Implementation Checklist

When implementing UI components, verify:

### Color Consistency
- [ ] Selected elements use `text-scout-accent-300` in BOTH light and dark modes
- [ ] Icons inherit parent text color (no forced accent colors)
- [ ] Borders maintain consistent `border-2` width
- [ ] Hover states are implemented for interactive elements

### Typography
- [ ] Slider labels and values use matching font sizes
- [ ] Selected state text uses `font-medium` weight
- [ ] Responsive font sizing is consistent (`text-xs sm:text-sm`)

### Accessibility
- [ ] All interactive elements have 44px minimum height
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus states are clearly visible
- [ ] Text remains legible in both color modes

### Testing
- [ ] Component appearance in light mode
- [ ] Component appearance in dark mode
- [ ] Hover and focus states
- [ ] Mobile responsiveness
- [ ] Border consistency across states

---

Last Updated: 2025-06-22
Version: 2.1.0

Changelog:
- v2.1.0 (2025-06-22): Updated button sizing for better space efficiency (reduced font size and padding)
- v2.0.0 (2025-06-22): Major update with comprehensive color specifications for light/dark modes
- v1.0.0 (2025-06-21): Initial version