const authService = require("../services/auth.service");

/**
 * Controller for registering a new Admin user.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const admin = await authService.register(email, password, name);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: admin,
    });
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

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data,
    });
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

    // In a fully deployed environment, this would trigger an email.
    // For development, we return the token in the API response.
    res.status(200).json({
      success: true,
      message: "Password reset token generated successfully. In production, this will be emailed.",
      data: {
        resetToken,
        resetUrl: `${req.protocol}://${req.get("host")}/api/auth/reset-password?token=${resetToken}`
      },
    });
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

    res.status(200).json({
      success: true,
      message: result.message,
    });
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
