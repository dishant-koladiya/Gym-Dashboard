const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const { protect } = require("../middleware/auth.middleware");

// Apply protection middleware to all member endpoints
router.use(protect);

// CRUD Endpoints
router.post("/", memberController.createMember);
router.get("/", memberController.getMembers);
router.get("/:id", memberController.getMemberById);
router.put("/:id", memberController.updateMember);
router.delete("/:id", memberController.deactivateMember);

// Attendance Log Endpoints
router.post("/:id/checkin", memberController.checkIn);
router.post("/:id/checkout", memberController.checkOut);

module.exports = router;
