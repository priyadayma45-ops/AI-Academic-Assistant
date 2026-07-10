import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-brand-200/50 dark:bg-brand-900/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl glass shadow-2xl text-center flex flex-col items-center z-10"
      >
        <div className="p-4 bg-brand-100 dark:bg-brand-900/20 text-brand-500 rounded-2xl mb-6">
          <HelpCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">404</h1>
        <h2 className="text-lg font-bold mb-4">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
