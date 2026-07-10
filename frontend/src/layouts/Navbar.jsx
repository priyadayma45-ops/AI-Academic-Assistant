import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Bell } from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/70 dark:bg-darkbg-card/70 backdrop-blur-md border-b border-slate-200 dark:border-darkbg-border z-30 transition-all">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-500"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h2 className="text-base font-bold text-slate-800 dark:text-white hidden sm:block">
            Dashboard
          </h2>
        </div>

        {/* Right user profile controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
            aria-label="Toggle color mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Separation line */}
          <div className="w-px h-6 bg-slate-200 dark:bg-darkbg-border mx-1" />

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 pl-1">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.substring(0, 2)}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-slate-900 dark:text-white">{user?.name}</span>
              <span className="block text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
