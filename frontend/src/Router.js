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
import Settings from "./components/admin/Settings";

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
                path: "results", // Nested inside Dashboard
                element: <Results />,
              },
              {
                path: "admindashboard",
                element: <PrivateRoute requiredPermissions = {["view:admindashboard"]} />, // Protected admin dashboard
                children: [
                  {
                    path: "",
                    element: <AdminDashboard />,
                    children: [
                      { path: "role-management", element: <RoleManagement /> },
                      { path: "user-management", element: <UserManagement /> },
                      { path: "settings", element: <Settings /> },
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
]);

export default Router;
