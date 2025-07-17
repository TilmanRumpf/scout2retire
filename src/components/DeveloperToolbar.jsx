// Scout2Retire Developer Toolbar
// Provides real-time feedback and tools during development

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import errorReporter from '../utils/errorReporter';

export default function DeveloperToolbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [violations, setViolations] = useState({ total: 0, byType: {} });
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    // Update violations every second
    const interval = setInterval(() => {
      setViolations(errorReporter.getSummary());
    }, 1000);

    // Listen for dark mode changes
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const runChecks = () => {
    // Force re-check all elements
    document.querySelectorAll('*').forEach(element => {
      errorReporter.checkElement(element);
    });
    setViolations(errorReporter.getSummary());
  };

  const clearViolations = () => {
    errorReporter.clear();
    setViolations({ total: 0, byType: {} });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Show Developer Toolbar"
      >
        <Eye size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 ${isExpanded ? 'w-80' : 'w-auto'} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}>
      {/* Collapsed View */}
      {!isExpanded && (
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            {violations.total === 0 ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">No Issues</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">{violations.total} Issues</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Hide Toolbar"
          >
            <EyeOff size={14} />
          </button>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Developer Tools
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Collapse"
              >
                <XCircle size={14} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Hide Toolbar"
              >
                <EyeOff size={14} />
              </button>
            </div>
          </div>

          {/* Violations Summary */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Code Quality Issues
            </h4>
            {violations.total === 0 ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">All checks passed!</span>
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(violations.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {type} Issues:
                    </span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={runChecks}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              <RefreshCw size={14} />
              Run Checks
            </button>
            
            <button
              onClick={clearViolations}
              className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Clear Issues
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Toggle {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Links
            </h4>
            <div className="space-y-1">
              <a
                href="/CLAUDE.md"
                target="_blank"
                className="block text-xs text-blue-500 hover:underline"
              >
                Project Guidelines
              </a>
              <a
                href="/docs/DEVELOPMENT_PROCESS.md"
                target="_blank"
                className="block text-xs text-blue-500 hover:underline"
              >
                Development Process
              </a>
              <a
                href="/src/styles/uiConfig.ts"
                target="_blank"
                className="block text-xs text-blue-500 hover:underline"
              >
                UI Config
              </a>
            </div>
          </div>

          {/* Viewport Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div>Viewport: {window.innerWidth} × {window.innerHeight}</div>
              <div>Device: {window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}