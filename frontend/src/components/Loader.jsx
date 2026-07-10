import React from 'react';
import { Sparkles } from 'lucide-react';

export const Loader = ({ fullPage = false, size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4">
        {/* Animated Spin Ring */}
        <div className={`rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand-500 animate-spin ${sizeClasses[size]}`} />
        <Sparkles className="absolute inset-0 m-auto text-brand-500 w-4 h-4 animate-pulse" />
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 dark:bg-darkbg/70 backdrop-blur-md">
        <div className="p-8 rounded-3xl glass shadow-2xl">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
