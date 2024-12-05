import React from "react";import { useNavigate } from "react-router-dom";
import API from "../api";

const Logout = (props) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const response = await API.post("/auth/logout");
    if (response.status === 200) {
      localStorage.removeItem("token");
    }
    navigate("/login"); // Redirect to Login
  };
  return (
    <>
    {(props.inside === 'dropdown')? <button className="text-danger dropdown-item" onClick={handleLogout}>
        Logout
      </button> :
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    }
    </>
  );
};

export default Logout;
