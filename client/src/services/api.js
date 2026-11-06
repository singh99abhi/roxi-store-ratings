import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('storehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('storehub_token')) {
        localStorage.removeItem('storehub_token');
        localStorage.removeItem('storehub_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
