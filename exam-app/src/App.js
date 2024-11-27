import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { refreshAccessToken } from "./utils/refreshToken";
// import API from "./api";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // //refresh token logic
  // useEffect(() => {
  //   const initAuth = async () => {
  //     await refreshAccessToken();
  //   };

  //   initAuth();
  // }, [navigate]);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // const token = localStorage.getItem("token");
          // const response = await API.get("/auth/verifyToken");
          navigate("/dashboard");
        } else if (
          location.pathname === "/register" ||
          location.pathname === "home"
        ) {
          navigate(location.pathname);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Token validation failed:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    validateToken();
  }, [navigate]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <main>
        <Outlet /> {/* Render nested routes */}
      </main>
      <footer className="mt-auto text-center py-3 bg-light">
        Copyright @ Pineapple Solutions
      </footer>
    </div>
  );  
};

export default App;
