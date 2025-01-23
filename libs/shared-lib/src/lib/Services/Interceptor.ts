import axios from 'axios';
const baseURL = 'http://localhost:3000';
console.log('Base URL-services:', baseURL);
const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
instance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(new Error(error?.message || 'Request error'))
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        console.error('Unauthorized, logging out...');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else if (!error.response) {
        console.error('Network error occurred');
      }
    }
    if (!(error instanceof Error)) {
      const message = error?.message || 'An unknown error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export default instance;
