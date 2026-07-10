import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card, { CardBody } from '../../components/Card';
import { ROUTES } from '../../constants/routes';

export const Signup = () => {
  const { signup } = useAuth();
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: selectedRole,
        college: selectedRole === 'STUDENT' ? data.college : null,
        branch: selectedRole === 'STUDENT' ? data.branch : null,
        semester: selectedRole === 'STUDENT' ? data.semester : null,
        department: selectedRole === 'TEACHER' ? data.department : null,
        designation: selectedRole === 'TEACHER' ? data.designation : null,
      };

      await signup(payload);
      setSuccess('Registration successful! Please check your terminal console logs to copy the simulated verification link and verify your email.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 py-12 px-4">
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

      {/* Card container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        <Card glass className="shadow-2xl">
          <CardBody className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/30 flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Join AI Academic Assistant to check your work.
              </p>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Sign Up Failed:</span> {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Success!</span> {success}
                    <div className="mt-4">
                      <Link
                        to={ROUTES.LOGIN}
                        className="px-4 py-2 bg-emerald-605 hover:bg-emerald-700 text-white font-semibold rounded-lg inline-block text-xs transition-colors shadow"
                      >
                        Go to Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    error={errors.name?.message}
                    required
                    {...register('name', { required: 'Name is required' })}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. john@college.edu"
                    error={errors.email?.message}
                    required
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                    })}
                  />
                </div>

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  error={errors.password?.message}
                  required
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />

                {/* Role Tabs */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-darkbg-card rounded-xl border border-slate-200 dark:border-darkbg-border">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('STUDENT')}
                      className={`py-2.5 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase ${
                        selectedRole === 'STUDENT'
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('TEACHER')}
                      className={`py-2.5 rounded-lg font-semibold text-xs tracking-wider transition-all uppercase ${
                        selectedRole === 'TEACHER'
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Teacher
                    </button>
                  </div>
                </div>

                {/* Dynamic Fields */}
                <AnimatePresence mode="wait">
                  {selectedRole === 'STUDENT' ? (
                    <motion.div
                      key="student-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="College / Uni"
                          placeholder="e.g. UCLA"
                          {...register('college')}
                        />
                        <Input
                          label="Branch"
                          placeholder="e.g. CSE"
                          {...register('branch')}
                        />
                        <Input
                          label="Semester"
                          placeholder="e.g. Semester 4"
                          {...register('semester')}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="teacher-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Department"
                          placeholder="e.g. Physics"
                          error={errors.department?.message}
                          required={selectedRole === 'TEACHER'}
                          {...register('department', { required: selectedRole === 'TEACHER' ? 'Department is required' : false })}
                        />
                        <Input
                          label="Designation"
                          placeholder="e.g. Lecturer"
                          error={errors.designation?.message}
                          required={selectedRole === 'TEACHER'}
                          {...register('designation', { required: selectedRole === 'TEACHER' ? 'Designation is required' : false })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </form>
            )}

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="font-semibold text-brand-500 hover:underline">
                Sign In Here
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
