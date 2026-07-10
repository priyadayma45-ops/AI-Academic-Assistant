import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles, LogIn, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card, { CardBody } from '../../components/Card';
import { ROUTES } from '../../constants/routes';

export const Login = () => {
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const response = await login(data.email, data.password);
      const role = response.data.role;
      
      if (role === 'ROLE_ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (role === 'ROLE_TEACHER') {
        navigate(ROUTES.TEACHER_DASHBOARD);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-200 dark:bg-brand-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-200 dark:bg-indigo-900/10 blur-[100px] pointer-events-none" />

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl glass hover:scale-105 transition-all text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500/20 outline-none"
        aria-label="Toggle color mode"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card glass className="shadow-2xl">
          <CardBody className="p-8">
            {/* Header branding */}
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/30 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Academic Assistant</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                Sign in to check assignments and verify compliance.
              </p>
            </div>

            {/* Errors */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Login Failed:</span> {error}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. john@university.edu"
                error={errors.email?.message}
                required
                {...register('email', {
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </span>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to={ROUTES.SIGNUP} className="font-semibold text-brand-500 hover:underline">
                Register Here
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
