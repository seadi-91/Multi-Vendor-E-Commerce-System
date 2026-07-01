import React, { memo } from 'react';

const LoadingSkeleton = memo(({ className = '', variant = 'default' }) => {
  if (variant === 'card') {
    return (
      <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
              <div className="h-2 bg-slate-200 rounded w-1/4 animate-pulse" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
              <div className="h-2 bg-slate-200 rounded w-1/3 animate-pulse" />
            </div>
            <div className="h-6 bg-slate-200 rounded w-8 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
});

export default LoadingSkeleton;
