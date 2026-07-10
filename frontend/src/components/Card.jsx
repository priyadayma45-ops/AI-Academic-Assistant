import React from 'react';

export const Card = ({
  children,
  className = '',
  glass = false,
  onClick,
  hoverable = false,
  ...props
}) => {
  const baseStyle = 'rounded-3xl border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-slate-800 dark:text-slate-250 transition-all';
  
  const glassStyle = 'glass border border-white/35 dark:border-darkbg-border bg-white/70 dark:bg-darkbg-card/70 backdrop-blur-xl';
  const hoverStyle = hoverable ? 'hover:scale-[1.01] hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${glass ? glassStyle : baseStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-slate-100 dark:border-darkbg-border flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-slate-100 dark:border-darkbg-border bg-slate-50/50 dark:bg-darkbg-card/30 rounded-b-3xl ${className}`}>
    {children}
  </div>
);

export default Card;
