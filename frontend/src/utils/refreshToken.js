import API from "../api";

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken"); // Retrieve stored refresh token
    if (!refreshToken) throw new Error("No refresh token found");

    const response = await API.post("/auth/refresh-token", {
      refreshToken, // Include refresh token in the request body
    });

    if (response.status === 200) {
      const data = await response.data;
      localStorage.setItem("token", data.token); // Update access token
      return data.token;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    window.location.href = "/login"; // Redirect if refresh fails
  }
};
