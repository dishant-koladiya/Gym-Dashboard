const { sendError } = require("../utils/response");

/**
 * Custom application error class.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  } else {
    console.error(`❌ Error [${err.statusCode || 500}]: ${err.message}`);
  }

  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Handle Prisma Unique Constraint Error (e.g., email already exists)
  if (err.code === "P2002") {
    const fields = err.meta?.target ? err.meta.target.join(", ") : "field";
    error.message = `An account with this ${fields} already exists.`;
    error.statusCode = 400;
  }

  // Handle Prisma Record Not Found
  if (err.code === "P2025") {
    error.message = "The requested record was not found.";
    error.statusCode = 404;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token. Please log in again.";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Your token has expired. Please log in again.";
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Use standardized error response formatting
  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? err.stack : null
  );
};

module.exports = {
  AppError,
  errorHandler,
};