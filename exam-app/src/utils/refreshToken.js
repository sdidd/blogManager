import API from "../api";
// src/utils/auth.js
export const refreshAccessToken = async () => {
  try {
    const response = await API.post("/auth/refresh-token");
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token); // Update access token
      return data.token;
    } else {
      // Redirect to login if refresh fails
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    window.location.href = "/login"; // Redirect if an error occurs
  }
};
