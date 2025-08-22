// src/components/AuthenticatedLayout.jsx
import React from 'react';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Main content - no padding needed anymore */}
      <div>
        {children}
      </div>
    </div>
  );
}