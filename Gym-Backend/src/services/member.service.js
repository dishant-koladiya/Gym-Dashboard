const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");

/**
 * Register a new member.
 */
const createMember = async (memberData) => {
  const { name, email, phone, age, address, avatarUrl } = memberData;

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Member with this email already exists.", 400);
  }

  return await prisma.member.create({
    data: {
      name,
      email,
      phone,
      age: age ? parseInt(age) : null,
      address,
      avatarUrl,
    },
  });
};

/**
 * Retrieve members list with pagination and search filter.
 */
const getMembers = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search || "";

  // Dynamic filter for search query
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [members, total] = await prisma.$transaction([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieve a specific member with subscription history and check-ins.
 */
const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: {
      subscriptions: {
        include: {
          plan: true,
          payments: true,
        },
        orderBy: { startDate: "desc" },
      },
      attendance: {
        orderBy: { checkIn: "desc" },
        take: 30,
      },
    },
  });

  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  return member;
};

/**
 * Update member details.
 */
const updateMember = async (id, updateData) => {
  const { name, email, phone, age, address, avatarUrl, status } = updateData;

  const member = await prisma.member.findUnique({ where: { id: parseInt(id) } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  if (email && email !== member.email) {
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("Member with this email already exists.", 400);
    }
  }

  return await prisma.member.update({
    where: { id: parseInt(id) },
    data: {
      name,
      email,
      phone,
      age: age ? parseInt(age) : undefined,
      address,
      avatarUrl,
      status,
    },
  });
};

/**
 * Deactivate a member (soft deactivation).
 */
const deactivateMember = async (id) => {
  const member = await prisma.member.findUnique({ where: { id: parseInt(id) } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  return await prisma.member.update({
    where: { id: parseInt(id) },
    data: { status: "INACTIVE" },
  });
};

/**
 * Delete all members (cascades to subscriptions, payments, attendance).
 */
const deleteAllMembers = async () => {
  return await prisma.member.deleteMany();
};

/**
 * Permanently delete a member and all cascaded relations.
 */
const deleteMember = async (id) => {
  const member = await prisma.member.findUnique({ where: { id: parseInt(id) } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  return await prisma.member.delete({
    where: { id: parseInt(id) },
  });
};

/**
 * Get all active members.
 */
const getActiveMembers = async () => {
  return await prisma.member.findMany({
    where: { status: "ACTIVE" },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { startDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Check-in a member.
 */
const checkIn = async (memberId) => {
  const mId = parseInt(memberId);
  const member = await prisma.member.findUnique({ where: { id: mId } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  if (member.status !== "ACTIVE") {
    throw new AppError("Cannot check-in. Member account is inactive.", 400);
  }

  // Check if member is already checked in (no checkout timestamp recorded)
  const activeAttendance = await prisma.attendance.findFirst({
    where: {
      memberId: mId,
      checkOut: null,
    },
  });

  if (activeAttendance) {
    throw new AppError("Member is already checked in.", 400);
  }

  return await prisma.attendance.create({
    data: {
      memberId: mId,
    },
  });
};

/**
 * Check-out a member.
 */
const checkOut = async (memberId) => {
  const mId = parseInt(memberId);
  const member = await prisma.member.findUnique({ where: { id: mId } });
  if (!member) {
    throw new AppError("Member not found.", 404);
  }

  // Find the latest active check-in
  const activeAttendance = await prisma.attendance.findFirst({
    where: {
      memberId: mId,
      checkOut: null,
    },
    orderBy: { checkIn: "desc" },
  });

  if (!activeAttendance) {
    throw new AppError("Member is not currently checked in.", 400);
  }

  return await prisma.attendance.update({
    where: { id: activeAttendance.id },
    data: {
      checkOut: new Date(),
    },
  });
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deactivateMember,
  deleteMember,
  deleteAllMembers,
  getActiveMembers,
  checkIn,
  checkOut,
};
