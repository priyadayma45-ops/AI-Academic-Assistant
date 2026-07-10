import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Sparkles } from 'lucide-react';
import Card, { CardBody } from '../../components/Card';
import { ROUTES } from '../../constants/routes';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your verification link.');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-200 dark:bg-brand-900/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <Card glass className="shadow-2xl">
          <CardBody className="p-8 flex flex-col items-center">
            <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>

            {status === 'verifying' && (
              <div className="flex flex-col items-center py-6">
                <Loader className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Verifying Email...</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Confirming credentials with the server. Please wait.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-6">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email Verified!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center">
                  Your account is verified. You can now login.
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="mt-6 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/25"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center py-6">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
                <p className="text-red-500 mt-2 text-sm font-medium text-center">
                  {message}
                </p>
                <Link
                  to={ROUTES.SIGNUP}
                  className="mt-6 px-6 py-2.5 bg-slate-200 dark:bg-darkbg-card hover:bg-slate-350 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors"
                >
                  Sign Up Again
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
