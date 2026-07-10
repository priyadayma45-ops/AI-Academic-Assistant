import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card, { CardBody } from '../../components/Card';
import { ROUTES } from '../../constants/routes';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (!token) {
      setError('Password reset token is missing. Please request a new recovery link.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, data.newPassword);
      setSuccess('Your password has been reset successfully. You can now login with your new password.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
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
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                Set your new account password below.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-700 dark:text-emerald-400 flex flex-col items-center text-center text-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="font-medium">{success}</p>
                <Link
                  to={ROUTES.LOGIN}
                  className="mt-5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow"
                >
                  Sign In
                </Link>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  error={errors.newPassword?.message}
                  required
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Reset Password
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
