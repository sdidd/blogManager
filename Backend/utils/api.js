const axios = require("axios");

const cdnAPI = axios.create({
  baseURL: process.env.NODE_ENV == "development"?process.env.CDN_BASE_URL:process.env.CDN_BASE_URL,
  withCredentials: true, // Enables sending cookies
})

const emailAPI = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:4001" 
    : process.env.EMAIL_BACKEND_BASE_URL, // Use BASE_URL from environment variables in production
  timeout: 5000, // Optional timeout for API requests
  headers: {
    "Content-Type": "application/json",
  },
});

cdnAPI.interceptors.request.use((config) => {
  // const token = ;
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  //   if(process.env.NODE_ENV == "development"){
  //     console.log('Token attached:', config.headers.Authorization);
  //   }
  // }
  config.headers['Content-Type'] =   "multipart/form-data; boundary=<calculated when request is sent>";
  return config;
});
module.exports = {emailAPI, cdnAPI};
