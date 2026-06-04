const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");

/**
 * Register a new Admin user.
 */
const register = async (email, password, name) => {
  // Check if admin email is already in use
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new AppError("An account with this email already exists.", 400);
  }

  // Hash the password with 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the record in DB
  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return admin;
};

/**
 * Log in an Admin user and issue a JWT.
 */
const login = async (email, password) => {
  // Find admin by email
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Generate JWT token (expires in 24 hours)
  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
    },
    token,
  };
};

/**
 * Generate password reset token, hash it for DB storage, and set expiry.
 */
const forgotPassword = async (email) => {
  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new AppError("No account found with that email address.", 404);
  }

  // Generate secure unhashed reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token for database storage (prevent hijacking in database leak scenarios)
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Token expires in 1 hour
  const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  // Save the hashed token and expiry date to the admin record
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    },
  });

  // Return the raw reset token. This is what will be sent to the user.
  return resetToken;
};

/**
 * Verify reset token, hash new password, update user record, and clear reset fields.
 */
const resetPassword = async (token, newPassword) => {
  // Hash the incoming token to match database storage
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find admin with matching active, unexpired token
  const admin = await prisma.admin.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(), // token expiration must be in the future
      },
    },
  });

  if (!admin) {
    throw new AppError("Password reset token is invalid or has expired.", 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset columns
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true, message: "Password has been reset successfully." };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
