import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach token on every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('yt_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
