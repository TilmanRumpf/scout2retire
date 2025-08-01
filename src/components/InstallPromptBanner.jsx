import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function InstallPromptBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
    } else {
      const installed = await promptInstall();
      if (installed) {
        handleDismiss();
      }
    }
  };

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-scout-accent-100 dark:bg-scout-accent-900 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-scout-accent-600 dark:text-scout-accent-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Install Scout2Retire
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Add to your home screen for the best experience - no browser bar!
            </p>
            
            <button
              onClick={handleInstall}
              className="mt-3 px-4 py-2 bg-scout-accent-600 text-white text-sm font-medium rounded-lg hover:bg-scout-accent-700 transition-colors"
            >
              {isIOS ? 'Show Instructions' : 'Install App'}
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showInstructions && isIOS && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowInstructions(false)}
          />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Install Scout2Retire
            </h3>
            
            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-scout-accent-100 dark:bg-scout-accent-900 rounded-full flex items-center justify-center text-xs font-medium text-scout-accent-700 dark:text-scout-accent-300">
                  1
                </span>
                <div>
                  Tap the share button <Share className="inline w-4 h-4" /> at the bottom of Safari
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-scout-accent-100 dark:bg-scout-accent-900 rounded-full flex items-center justify-center text-xs font-medium text-scout-accent-700 dark:text-scout-accent-300">
                  2
                </span>
                <div>
                  Scroll down and tap "Add to Home Screen"
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-scout-accent-100 dark:bg-scout-accent-900 rounded-full flex items-center justify-center text-xs font-medium text-scout-accent-700 dark:text-scout-accent-300">
                  3
                </span>
                <div>
                  Tap "Add" to install
                </div>
              </li>
            </ol>
            
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}