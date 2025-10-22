"use client";

import React from "react";

interface FilterPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function FilterPanel({ title, description, children, actions, className }: FilterPanelProps) {
  return (
    <div className={`relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 ${className || ''}`}>
      {(title || description) && (
        <div className="mb-4 md:mb-6">
          {title && <h2 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h2>}
          {description && <p className="text-xs md:text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
        {actions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 pt-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

