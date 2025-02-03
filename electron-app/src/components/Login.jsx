import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="container col-md-12 mt-5">
      <h2>Login</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input type="text" className="form-control" name="username" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input type="password" className="form-control" name="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p className="mt-3"><Link to="/forgot-password">Forgot Password?</Link></p>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;
