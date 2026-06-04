const { sendError } = require("../utils/response");

/**
 * Validation middleware for Authentication requests.
 */

const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required.", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, "Invalid email format.", 400);
  }

  if (typeof password !== "string" || password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long.", 400);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required.", 400);
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, "Email is required.", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, "Invalid email format.", 400);
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return sendError(res, "Token and newPassword are required.", 400);
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return sendError(res, "Password must be at least 6 characters long.", 400);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
