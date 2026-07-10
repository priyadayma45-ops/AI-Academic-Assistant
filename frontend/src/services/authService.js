import api from './api';

const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  signup: async (signupData) => {
    return api.post('/auth/signup', signupData);
  },

  verifyEmail: async (token) => {
    return api.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  logout: async () => {
    return api.post('/auth/logout');
  }
};

export default authService;
