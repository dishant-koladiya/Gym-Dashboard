const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { AppError } = require("./error.middleware");

/**
 * Protect routes by verifying JWT in Authorization header.
 * Attaches the authenticated admin to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Retrieve token from Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the admin and verify they still exist
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return next(new AppError("The account belonging to this token no longer exists.", 401));
    }

    // Attach verified admin to request object
    req.user = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
