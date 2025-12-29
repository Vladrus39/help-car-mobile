import axios from 'axios';

// ==== БАЗОВЫЕ НАСТРОЙКИ ====
axios.defaults.baseURL = '/api/v1'; // запросы идут к backend через Nginx proxy (с версионированием API)
axios.defaults.headers.post['Content-Type'] = 'application/json';

// ==== ДОБАВЛЕНИЕ ТОКЕНА КО ВСЕМ ЗАПРОСАМ ====
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
