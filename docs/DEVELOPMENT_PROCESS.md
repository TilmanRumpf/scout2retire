# Scout2Retire Development Process Guide

## Overview

This guide establishes a standardized development process to prevent recurring errors and maintain code quality in the Scout2Retire codebase.

## 1. Before You Start Development

### 1.1 Required Reading
- [ ] Read `CLAUDE.md` for project-specific guidelines
- [ ] Review `ERROR_PREVENTION_ARCHITECTURE.md` for common pitfalls
- [ ] Check `src/styles/uiConfig.ts` for available design tokens

### 1.2 Environment Setup
```bash
# Ensure you have the latest code
git pull origin main

# Install dependencies
npm install

# Run style verification
npm run verify:styles

# Start development server
npm run dev
```

### 1.3 Pre-Development Checklist
- [ ] Understand the feature requirements completely
- [ ] Check if similar components exist (avoid duplication)
- [ ] Verify database schema if making data changes
- [ ] Review recent commits for context

## 2. During Development

### 2.1 Component Creation Workflow

#### Step 1: Use Component Templates
```jsx
// For new pages - use this template
import { uiConfig } from '../styles/uiConfig';
import QuickNav from '../components/QuickNav';

export default function NewPage() {
  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      <QuickNav />
      <main className={`${uiConfig.layout.width.container} ${uiConfig.layout.spacing.section}`}>
        {/* Your content here */}
      </main>
    </div>
  );
}
```

#### Step 2: Style Guidelines
```jsx
// ❌ NEVER DO THIS
<div className="p-4 m-2 bg-gray-100 max-w-md">

// ✅ ALWAYS DO THIS
<div className={`${uiConfig.layout.spacing.card} ${uiConfig.colors.card} ${uiConfig.layout.width.containerNarrow}`}>
```

#### Step 3: Responsive Design
```jsx
// Mobile-first approach
<button className={`
  ${uiConfig.components.buttonSizes.default} 
  lg:${uiConfig.components.buttonSizes.md}
`}>
  Click Me
</button>
```

### 2.2 Common Patterns

#### Navigation Implementation
```jsx
// For main app pages
import QuickNav from '../components/QuickNav';

// For onboarding pages
import OnboardingProgressiveNav from '../components/OnboardingProgressiveNav';

// NEVER use both or wrap in multiple layout components
```

#### Form Handling
```jsx
// Use consistent form patterns
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Validate user session
    const { user } = await getCurrentUser();
    if (!user) {
      navigate('/welcome');
      return;
    }
    
    // Make API call
    const { success, error } = await apiCall();
    
    if (!success) {
      toast.error(error?.message || 'Unknown error');
      return;
    }
    
    toast.success('Success message');
    navigate('/next-page');
  } catch (err) {
    toast.error('An unexpected error occurred');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

#### State Management
```jsx
// Prevent event bubbling issues
const handleClick = (e) => {
  e.stopPropagation(); // Prevent bubbling
  e.preventDefault();   // Prevent default behavior
  // Your logic here
};

// Verify state updates
useEffect(() => {
  console.log('State updated:', state); // Debug during development
}, [state]);
```

### 2.3 Testing During Development

#### Visual Testing Checklist
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1440px)
- [ ] Toggle dark mode and verify all colors
- [ ] Check loading states
- [ ] Verify error states
- [ ] Test with slow network (Chrome DevTools)

#### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Safari (if on Mac)
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 3. Before Committing

### 3.1 Pre-Commit Checklist
```bash
# Run all verification scripts
npm run lint                  # Check code quality
npm run verify:styles        # Check for style violations
npm run verify:navigation    # Check navigation presence
npm run build               # Ensure build succeeds
```

### 3.2 Self-Review Questions
1. **Styles**: Am I using only uiConfig.ts values?
2. **Navigation**: Do all pages have proper navigation?
3. **Responsiveness**: Does it work on all screen sizes?
4. **Dark Mode**: Are all colors properly themed?
5. **Error Handling**: Are all errors handled gracefully?
6. **Loading States**: Are loading states implemented?
7. **Accessibility**: Can it be used with keyboard only?

### 3.3 Commit Message Format
```bash
# Format: <type>: <description>

# Types:
# feat: New feature
# fix: Bug fix
# style: Style changes (formatting, not CSS)
# refactor: Code restructuring
# docs: Documentation changes
# test: Test additions/changes
# chore: Maintenance tasks

# Examples:
git commit -m "feat: Add user profile editing"
git commit -m "fix: Resolve navigation duplication on Daily page"
git commit -m "refactor: Convert hardcoded styles to uiConfig tokens"
```

## 4. Code Review Process

### 4.1 For Reviewers

#### Style Compliance Check
- [ ] No hardcoded padding/margin values
- [ ] All colors from uiConfig.ts
- [ ] Consistent button sizes
- [ ] Proper dark mode implementation

#### Navigation Check
- [ ] Correct navigation component used
- [ ] No duplicate navigation
- [ ] Mobile hamburger menu present

#### Code Quality Check
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] No console.log statements (except errors)
- [ ] Consistent patterns followed

### 4.2 For Authors

#### Preparing for Review
1. Run all verification scripts
2. Self-review using the checklist
3. Add screenshots for UI changes
4. Document any deviations from patterns
5. Link related issues/discussions

#### Responding to Feedback
1. Address all comments
2. Ask for clarification if needed
3. Update CLAUDE.md if new patterns emerge
4. Re-test after changes

## 5. Common Issues and Solutions

### 5.1 Style Violations

**Issue**: Hardcoded spacing values
```jsx
// ❌ Problem
<div className="p-4 m-2">

// ✅ Solution
<div className={uiConfig.layout.spacing.card}>
```

**Issue**: Inconsistent colors
```jsx
// ❌ Problem
<div className="bg-green-500 dark:bg-green-400">

// ✅ Solution
<div className={uiConfig.colors.btnPrimary}>
```

### 5.2 Navigation Issues

**Issue**: Missing navigation
```jsx
// ❌ Problem
export default function ProfilePage() {
  return <div>Profile content</div>;
}

// ✅ Solution
export default function ProfilePage() {
  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      <QuickNav />
      <main>Profile content</main>
    </div>
  );
}
```

**Issue**: Duplicate navigation
```jsx
// ❌ Problem
<AuthenticatedLayout>
  <QuickNav /> {/* Duplicate - AuthenticatedLayout already has nav */}
  <Content />
</AuthenticatedLayout>

// ✅ Solution
<AuthenticatedLayout>
  <Content />
</AuthenticatedLayout>
```

### 5.3 State Management Issues

**Issue**: Click events bubbling
```jsx
// ❌ Problem
<div onClick={handleDivClick}>
  <button onClick={handleButtonClick}>Click</button>
</div>

// ✅ Solution
<div onClick={handleDivClick}>
  <button onClick={(e) => {
    e.stopPropagation();
    handleButtonClick(e);
  }}>Click</button>
</div>
```

## 6. Continuous Improvement

### 6.1 Weekly Team Practices
- Review error metrics dashboard
- Discuss challenging implementations
- Update shared patterns
- Refine development process

### 6.2 Contributing to Process
1. Document new patterns in CLAUDE.md
2. Propose process improvements in team meetings
3. Create reusable components for common patterns
4. Share learnings from debugging sessions

### 6.3 Metrics to Track
- Style violation count per PR
- Navigation error frequency
- Time to resolve issues
- Code review iteration count

## 7. Quick Reference

### 7.1 Essential Commands
```bash
npm run dev              # Start development
npm run lint            # Check code quality
npm run verify:styles   # Check style compliance
npm run verify:navigation # Check navigation
npm run build          # Production build
npm run preview        # Preview production build
```

### 7.2 Key Files
- `src/styles/uiConfig.ts` - All design tokens
- `CLAUDE.md` - Project guidelines
- `.eslintrc.js` - Linting rules
- `scripts/verify-*.js` - Verification scripts

### 7.3 Support
- Check `ERROR_PREVENTION_ARCHITECTURE.md` for detailed technical guidelines
- Review recent commits for examples
- Ask team members for pattern clarification
- Update documentation when patterns change

## Remember

The goal is to maintain a consistent, high-quality codebase that is:
- Easy to maintain
- Consistent in style
- Free from recurring errors
- Accessible to all users
- Performant across devices

By following this process, we can achieve these goals and create a better product for our users.