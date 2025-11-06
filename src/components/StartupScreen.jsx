import React from 'react';

export default function StartupScreen() {
  // Simple static screen - we'll add logic later
  const logoUrl = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/logos/S2R-Regular-Solid.png';

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
      {/* Logo with pulse animation */}
      <div className="animate-pulse-scale">
        <img
          src={logoUrl}
          alt="Scout2Retire"
          className="h-24 w-auto mb-6"
        />
      </div>

      {/* Slogan */}
      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center px-6 max-w-md font-light">
        brings your future home to life long before you arrive...
      </p>

      {/* Loading dots */}
      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
