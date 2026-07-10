import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import VerifyEmail from './features/auth/VerifyEmail';
import StudentDashboard from './features/dashboard/StudentDashboard';
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import { ROUTES } from './constants/routes';

// Redirect route selector
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  if (user?.role === 'ROLE_ADMIN') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  } else if (user?.role === 'ROLE_TEACHER') {
    return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />;
  } else {
    return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.SIGNUP} element={<Signup />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
                <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
                
                {/* Error Page Routes */}
                <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
                <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

                {/* Protected Student Routes */}
                <Route
                  path={ROUTES.STUDENT_DASHBOARD}
                  element = {
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Teacher Routes */}
                <Route
                  path={ROUTES.TEACHER_DASHBOARD}
                  element = {
                    <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path={ROUTES.ADMIN_DASHBOARD}
                  element = {
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Root Route Redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Fallback to 404 */}
                <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
