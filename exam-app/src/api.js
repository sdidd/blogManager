import axios from 'axios';
import { refreshAccessToken } from './utils/refreshToken';

const API = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // Enables sending cookies
});

// Intercept request to add the access token
API.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept response to handle expired tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired, attempt to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the failed request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
