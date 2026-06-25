import axios from 'axios';

let backendURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith('/api')) {
  backendURL = `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: backendURL,
  withCredentials: true, // critical for cookie exchange
});

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refreshes on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        // Query token refresh route
        const res = await axios.post(
          `${backendURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        if (res.status === 200) {
          const { accessToken, refreshToken } = res.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed, logging out user...', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
