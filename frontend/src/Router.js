import React from "react";import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Error from "./components/Error";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Results from "./components/Results";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import RoleManagement from "./components/admin/RoleManagement";
import roles from "./utils/roles";
import Home from "./components/Home";
import UserManagement from "./components/admin/UserManagement";
import SessionManagement from "./components/admin/SessionManagement";
import LogsManagement from "./components/admin/LogsManagement";
import Redis from "./components/development/Redis";
import ImageUploader from "./components/dashboard/ImageUploader";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "", element: <Home /> },
      {
        path: "dashboard",
        element: <PrivateRoute />, // Protected general dashboard
        children: [
          {
            path: "",
            element: <Dashboard />,
            children: [
              {
                path: "profile", // Nested inside Dashboard
                element: <Profile />,
              },
              {
                path: "images", // Nested inside Dashboard
                element: <ImageUploader />,
              },
              {
                path: "admindashboard",
                element: <PrivateRoute requiredPermissions={["view:admindashboard"]} />, // Protected admin dashboard
                children: [
                  {
                    path: "",
                    element: <AdminDashboard />,
                    children: [
                      { path: "role-management", element: <RoleManagement /> },
                      { path: "user-management", element: <UserManagement /> },
                      { path: "log-management", element: <LogsManagement /> },
                      { path: "session-management", element: <SessionManagement /> },
                    ],
                    errorElement: <Error />,
                  },
                ],
              },
            ],
          }, // Render Dashboard layout
        ],
      },
    ],
  },
  {
    path: "/redis",
    element: <Redis />,
    errorElement: <Error />,
  },
]);

export default Router;
