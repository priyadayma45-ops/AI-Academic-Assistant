import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card, { CardBody } from '../../components/Card';
import { ROUTES } from '../../constants/routes';

export const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSuccess('If this email is registered, we have simulated sending a password reset link. Please check your backend terminal console logs.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit recovery request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-200 dark:bg-brand-900/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card glass className="shadow-2xl">
          <CardBody className="p-8">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>

            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Recover Password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                Enter your email to receive a password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-850 dark:text-emerald-400 flex flex-col items-center text-center text-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. user@college.edu"
                  error={errors.email?.message}
                  required
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
