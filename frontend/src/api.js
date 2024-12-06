import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // Enables sending cookies
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token attached:', config.headers.Authorization);
  }
  return config;
});


export default API;
