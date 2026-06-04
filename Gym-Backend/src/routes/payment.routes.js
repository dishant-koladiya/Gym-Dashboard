const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

// Protect all payment endpoints
router.use(protect);

router.get("/", paymentController.getPayments);
router.get("/:id", paymentController.getPaymentById);
router.post("/", paymentController.createManualPayment);

module.exports = router;
