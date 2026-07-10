import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileUp,
  History,
  Sparkles,
  BookOpen,
  User,
  FolderLock,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    const role = user?.role;
    
    if (role === 'ROLE_ADMIN') {
      return [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/users', name: 'User Directory', icon: <User className="w-5 h-5" /> },
        { path: '/admin/logs', name: 'System Logs', icon: <FolderLock className="w-5 h-5" /> },
      ];
    } else if (role === 'ROLE_TEACHER') {
      return [
        { path: '/teacher/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/teacher/templates', name: 'Templates Manager', icon: <FileUp className="w-5 h-5" /> },
        { path: '/ai-assistant', name: 'AI Coach Assistant', icon: <Sparkles className="w-5 h-5" /> },
        { path: '/teacher/profile', name: 'Profile Settings', icon: <User className="w-5 h-5" /> },
      ];
    } else {
      return [
        { path: '/student/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/student/upload', name: 'Upload Document', icon: <FileUp className="w-5 h-5" /> },
        { path: '/student/history', name: 'Assignment History', icon: <History className="w-5 h-5" /> },
        { path: '/ai-assistant', name: 'AI Coach Assistant', icon: <Sparkles className="w-5 h-5" /> },
        { path: '/student/citation', name: 'Citation Tool', icon: <BookOpen className="w-5 h-5" /> },
        { path: '/student/chat', name: 'AI Chat Coach', icon: <Sparkles className="w-5 h-5" /> },
        { path: '/student/profile', name: 'My Profile', icon: <User className="w-5 h-5" /> },
      ];
    }
  };

  const navLinks = getLinks();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Core */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-white dark:bg-darkbg-card border-r border-slate-200 dark:border-darkbg-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 border-b border-slate-100 dark:border-darkbg-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-500 rounded-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white">Academic AI</span>
            </div>
            
            {/* Close Button on Mobile */}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-500"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Brief profile card */}
          <div className="p-4 mx-4 mt-6 rounded-2xl bg-slate-50 dark:bg-darkbg/40 border border-slate-100 dark:border-darkbg-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center uppercase">
              {user?.name?.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                {user?.role?.replace('ROLE_', '')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1.5" aria-label="Main sidebar navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (isOpen) toggleSidebar(); // Close drawer on link selection on mobile
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-brand-500/20 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkbg-card hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-darkbg-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
