// utils/errorHandling.js

/**
 * Custom Error Handler Middleware
 * Handles application errors and sends a structured JSON response
 */

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message || "Unknown Error"}`);
  
    // Set default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    // Return error response
    res.status(statusCode).json({
      success: false,
      error: {
        message: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
  };
  
  /**
   * Custom Error Class for Controlled Errors
   */
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Capture stack trace for debugging
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = { errorHandler, AppError };
  