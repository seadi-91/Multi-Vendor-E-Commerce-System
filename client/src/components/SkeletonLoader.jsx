import React from 'react';

/**
 * SkeletonLoader - Professional loading skeleton for charts and tables
 * 
 * Props:
 *   type: 'chart' | 'table' | 'card' | 'stat'
 *   rows: number of table rows (for table type)
 *   height: height in pixels (for chart type)
 */
export default function SkeletonLoader({ type = 'card', rows = 5, height = 300 }) {
  if (type === 'chart') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3">
        {/* Table header */}
        <div className="h-10 bg-slate-200 rounded"></div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="w-full h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
    );
  }

  // Default card skeleton
  return (
    <div className="w-full h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
  );
}