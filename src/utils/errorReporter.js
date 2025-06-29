// Scout2Retire Error Reporter
// Provides real-time feedback for development issues

import { uiConfig } from '../styles/uiConfig';

class ErrorReporter {
  constructor() {
    this.violations = [];
    this.overlayElement = null;
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Report style violations
  reportStyleViolation(component, element, violation) {
    if (!this.isEnabled) return;

    const issue = {
      type: 'style',
      component,
      element: element?.tagName || 'unknown',
      className: element?.className || '',
      violation,
      suggestion: this.getStyleSuggestion(violation),
      timestamp: new Date().toISOString()
    };

    this.violations.push(issue);
    console.warn('[Style Violation]', issue);
    
    // Show visual feedback
    this.showVisualFeedback(issue);
  }

  // Report navigation issues
  reportNavigationIssue(page, issue) {
    if (!this.isEnabled) return;

    const problem = {
      type: 'navigation',
      page,
      issue,
      suggestion: this.getNavigationSuggestion(issue),
      timestamp: new Date().toISOString()
    };

    this.violations.push(problem);
    console.error('[Navigation Issue]', problem);
    
    // Show visual feedback
    this.showVisualFeedback(problem);
  }

  // Report state management issues
  reportStateIssue(component, issue) {
    if (!this.isEnabled) return;

    const problem = {
      type: 'state',
      component,
      issue,
      suggestion: 'Check event handlers and state updates',
      timestamp: new Date().toISOString()
    };

    this.violations.push(problem);
    console.error('[State Issue]', problem);
  }

  // Get style violation suggestions
  getStyleSuggestion(violation) {
    const suggestions = {
      'hardcoded-padding': 'Use uiConfig.layout.spacing values',
      'hardcoded-margin': 'Use uiConfig.layout.spacing values',
      'hardcoded-color': 'Use uiConfig.colors values',
      'hardcoded-width': 'Use uiConfig.layout.width values',
      'inline-style': 'Move to uiConfig.ts or use Tailwind classes',
      'inconsistent-button': 'Use uiConfig.components.buttonSizes'
    };

    return suggestions[violation] || 'Check uiConfig.ts for proper values';
  }

  // Get navigation suggestions
  getNavigationSuggestion(issue) {
    const suggestions = {
      'missing-navigation': 'Add QuickNav or HamburgerMenu component',
      'duplicate-navigation': 'Remove duplicate navigation component',
      'wrong-navigation-type': 'Use QuickNav for app pages, OnboardingProgressiveNav for onboarding'
    };

    return suggestions[issue] || 'Check navigation patterns in other pages';
  }

  // Show visual feedback overlay
  showVisualFeedback(issue) {
    if (!this.isEnabled) return;

    // Remove existing overlay
    if (this.overlayElement) {
      this.overlayElement.remove();
    }

    // Create new overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'scout2retire-error-overlay';
    this.overlayElement.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${issue.type === 'style' ? '#FEF3C7' : '#FEE2E2'};
        border: 2px solid ${issue.type === 'style' ? '#F59E0B' : '#EF4444'};
        border-radius: 8px;
        padding: 16px;
        max-width: 400px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 style="
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: ${issue.type === 'style' ? '#92400E' : '#991B1B'};
            ">
              ${issue.type === 'style' ? '⚠️ Style Violation' : '❌ ' + issue.type.charAt(0).toUpperCase() + issue.type.slice(1) + ' Issue'}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
              <strong>Component:</strong> ${issue.component || issue.page || 'Unknown'}<br>
              <strong>Issue:</strong> ${issue.violation || issue.issue}
            </p>
            <p style="
              margin: 0;
              padding: 8px;
              background: ${issue.type === 'style' ? '#FEF3C7' : '#FEF3C7'};
              border-radius: 4px;
              font-size: 13px;
              color: #374151;
            ">
              💡 <strong>Suggestion:</strong> ${issue.suggestion}
            </p>
          </div>
          <button onclick="document.getElementById('scout2retire-error-overlay').remove()" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 12px;
            color: #6B7280;
          ">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlayElement);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (this.overlayElement) {
        this.overlayElement.remove();
        this.overlayElement = null;
      }
    }, 10000);
  }

  // Check element for violations
  checkElement(element) {
    if (!this.isEnabled || !element || !element.className) return;

    const className = element.className.toString();
    const classList = className.split(' ');

    // Check for hardcoded styles
    classList.forEach(cls => {
      // Padding/margin violations
      if (/^(p|m|px|py|mx|my)-\d+$/.test(cls)) {
        this.reportStyleViolation(
          element.closest('[data-component]')?.dataset.component || 'Unknown',
          element,
          'hardcoded-padding'
        );
      }

      // Color violations
      if (/^(text|bg|border)-(gray|green|blue|red|yellow)-\d+$/.test(cls)) {
        this.reportStyleViolation(
          element.closest('[data-component]')?.dataset.component || 'Unknown',
          element,
          'hardcoded-color'
        );
      }

      // Width violations
      if (/^max-w-(sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/.test(cls)) {
        this.reportStyleViolation(
          element.closest('[data-component]')?.dataset.component || 'Unknown',
          element,
          'hardcoded-width'
        );
      }
    });

    // Check for inline styles
    if (element.style && element.style.cssText) {
      this.reportStyleViolation(
        element.closest('[data-component]')?.dataset.component || 'Unknown',
        element,
        'inline-style'
      );
    }
  }

  // Get violation summary
  getSummary() {
    const summary = {
      total: this.violations.length,
      byType: {},
      recent: this.violations.slice(-5)
    };

    this.violations.forEach(v => {
      summary.byType[v.type] = (summary.byType[v.type] || 0) + 1;
    });

    return summary;
  }

  // Clear violations
  clear() {
    this.violations = [];
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }
}

// Create singleton instance
const errorReporter = new ErrorReporter();

// Development-only DOM observer
if (process.env.NODE_ENV === 'development') {
  // Observe DOM changes and check for violations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          errorReporter.checkElement(node);
          // Check all child elements
          node.querySelectorAll('*').forEach(child => {
            errorReporter.checkElement(child);
          });
        }
      });
    });
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

export default errorReporter;