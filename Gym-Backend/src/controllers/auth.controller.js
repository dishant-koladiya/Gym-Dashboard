const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

/**
 * Controller for registering a new Admin user.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const admin = await authService.register(email, password, name);
    return sendSuccess(res, "Admin registered successfully.", admin, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for logging in an Admin user.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return sendSuccess(res, "Login successful.", data, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for forgot password requesting a reset token.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotPassword(email);

    return sendSuccess(res, "Password reset token generated successfully. In production, this will be emailed.", {
      resetToken,
      resetUrl: `${req.protocol}://${req.get("host")}/api/auth/reset-password?token=${resetToken}`
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for resetting password using reset token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
