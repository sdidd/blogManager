const axios = require("axios");

const emailAPI = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:4001" 
    : process.env.EMAIL_BACKEND_BASE_URL, // Use BASE_URL from environment variables in production
  timeout: 5000, // Optional timeout for API requests
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = emailAPI;
