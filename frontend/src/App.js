import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "./api";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateAndRefreshToken = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Attempt to refresh the token
          const response = await API.post("/auth/refresh-token");
          if(response.status === 401) {
            navigate("/login");
          }
          else{
            localStorage.setItem("token", response.data.token);
          }
        } else {
          // Validate the current token
          await API.get("/auth/verifyToken");
        }

        // Redirect to the dashboard if authenticated
        if (location.pathname === "/login" || location.pathname === "/register") {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Token validation or refresh failed:", err);

        // Clear the localStorage and redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    validateAndRefreshToken();
  }, [navigate]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <main>
        <Outlet /> {/* Render nested routes */}
      </main>
      <footer className="mt-auto text-center py-3 bg-light">Copyright @ Pineapple Solutions</footer>
    </div>
  );
};

export default App;
