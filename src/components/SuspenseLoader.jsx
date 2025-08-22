import React from 'react';
import { uiConfig } from '../styles/uiConfig';

const SuspenseLoader = () => {
  return (
    <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center`}>
      <div className="text-center">
        <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid ${uiConfig.colors.accent} border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}>
          <span className="sr-only">Loading...</span>
        </div>
        <p className={`mt-4 ${uiConfig.colors.body} ${uiConfig.animation.pulse}`}>
          Loading...
        </p>
      </div>
    </div>
  );
};

export default SuspenseLoader;