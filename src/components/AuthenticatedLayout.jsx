// src/components/AuthenticatedLayout.jsx
import React from 'react';
import QuickNav from './QuickNav';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Main content - simply pass through children */}
      {children}
      
      {/* QuickNav - added to all authenticated pages */}
      <QuickNav />
    </div>
  );
}