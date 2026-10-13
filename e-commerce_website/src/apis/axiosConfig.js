
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});


export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
      const status = error.response?.status; 
      const tokenExists = localStorage.getItem('token');

      if (status === 401 && error.config.url !== '/auth/login' && tokenExists) { 
            

            clearAuthToken();
            
            localStorage.removeItem('token'); 

            window.location.href = '/login';

            return Promise.reject(error);
      }
      return Promise.reject(error);
  }
);


export default api; 