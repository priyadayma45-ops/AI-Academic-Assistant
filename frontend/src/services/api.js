import axios from 'axios';

// Generate simple UUID for request tracing
const generateRequestId = () => {
  return 'js-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token & Request ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Inject client-side request tracing ID
    config.headers['X-Request-ID'] = generateRequestId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refreshing on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response.data; // Return standard backend ApiResponse wrapper directly
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error doesn't have response, it's a network error
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check if the backend server is running.'));
    }

    const { status } = error.response;
    const isAuthRoute = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/signup');

    // Attempt token refresh on 401 if it's not an auth endpoint already
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        // Broadcast custom logout event so AuthContext can clean up state
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error.response.data || error);
      }

      try {
        // Run refresh using axios to avoid config loops in api client
        const response = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
          refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': generateRequestId()
          }
        });

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError.response?.data || refreshError);
      }
    }

    return Promise.reject(error.response.data || error);
  }
);

export default api;
