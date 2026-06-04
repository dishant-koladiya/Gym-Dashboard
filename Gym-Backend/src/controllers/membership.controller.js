const membershipService = require("../services/membership.service");
const { sendSuccess } = require("../utils/response");

// ==========================================
// 1. SUBSCRIPTION PLANS
// ==========================================

const createPlan = async (req, res, next) => {
  try {
    const plan = await membershipService.createPlan(req.body);
    return sendSuccess(res, "Subscription plan created successfully.", plan, 201);
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const plans = await membershipService.getPlans();
    return sendSuccess(res, "Subscription plans retrieved successfully.", plans, 200);
  } catch (error) {
    next(error);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const plan = await membershipService.getPlanById(req.params.id);
    return sendSuccess(res, "Subscription plan details retrieved successfully.", plan, 200);
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await membershipService.updatePlan(req.params.id, req.body);
    return sendSuccess(res, "Subscription plan updated successfully.", plan, 200);
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    await membershipService.deletePlan(req.params.id);
    return sendSuccess(res, "Subscription plan deleted successfully.", null, 200);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. MEMBER SUBSCRIPTIONS
// ==========================================

const subscribeMember = async (req, res, next) => {
  try {
    const subscription = await membershipService.subscribeMember(req.body);
    return sendSuccess(res, "Member subscribed successfully.", subscription, 201);
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await membershipService.cancelSubscription(req.params.id);
    return sendSuccess(res, "Subscription cancelled successfully.", subscription, 200);
  } catch (error) {
    next(error);
  }
};

const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await membershipService.getSubscriptions();
    return sendSuccess(res, "Subscriptions retrieved successfully.", subscriptions, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  subscribeMember,
  cancelSubscription,
  getSubscriptions,
};
