import React from 'react';

export const Table = ({
  headers = [],
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card ${className}`}>
      <table className="w-full text-left border-collapse text-sm text-slate-800 dark:text-slate-200" {...props}>
        <thead className="bg-slate-50 dark:bg-darkbg-card/40 border-b border-slate-200 dark:border-darkbg-border">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className = '', onClick, ...props }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap align-middle ${className}`} {...props}>
    {children}
  </td>
);

export default Table;
