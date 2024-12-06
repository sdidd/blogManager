import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../api";

const PrivateRoute = ({ requiredPermissions = [] }) => {
  const [permissions, setPermissions] = useState([]); // Store user permissions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const response = await API.get("/auth/getPermissions");
        setPermissions(response.data.permissions || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!permissions.length) return <Navigate to="/login" />;

  // Permission check
  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((perm) => permissions.includes(perm))
  ) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
