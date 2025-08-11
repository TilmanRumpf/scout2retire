import { useState, useEffect } from 'react';

const GoogleSearchPopup = ({ searchQuery, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Give iframe time to load
      const timer = setTimeout(() => setIsLoading(false), 2000);
      
      // Add a one-time console message about expected errors
      if (process.env.NODE_ENV === 'development') {
        console.info(
          '%c⚠️ Expected Google iframe errors:',
          'color: #FFA500; font-weight: bold;',
          '\nYou may see 404/401 errors from google.com domains - these are normal and don\'t affect functionality.'
        );
      }
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  // Encode the search query for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}&igu=1`;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Popup Window - Right quarter of screen */}
      <div className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 xl:w-1/3 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-gray-700">Search Results</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
        
        {/* Search Query Display */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <p className="text-sm text-gray-600">
            Searching for: <span className="font-medium text-gray-800">{searchQuery}</span>
          </p>
        </div>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading search results...</span>
          </div>
        )}
        
        {/* Google Search iframe */}
        <iframe
          src={googleSearchUrl}
          className={`flex-1 w-full ${isLoading ? 'hidden' : ''}`}
          title="Google Search Results"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            // Silently handle iframe errors
            e.preventDefault();
          }}
        />
        
        {/* Note about iframe limitations */}
        <div className="px-4 py-2 bg-yellow-50 border-t text-xs text-gray-600">
          <p>Note: Some Google features may be limited in embedded view. Click "Open in new tab" for full experience.</p>
          <a 
            href={`https://www.google.com/search?q=${encodedQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Open in new tab →
          </a>
        </div>
      </div>
    </>
  );
};

export default GoogleSearchPopup;