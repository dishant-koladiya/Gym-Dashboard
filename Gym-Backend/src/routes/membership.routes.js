const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/membership.controller");
const { protect } = require("../middleware/auth.middleware");

// Protect all membership/plans endpoints
router.use(protect);

// Plans Configuration
router.post("/plans", membershipController.createPlan);
router.get("/plans", membershipController.getPlans);
router.get("/plans/:id", membershipController.getPlanById);
router.put("/plans/:id", membershipController.updatePlan);
router.delete("/plans/:id", membershipController.deletePlan);

// Member Subscriptions
router.post("/subscribe", membershipController.subscribeMember);
router.get("/subscriptions", membershipController.getSubscriptions);
router.post("/subscriptions/:id/cancel", membershipController.cancelSubscription);

module.exports = router;
