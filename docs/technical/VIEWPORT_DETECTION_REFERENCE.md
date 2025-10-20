# Comprehensive Screen & Viewport Detection Reference

**Last Updated**: 2025-10-19
**Purpose**: Complete guide to JavaScript viewport/screen detection for UI debugging

---

## Table of Contents
1. [Screen vs Viewport vs Visual Viewport](#screen-vs-viewport-vs-visual-viewport)
2. [Device Pixel Ratio (Retina Detection)](#device-pixel-ratio-retina-detection)
3. [Orientation Detection](#orientation-detection)
4. [Safe Area Insets (iOS Notch)](#safe-area-insets-ios-notch)
5. [Touch Capability Detection](#touch-capability-detection)
6. [Complete Detection Utility](#complete-detection-utility)

---

## Screen vs Viewport vs Visual Viewport

### Key Properties & Differences

| Property | What It Measures | Changes On | Use Case |
|----------|-----------------|------------|----------|
| `window.screen.width` | Physical screen width in CSS pixels | Never (screen resolution) | Detect device screen size |
| `window.screen.height` | Physical screen height in CSS pixels | Never | Detect device screen size |
| `window.screen.availWidth` | Available screen width minus taskbar/UI | Never | Real usable screen space |
| `window.screen.availHeight` | Available screen height minus taskbar/UI | Never | Real usable screen space |
| `window.innerWidth` | Browser viewport width (includes scrollbar) | Window resize, zoom | Most common for responsive design |
| `window.innerHeight` | Browser viewport height (includes scrollbar) | Window resize, zoom, mobile toolbar hide/show | Viewport height detection |
| `window.outerWidth` | Full browser window width (includes chrome) | Window resize | Detect browser window size |
| `window.outerHeight` | Full browser window height (includes chrome) | Window resize | Detect browser window size |
| `document.documentElement.clientWidth` | Viewport width (excludes scrollbar) | Window resize, zoom | Precise viewport width |
| `document.documentElement.clientHeight` | Viewport height (excludes scrollbar) | Window resize, zoom | Precise viewport height |
| `visualViewport.width` | Visual viewport width | Zoom, pinch-zoom | Advanced zoom handling |
| `visualViewport.height` | Visual viewport height | Zoom, pinch-zoom, keyboard | Advanced zoom & keyboard handling |

### Important Distinctions

**screen.width vs screen.availWidth**
- `screen.width`: Full theoretical screen resolution
- `screen.availWidth`: Actual space available (minus taskbar/dock)
- Difference: Windows taskbar, Mac dock, browser toolbars

**window.innerWidth vs document.documentElement.clientWidth**
- `window.innerWidth`: Includes vertical scrollbar width (if rendered)
- `document.documentElement.clientWidth`: Excludes scrollbar
- Difference: ~15-17px on most browsers when scrollbar is visible

**window.innerWidth vs visualViewport.width**
- `window.innerWidth`: Affected by page zoom, not pinch-zoom
- `visualViewport.width`: Affected by both page zoom AND pinch-zoom
- Use `visualViewport` for precise mobile zoom handling

### Code Examples

```javascript
// Screen dimensions (device resolution)
console.log('Screen:', {
  width: window.screen.width,           // e.g., 1920
  height: window.screen.height,         // e.g., 1080
  availWidth: window.screen.availWidth, // e.g., 1920
  availHeight: window.screen.availHeight // e.g., 1050 (minus taskbar)
});

// Browser viewport (most common for responsive design)
console.log('Viewport:', {
  innerWidth: window.innerWidth,   // e.g., 1200 (includes scrollbar)
  innerHeight: window.innerHeight, // e.g., 800
  clientWidth: document.documentElement.clientWidth,   // e.g., 1185 (no scrollbar)
  clientHeight: document.documentElement.clientHeight  // e.g., 800
});

// Visual viewport (advanced zoom handling)
if (window.visualViewport) {
  console.log('Visual Viewport:', {
    width: visualViewport.width,       // Affected by pinch-zoom
    height: visualViewport.height,     // Affected by keyboard
    scale: visualViewport.scale,       // Current zoom level
    offsetLeft: visualViewport.offsetLeft,
    offsetTop: visualViewport.offsetTop
  });
}
```

---

## Device Pixel Ratio (Retina Detection)

### What is devicePixelRatio?

The ratio of physical pixels to CSS pixels. Indicates display density.

**Common Values:**
- `1.0`: Standard displays (96 DPI)
- `2.0`: Retina/HiDPI displays (192 DPI)
- `3.0`: Ultra-high density (iPhone Plus, some Android)
- `1.5`, `1.25`, etc.: Various laptop displays

### Detection Methods

#### JavaScript Detection

```javascript
// Simple detection
function isRetinaDisplay() {
  return window.devicePixelRatio > 1;
}

// Specific ratio check
function getDisplayDensity() {
  const dpr = window.devicePixelRatio || 1;
  if (dpr >= 3) return 'ultra-high';
  if (dpr >= 2) return 'retina';
  if (dpr > 1) return 'high';
  return 'standard';
}

// Current ratio
console.log('Device Pixel Ratio:', window.devicePixelRatio); // e.g., 2
```

#### Media Query Detection (More Reliable)

```javascript
// Detects 2x+ displays (cross-browser)
const isRetina = window.matchMedia(
  '(-webkit-min-device-pixel-ratio: 2), ' +
  '(min-device-pixel-ratio: 2), ' +
  '(min-resolution: 192dpi)'
).matches;

// Detect specific ratios
const is3x = window.matchMedia(
  '(-webkit-min-device-pixel-ratio: 3), ' +
  '(min-resolution: 288dpi)'
).matches;
```

### CSS Media Query Approach

```css
/* Standard display */
.logo {
  background-image: url('logo.png');
}

/* Retina display */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .logo {
    background-image: url('logo@2x.png');
    background-size: 100px 100px; /* Original size */
  }
}

/* Ultra-high density */
@media (-webkit-min-device-pixel-ratio: 3),
       (min-resolution: 288dpi) {
  .logo {
    background-image: url('logo@3x.png');
    background-size: 100px 100px;
  }
}
```

### Canvas Rendering for Retina

```javascript
function setupRetinaCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Set canvas size in memory (scaled for retina)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Set display size (CSS pixels)
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  // Scale context to match
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return ctx;
}
```

### Monitoring DPR Changes

```javascript
// Detects when user moves window to different display or zooms
const dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

dprQuery.addEventListener('change', (e) => {
  console.log('Device pixel ratio changed to:', window.devicePixelRatio);
  // Re-render high-DPI content
});
```

### Important Considerations

- **Page zoom affects devicePixelRatio**: When user zooms in, CSS pixels get larger, so ratio increases
- **Pinch-zoom does NOT affect devicePixelRatio**: Mobile pinch-zoom magnifies without changing CSS pixel size
- **Use matchMedia for reliability**: More stable than direct devicePixelRatio checks
- **Canvas requires special handling**: Must scale canvas buffer to prevent blur on retina

---

## Orientation Detection

### Modern Approach: Screen Orientation API

**Recommended** (but limited Safari support as of 2024)

```javascript
// Check current orientation
if (screen.orientation) {
  console.log('Type:', screen.orientation.type);
  // Values: 'portrait-primary', 'portrait-secondary',
  //         'landscape-primary', 'landscape-secondary'

  console.log('Angle:', screen.orientation.angle);
  // Values: 0, 90, 180, 270

  // Listen for changes
  screen.orientation.addEventListener('change', (event) => {
    console.log('Orientation changed to:', event.target.type);
    console.log('Angle:', event.target.angle);
  });
}
```

### Legacy Approach: orientationchange Event

**Deprecated** but still works broadly

```javascript
// Deprecated - avoid if possible
window.addEventListener('orientationchange', () => {
  console.log('Orientation:', window.orientation);
  // Values: 0 (portrait), 90 (landscape left), -90 (landscape right), 180 (upside down)
});
```

### Media Query Approach (Best Browser Support)

**Most reliable cross-browser solution**

```javascript
// Check current orientation
const isPortrait = window.matchMedia('(orientation: portrait)').matches;
const isLandscape = window.matchMedia('(orientation: landscape)').matches;

// Listen for orientation changes
const portraitQuery = window.matchMedia('(orientation: portrait)');
portraitQuery.addEventListener('change', (e) => {
  if (e.matches) {
    console.log('Device is now in portrait mode');
  } else {
    console.log('Device is now in landscape mode');
  }
});
```

### Dimension-Based Detection (Fallback)

```javascript
function getOrientation() {
  if (window.innerHeight > window.innerWidth) {
    return 'portrait';
  }
  return 'landscape';
}

// Listen via resize (less efficient)
window.addEventListener('resize', () => {
  console.log('Orientation:', getOrientation());
});
```

### Complete Orientation Utility

```javascript
const OrientationDetector = {
  // Get current orientation
  get() {
    // Try modern API first
    if (screen.orientation) {
      return {
        type: screen.orientation.type,
        angle: screen.orientation.angle,
        isPortrait: screen.orientation.type.includes('portrait'),
        isLandscape: screen.orientation.type.includes('landscape')
      };
    }

    // Fallback to media query
    return {
      type: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
      angle: window.orientation || 0,
      isPortrait: window.innerHeight > window.innerWidth,
      isLandscape: window.innerWidth > window.innerHeight
    };
  },

  // Listen for changes
  onChange(callback) {
    // Try modern API
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        callback(this.get());
      });
      return;
    }

    // Fallback to media query
    const query = window.matchMedia('(orientation: portrait)');
    query.addEventListener('change', () => {
      callback(this.get());
    });
  }
};

// Usage
console.log('Current:', OrientationDetector.get());
OrientationDetector.onChange((orientation) => {
  console.log('Changed to:', orientation);
});
```

---

## Safe Area Insets (iOS Notch)

### Overview

iOS devices with notches (iPhone X+) and rounded corners require safe area handling to prevent content from being obscured.

### Required Meta Tag

```html
<!-- MUST include viewport-fit=cover to enable safe area insets -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**viewport-fit values:**
- `auto`: Default, viewport doesn't cover unsafe areas
- `contain`: Viewport is contained within safe area (default behavior)
- `cover`: Viewport extends into unsafe areas (enables env() variables)

### CSS Environment Variables

Four pre-defined environment variables (iOS 11+):

```css
/* Basic padding to avoid notch */
.header {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* Shorthand */
.container {
  padding: env(safe-area-inset-top)
           env(safe-area-inset-right)
           env(safe-area-inset-bottom)
           env(safe-area-inset-left);
}

/* With fallback (for non-iOS devices) */
.safe-padding {
  padding-top: 20px; /* Fallback */
  padding-top: env(safe-area-inset-top); /* iOS override */
}
```

### Combining with Fixed Values

Use `max()` to ensure minimum padding:

```css
/* At least 16px padding, more if safe area requires */
.section {
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

/* Common pattern for headers */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: max(20px, env(safe-area-inset-top));
  background: white;
}
```

### Typical Values by Orientation

**Portrait Mode:**
- `safe-area-inset-top`: ~44px (notch area)
- `safe-area-inset-right`: 0px
- `safe-area-inset-bottom`: ~34px (home indicator)
- `safe-area-inset-left`: 0px

**Landscape Mode:**
- `safe-area-inset-top`: 0px
- `safe-area-inset-right`: ~44px (notch on right in landscape)
- `safe-area-inset-bottom`: ~21px (home indicator)
- `safe-area-inset-left`: ~44px (notch on left in landscape)

### JavaScript Access

```javascript
// Get computed safe area inset values
function getSafeAreaInsets() {
  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: computedStyle.getPropertyValue('--safe-area-inset-top') ||
         computedStyle.paddingTop || '0px',
    right: computedStyle.getPropertyValue('--safe-area-inset-right') || '0px',
    bottom: computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: computedStyle.getPropertyValue('--safe-area-inset-left') || '0px'
  };
}

// Alternative: Use CSS custom properties
// In CSS:
:root {
  --sat: env(safe-area-inset-top);
  --sar: env(safe-area-inset-right);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
}

// In JS:
const insets = {
  top: getComputedStyle(document.documentElement).getPropertyValue('--sat'),
  right: getComputedStyle(document.documentElement).getPropertyValue('--sar'),
  bottom: getComputedStyle(document.documentElement).getPropertyValue('--sab'),
  left: getComputedStyle(document.documentElement).getPropertyValue('--sal')
};
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    }
  }
}

// Usage in classes
// pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right
```

### Common Issues

**Issue**: Safe area insets not working
**Solution**: Ensure `viewport-fit=cover` is in meta tag

**Issue**: Multiple viewport tags conflict
**Solution**: Use only ONE viewport meta tag

**Issue**: Safe area insets apply on desktop
**Solution**: They default to 0px on non-iOS, safe to use everywhere

---

## Touch Capability Detection

### Modern Approach: Pointer Media Queries

**Recommended** (best accuracy, no JavaScript needed)

```javascript
// Detect primary input type
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const hasNoPointer = window.matchMedia('(pointer: none)').matches;

// Detect hover capability
const canHover = window.matchMedia('(hover: hover)').matches;
const cannotHover = window.matchMedia('(hover: none)').matches;

// Best combination: hover-capable fine pointer (mouse/trackpad)
const isMouseDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Touch-primary device (phone, tablet)
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
```

### CSS Media Query Usage

```css
/* Default styles for touch */
.button {
  padding: 16px;
  font-size: 16px;
}

/* Mouse/trackpad optimizations */
@media (hover: hover) and (pointer: fine) {
  .button {
    padding: 8px 16px;
    font-size: 14px;
  }

  .button:hover {
    background-color: #eee;
  }
}

/* Touch-specific */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 44px; /* iOS touch target size */
  }
}
```

### Legacy JavaScript Detection

**Less reliable, but broader support:**

```javascript
// Check for touch events support
function hasTouchSupport() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

// Check for touch AND no mouse (mobile-only)
function isMobileTouch() {
  return hasTouchSupport() &&
         !window.matchMedia('(hover: hover)').matches;
}
```

### Complete Touch Detection Utility

```javascript
const InputCapabilities = {
  // Primary input method
  get primary() {
    if (window.matchMedia('(pointer: fine)').matches) {
      return 'mouse';
    }
    if (window.matchMedia('(pointer: coarse)').matches) {
      return 'touch';
    }
    return 'none';
  },

  // Can hover?
  get canHover() {
    return window.matchMedia('(hover: hover)').matches;
  },

  // Has touch capability?
  get hasTouch() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  },

  // Has mouse capability?
  get hasMouse() {
    return window.matchMedia('(pointer: fine)').matches;
  },

  // Device type inference
  get deviceType() {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const hover = window.matchMedia('(hover: hover)').matches;

    if (fine && hover && !coarse) return 'desktop';
    if (coarse && !hover && !fine) return 'mobile';
    if (fine && coarse) return 'hybrid'; // Touch laptop
    return 'unknown';
  },

  // Get all capabilities
  getAll() {
    return {
      primary: this.primary,
      canHover: this.canHover,
      hasTouch: this.hasTouch,
      hasMouse: this.hasMouse,
      deviceType: this.deviceType,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }
};

// Usage
console.log('Input Capabilities:', InputCapabilities.getAll());
```

### Important Considerations

**Don't assume single input type:**
- Modern devices support multiple inputs (touch laptop, iPad with mouse)
- Input can change at runtime (plug in mouse to tablet)
- Use `any-pointer` and `any-hover` to detect ANY available input

```javascript
// Detect ANY available input (not just primary)
const hasAnyTouch = window.matchMedia('(any-pointer: coarse)').matches;
const hasAnyMouse = window.matchMedia('(any-pointer: fine)').matches;
const hasAnyHover = window.matchMedia('(any-hover: hover)').matches;
```

**Avoid these unreliable methods:**
- User-agent sniffing (easily spoofed, incomplete)
- Screen size checks (tablets can be large, laptops small)
- `navigator.platform` (deprecated)

---

## Complete Detection Utility

Comprehensive utility combining all detection methods:

```javascript
/**
 * Comprehensive Viewport & Device Detection Utility
 * Use for UI debugging and responsive design
 */
const DeviceInfo = {
  // Screen dimensions (physical device)
  get screen() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth
    };
  },

  // Viewport dimensions (browser window)
  get viewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    };
  },

  // Visual viewport (zoom-aware)
  get visualViewport() {
    if (!window.visualViewport) {
      return null;
    }
    return {
      width: visualViewport.width,
      height: visualViewport.height,
      scale: visualViewport.scale,
      offsetLeft: visualViewport.offsetLeft,
      offsetTop: visualViewport.offsetTop,
      pageLeft: visualViewport.pageLeft,
      pageTop: visualViewport.pageTop
    };
  },

  // Display density
  get display() {
    const dpr = window.devicePixelRatio || 1;
    return {
      devicePixelRatio: dpr,
      isRetina: dpr >= 2,
      density: dpr >= 3 ? 'ultra-high' : dpr >= 2 ? 'retina' : dpr > 1 ? 'high' : 'standard'
    };
  },

  // Orientation
  get orientation() {
    const isPortrait = window.innerHeight > window.innerWidth;

    // Try modern API
    if (screen.orientation) {
      return {
        type: screen.orientation.type,
        angle: screen.orientation.angle,
        isPortrait: screen.orientation.type.includes('portrait'),
        isLandscape: screen.orientation.type.includes('landscape')
      };
    }

    // Fallback
    return {
      type: isPortrait ? 'portrait' : 'landscape',
      angle: window.orientation || (isPortrait ? 0 : 90),
      isPortrait,
      isLandscape: !isPortrait
    };
  },

  // Input capabilities
  get input() {
    return {
      primary: window.matchMedia('(pointer: fine)').matches ? 'mouse' :
               window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'none',
      canHover: window.matchMedia('(hover: hover)').matches,
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasMouse: window.matchMedia('(pointer: fine)').matches,
      hasAnyTouch: window.matchMedia('(any-pointer: coarse)').matches,
      hasAnyMouse: window.matchMedia('(any-pointer: fine)').matches,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  },

  // Safe area insets (iOS)
  get safeArea() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('padding-top') || '0px',
      right: style.getPropertyValue('padding-right') || '0px',
      bottom: style.getPropertyValue('padding-bottom') || '0px',
      left: style.getPropertyValue('padding-left') || '0px'
    };
  },

  // Device type inference
  get deviceType() {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const hover = window.matchMedia('(hover: hover)').matches;
    const width = window.innerWidth;

    if (fine && hover && !coarse) {
      return width < 768 ? 'desktop-small' : 'desktop';
    }
    if (coarse && !hover) {
      return width < 768 ? 'mobile' : 'tablet';
    }
    if (fine && coarse) {
      return 'hybrid'; // Touch laptop
    }
    return 'unknown';
  },

  // Get everything
  getAll() {
    return {
      screen: this.screen,
      viewport: this.viewport,
      visualViewport: this.visualViewport,
      display: this.display,
      orientation: this.orientation,
      input: this.input,
      safeArea: this.safeArea,
      deviceType: this.deviceType,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: new Date().toISOString()
    };
  },

  // Log everything to console (debugging)
  logAll() {
    console.group('Device Information');
    console.table(this.screen);
    console.table(this.viewport);
    console.table(this.visualViewport);
    console.table(this.display);
    console.table(this.orientation);
    console.table(this.input);
    console.log('Device Type:', this.deviceType);
    console.groupEnd();
  },

  // Event listeners for changes
  onChange(callback) {
    // Viewport changes
    window.addEventListener('resize', () => callback('resize', this.getAll()));

    // Orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () =>
        callback('orientation', this.getAll())
      );
    } else {
      window.addEventListener('orientationchange', () =>
        callback('orientation', this.getAll())
      );
    }

    // Visual viewport changes
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', () =>
        callback('visualViewport', this.getAll())
      );
      visualViewport.addEventListener('scroll', () =>
        callback('visualViewport', this.getAll())
      );
    }

    // DPR changes (moving between displays)
    const dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener('change', () =>
      callback('devicePixelRatio', this.getAll())
    );
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeviceInfo;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DeviceInfo = DeviceInfo;
}
```

### Usage Examples

```javascript
// Quick logging for debugging
DeviceInfo.logAll();

// Get specific info
console.log('Viewport:', DeviceInfo.viewport);
console.log('Is Retina?', DeviceInfo.display.isRetina);
console.log('Device Type:', DeviceInfo.deviceType);
console.log('Can Hover?', DeviceInfo.input.canHover);

// Get everything as JSON
const info = DeviceInfo.getAll();
console.log(JSON.stringify(info, null, 2));

// Listen for changes
DeviceInfo.onChange((eventType, newInfo) => {
  console.log(`Device info changed (${eventType}):`, newInfo);
});

// Send to analytics
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({
    event: 'page_view',
    deviceInfo: DeviceInfo.getAll()
  })
});
```

### React Hook Version

```javascript
import { useState, useEffect } from 'react';

function useDeviceInfo() {
  const [info, setInfo] = useState(() => DeviceInfo.getAll());

  useEffect(() => {
    const handleChange = (eventType, newInfo) => {
      setInfo(newInfo);
    };

    DeviceInfo.onChange(handleChange);

    // Cleanup not provided by utility, but you could extend it
  }, []);

  return info;
}

// Usage in component
function MyComponent() {
  const deviceInfo = useDeviceInfo();

  return (
    <div>
      <p>Device Type: {deviceInfo.deviceType}</p>
      <p>Viewport: {deviceInfo.viewport.width}x{deviceInfo.viewport.height}</p>
      <p>Retina: {deviceInfo.display.isRetina ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

---

## Quick Reference Summary

### For Responsive Design
- Use: `window.innerWidth` / `window.innerHeight`
- Why: Most common, includes scrollbar, updates on resize/zoom

### For Precise Viewport (No Scrollbar)
- Use: `document.documentElement.clientWidth` / `clientHeight`
- Why: Excludes scrollbar width, exact content area

### For Device Screen Size
- Use: `window.screen.width` / `window.screen.height`
- Why: Physical device resolution, never changes

### For Retina Detection
- Use: Media queries with `matchMedia`
- Why: More reliable than `devicePixelRatio` alone

### For Orientation
- Use: Media query `(orientation: portrait/landscape)`
- Why: Best browser support, most reliable

### For Touch Detection
- Use: `(hover: hover) and (pointer: fine)` for mouse
- Use: `(hover: none) and (pointer: coarse)` for touch
- Why: Modern, accurate, handles hybrid devices

### For iOS Safe Areas
- Use: `env(safe-area-inset-*)` in CSS
- Require: `viewport-fit=cover` in meta tag
- Why: Only way to handle notch properly

---

## Browser Compatibility Notes

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| window.innerWidth | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| visualViewport | ✅ 61+ | ✅ 91+ | ✅ 13+ | ✅ 79+ | ✅ Modern |
| screen.orientation | ✅ 38+ | ✅ 43+ | ⚠️ 16.4+ | ✅ 79+ | ✅ Modern |
| devicePixelRatio | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| pointer media query | ✅ 41+ | ✅ 64+ | ✅ 9+ | ✅ 12+ | ✅ Modern |
| hover media query | ✅ 41+ | ✅ 64+ | ✅ 9+ | ✅ 12+ | ✅ Modern |
| env(safe-area-*) | ❌ No | ❌ No | ✅ 11.1+ | ❌ No | ✅ iOS only |

---

## Common Debugging Scenarios

### Issue: Content Cut Off on Mobile
**Check:**
1. `window.innerHeight` (includes address bar auto-hide)
2. `visualViewport.height` (keyboard visible?)
3. `env(safe-area-inset-bottom)` (iOS home indicator)

### Issue: Blurry on Retina
**Check:**
1. `window.devicePixelRatio` (should be 2+)
2. Canvas scaling (needs `ctx.scale(dpr, dpr)`)
3. Image @2x/@3x versions

### Issue: Layout Breaks on Orientation Change
**Check:**
1. Listen to `screen.orientation.change` or media query
2. Recalculate dimensions (don't cache)
3. Check for hardcoded height values

### Issue: Hover Effects on Touch Devices
**Check:**
1. `(hover: hover)` media query
2. Use `:active` for touch, `:hover` for mouse
3. Separate interaction patterns

---

**Last Updated**: 2025-10-19
**Related Files**: None yet
**Use Cases**: UI debugging, responsive design, device testing, analytics
