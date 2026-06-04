const prisma = require("../config/database");

/**
 * Compile high-level dashboard metrics for the administrator home page.
 */
const getDashboardStats = async () => {
  const now = new Date();

  // 1. Total Active Members count
  const activeMembersCount = await prisma.member.count({
    where: { status: "ACTIVE" },
  });

  // 2. Monthly Revenue calculation (Sum of successful payments in current calendar month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthlyPayments = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "PAID",
      paymentDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const monthlyRevenue = monthlyPayments._sum.amount || 0;

  // 3. Weekly Attendance Rate (Percentage of active members checked-in at least once this week)
  // Calculate start of current week (Monday at 00:00:00)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay(); // 0: Sunday, 1: Monday, etc.
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Total check-ins logged this week
  const totalCheckInsThisWeek = await prisma.attendance.count({
    where: {
      checkIn: {
        gte: startOfWeek,
      },
    },
  });

  // Unique active members checking in this week
  const uniqueCheckedInMembersThisWeek = await prisma.attendance.groupBy({
    by: ["memberId"],
    where: {
      checkIn: {
        gte: startOfWeek,
      },
    },
  });

  const uniqueMembersCount = uniqueCheckedInMembersThisWeek.length;
  const attendanceRate = activeMembersCount > 0
    ? parseFloat(((uniqueMembersCount / activeMembersCount) * 100).toFixed(1))
    : 0;

  // 4. Expiring Memberships (Subscriptions expiring within the next 7 days)
  const expiringEnd = new Date(now);
  expiringEnd.setDate(expiringEnd.getDate() + 7);

  const expiringSubscriptions = await prisma.memberSubscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: now,
        lte: expiringEnd,
      },
    },
    include: {
      member: true,
      plan: true,
    },
    orderBy: {
      endDate: "asc",
    },
  });

  return {
    activeMembersCount,
    monthlyRevenue,
    weeklyAttendance: {
      totalCheckIns: totalCheckInsThisWeek,
      uniqueCheckedInMembers: uniqueMembersCount,
      attendanceRatePercentage: attendanceRate,
    },
    expiringMemberships: expiringSubscriptions.map((sub) => ({
      subscriptionId: sub.id,
      memberId: sub.member.id,
      memberName: sub.member.name,
      memberEmail: sub.member.email,
      planName: sub.plan.name,
      endDate: sub.endDate,
    })),
  };
};

module.exports = {
  getDashboardStats,
};
