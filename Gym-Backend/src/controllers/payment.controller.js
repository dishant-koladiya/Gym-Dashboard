const paymentService = require("../services/payment.service");
const { sendSuccess } = require("../utils/response");

/**
 * Controller to list all payments.
 */
const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPayments();
    return sendSuccess(res, "Payments list retrieved successfully.", payments, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch details of a specific payment receipt.
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    return sendSuccess(res, "Payment details retrieved successfully.", payment, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to manually record a payment check.
 */
const createManualPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createManualPayment(req.body);
    return sendSuccess(res, "Payment logged successfully.", payment, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createManualPayment,
};
