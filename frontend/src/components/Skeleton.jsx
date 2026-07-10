import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-4 ${
            idx === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`p-6 rounded-3xl border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card space-y-4 ${className}`}>
      <Skeleton className="h-6 w-1/3 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 4, cols = 4, className = '' }) => {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card ${className}`}>
      {/* Header Skeleton */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-darkbg-card/40 border-b border-slate-200 dark:border-darkbg-border flex justify-between gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton key={idx} className="h-4 w-20 rounded" />
        ))}
      </div>
      {/* Body Rows Skeleton */}
      <div className="divide-y divide-slate-100 dark:divide-darkbg-border px-6">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="py-5 flex justify-between gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={`h-4 rounded ${
                  colIdx === 0 ? 'w-24' : colIdx === cols - 1 ? 'w-16' : 'w-20'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
