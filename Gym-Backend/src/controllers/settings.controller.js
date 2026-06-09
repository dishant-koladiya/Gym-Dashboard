const settingsService = require("../services/settings.service");
const { sendSuccess } = require("../utils/response");

const getAdmin = async (req, res, next) => {
  try {
    const admin = await settingsService.getAdmin(req.user.id);
    return sendSuccess(res, "Admin profile retrieved.", admin, 200);
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const admin = await settingsService.updateAdmin(req.user.id, req.body);
    return sendSuccess(res, "Admin profile updated.", admin, 200);
  } catch (error) {
    next(error);
  }
};

const getGym = async (req, res, next) => {
  try {
    const gym = await settingsService.getGym();
    return sendSuccess(res, "Gym info retrieved.", gym, 200);
  } catch (error) {
    next(error);
  }
};

const updateGym = async (req, res, next) => {
  try {
    const gym = await settingsService.updateGym(req.body);
    return sendSuccess(res, "Gym info updated.", gym, 200);
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, "System settings retrieved.", settings, 200);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    return sendSuccess(res, "System settings updated.", settings, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmin,
  updateAdmin,
  getGym,
  updateGym,
  getSettings,
  updateSettings,
};
