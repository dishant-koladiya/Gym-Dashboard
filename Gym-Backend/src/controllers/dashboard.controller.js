const dashboardService = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/response");

/**
 * Controller to compile dashboard analytics.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return sendSuccess(res, "Dashboard statistics compiled successfully.", stats, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
