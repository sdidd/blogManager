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

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
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
                element: <PrivateRoute allowedRoles={[roles.admin]} />, // Protected admin dashboard
                children: [
                  {
                    path: "",
                    element: <AdminDashboard />,
                    children: [{ path: "role-management", element: <RoleManagement /> }],
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
