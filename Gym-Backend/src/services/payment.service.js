const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");

/**
 * Retrieve all payment records, including member and plan metadata.
 */
const getPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      subscription: {
        include: {
          member: true,
          plan: true,
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });
};

/**
 * Retrieve a specific payment record by ID.
 */
const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(id) },
    include: {
      subscription: {
        include: {
          member: true,
          plan: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment record not found.", 404);
  }

  return payment;
};

/**
 * Manually log a payment against an active subscription.
 */
const createManualPayment = async (paymentData) => {
  const { subscriptionId, amount, status } = paymentData;
  const subId = parseInt(subscriptionId);

  if (!subscriptionId || amount === undefined) {
    throw new AppError("Subscription ID and amount are required.", 400);
  }

  const subscription = await prisma.memberSubscription.findUnique({
    where: { id: subId },
  });

  if (!subscription) {
    throw new AppError("Associated Subscription not found.", 404);
  }

  return await prisma.payment.create({
    data: {
      subscriptionId: subId,
      amount: parseFloat(amount),
      status: status || "PAID",
    },
  });
};

module.exports = {
  getPayments,
  getPaymentById,
  createManualPayment,
};
