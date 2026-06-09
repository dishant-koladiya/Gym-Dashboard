const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");

// ==========================================
// 1. SUBSCRIPTION PLANS CONFIGURATION
// ==========================================

/**
 * Configure a new subscription plan package.
 */
const createPlan = async (planData) => {
  const { name, price, durationMonths, description } = planData;

  if (!name || price === undefined || !durationMonths) {
    throw new AppError("Name, price, and duration are required.", 400);
  }

  return await prisma.subscriptionPlan.create({
    data: {
      name,
      price: parseFloat(price),
      durationMonths: parseInt(durationMonths),
      description,
    },
  });
};

/**
 * Retrieve all subscription plan configurations.
 */
const getPlans = async () => {
  return await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Retrieve a specific subscription plan.
 */
const getPlanById = async (id) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new AppError("Subscription Plan not found.", 404);
  }

  return plan;
};

/**
 * Update an existing subscription plan configuration.
 */
const updatePlan = async (id, updateData) => {
  const { name, price, durationMonths, description } = updateData;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new AppError("Subscription Plan not found.", 404);
  }

  return await prisma.subscriptionPlan.update({
    where: { id: parseInt(id) },
    data: {
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      durationMonths: durationMonths !== undefined ? parseInt(durationMonths) : undefined,
      description,
    },
  });
};

/**
 * Delete a plan configuration.
 */
const deletePlan = async (id) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new AppError("Subscription Plan not found.", 404);
  }

  return await prisma.subscriptionPlan.delete({
    where: { id: parseInt(id) },
  });
};

// ==========================================
// 2. MEMBER SUBSCRIPTIONS PURCHASING
// ==========================================

/**
 * Subscribe a member to a plan package.
 */
const subscribeMember = async (subscribeData) => {
  const { memberId, planId, recordPayment = true } = subscribeData;
  const mId = parseInt(memberId);
  const pId = parseInt(planId);

  // Validate Member
  const member = await prisma.member.findUnique({ where: { id: mId } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }
  if (member.status !== "ACTIVE") {
    throw new AppError("Cannot subscribe an inactive member.", 400);
  }

  // Validate Plan Package
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: pId } });
  if (!plan) {
    throw new AppError("Subscription Plan package not found.", 404);
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  // Set any current ACTIVE subscriptions for this member to EXPIRED
  await prisma.memberSubscription.updateMany({
    where: {
      memberId: mId,
      status: "ACTIVE",
    },
    data: {
      status: "EXPIRED",
    },
  });

  // Run in a transaction: Create Subscription and instantly generate a Payment receipt
  return await prisma.$transaction(async (tx) => {
    const subscription = await tx.memberSubscription.create({
      data: {
        memberId: mId,
        planId: pId,
        startDate,
        endDate,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    // Create the invoice payment record (paid immediately) — skip if recordPayment is false
    if (recordPayment) {
      await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          status: "PAID",
        },
      });
    }

    return subscription;
  });
};

/**
 * Cancel a subscription.
 */
const cancelSubscription = async (id) => {
  const subId = parseInt(id);

  const subscription = await prisma.memberSubscription.findUnique({
    where: { id: subId },
  });

  if (!subscription) {
    throw new AppError("Subscription record not found.", 404);
  }

  return await prisma.memberSubscription.update({
    where: { id: subId },
    data: {
      status: "CANCELLED",
    },
  });
};

/**
 * Retrieve all member subscriptions.
 */
const getSubscriptions = async () => {
  return await prisma.memberSubscription.findMany({
    include: {
      member: true,
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });
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
