import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import API from "../api";

const PrivateRoute = ({ allowedRoles = [], requiredPermissions = [] }) => {
  const [user, setUser] = useState(null); // Store user details
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const response = await API.get("/auth/verifyToken");
        setUser({
          role: response.data.user.role,
          permissions: response.data.user.permissions || [],
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Permission check
  if (requiredPermissions.length > 0 && !requiredPermissions.every((perm) => user.permissions.includes(perm))) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
