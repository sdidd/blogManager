import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.NODE_ENV == "development"?"http://localhost:4000":import.meta.env.VITE_APP_BACKEND_BASE_URL,
  withCredentials: true, // Enables sending cookies
});

export const emailAPI = axios.create({
  baseURL: import.meta.env.NODE_ENV == "development"?"http://localhost:4001":import.meta.env.VITE_APP_EMAIL_BACKEND_BASE_URL,
  withCredentials: true, // Enables sending cookies
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if(import.meta.env.NODE_ENV == "development"){
      console.log('Token attached:', config.headers.Authorization);
    }
  }
  return config;
});
emailAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if(import.meta.env.NODE_ENV == "development"){
      console.log('Token attached:', config.headers.Authorization);
    }
  }
  return config;
});


export default API;
