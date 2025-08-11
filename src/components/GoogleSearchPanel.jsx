// Google Search Panel - A compact side panel for quick Google searches
import { useEffect, useState } from 'react';

export default function GoogleSearchPanel({ isOpen, onClose, searchQuery, fieldName }) {
  const [isLoading, setIsLoading] = useState(true);
  
  if (!isOpen) return null;
  
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&igu=1`;
  
  return (
    <>
      {/* Backdrop - click to close */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Side Panel - 1/4 width on right side */}
      <div className="fixed right-0 top-0 h-full w-1/4 min-w-[400px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-gray-700">Google Search</span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            title="Close search panel"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Query Display */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <div className="text-xs text-gray-600 mb-1">Searching for:</div>
          <div className="text-sm font-medium text-gray-800">{searchQuery}</div>
          {fieldName && (
            <div className="text-xs text-gray-500 mt-1">Field: {fieldName}</div>
          )}
        </div>
        
        {/* Google Search iframe */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-gray-500">Loading Google Search...</div>
            </div>
          )}
          <iframe
            src={googleSearchUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title="Google Search Results"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
        
        {/* Footer with helpful actions */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in new tab
          </button>
          
          {/* Large, prominent close button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg text-base"
          >
            ✕ Close Search Panel
          </button>
        </div>
      </div>
    </>
  );
}