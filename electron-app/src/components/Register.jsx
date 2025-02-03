import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input type="text" className="form-control" name="username" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input type="email" className="form-control" name="email" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input type="password" className="form-control" name="password" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password:</label>
          <input type="password" className="form-control" name="confirmPassword" required />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p className="mt-3">Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
};

export default Register;
