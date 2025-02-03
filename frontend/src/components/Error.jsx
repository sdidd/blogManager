import React from "react";

const Error = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="display-4 text-danger">Oops!</h1>
      <p className="lead">The page you're looking for was not found.</p>
      <a href="/" className="btn btn-primary mt-3">
        Go Back Home
      </a>
    </div>
  );
};

export default Error;
