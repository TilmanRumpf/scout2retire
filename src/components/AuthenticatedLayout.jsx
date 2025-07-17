// src/components/AuthenticatedLayout.jsx
import React from 'react';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Main content - simply pass through children */}
      {children}
    </div>
  );
}