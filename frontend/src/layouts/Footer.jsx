import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-6 px-8 border-t border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-center text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} AI Academic Assistant. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#terms" className="hover:text-slate-650 transition-colors">Terms of Service</a>
          <a href="#privacy" className="hover:text-slate-650 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
