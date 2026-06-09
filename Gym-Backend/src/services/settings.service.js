const prisma = require("../config/database");

const getAdmin = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  return admin ? { fullName: admin.name, email: admin.email, avatarUrl: admin.avatarUrl, role: "Super Administrator" } : null;
};

const updateAdmin = async (adminId, data) => {
  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: {
      name: data.fullName,
      email: data.email,
      avatarUrl: data.avatarUrl,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });
  return { fullName: updated.name, email: updated.email, avatarUrl: updated.avatarUrl, role: "Super Administrator" };
};

const getGym = async () => {
  let gym = await prisma.gym.findFirst({ orderBy: { id: "asc" } });
  if (!gym) {
    gym = await prisma.gym.create({
      data: { name: "Iron Pulse Performance Center", address: "", phone: "", website: "" },
    });
  }
  return { name: gym.name, address: gym.address, phone: gym.phone, website: gym.website };
};

const updateGym = async (data) => {
  let gym = await prisma.gym.findFirst({ orderBy: { id: "asc" } });
  if (gym) {
    gym = await prisma.gym.update({
      where: { id: gym.id },
      data: { name: data.name, address: data.address, phone: data.phone, website: data.website },
    });
  } else {
    gym = await prisma.gym.create({
      data: { name: data.name, address: data.address, phone: data.phone, website: data.website },
    });
  }
  return { name: gym.name, address: gym.address, phone: gym.phone, website: gym.website };
};

const getSettings = async () => {
  let settings = await prisma.systemSetting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: { theme: "Light", emailUpdates: true, desktopAlerts: false },
    });
  }
  return {
    theme: settings.theme,
    emailUpdates: settings.emailUpdates,
    desktopAlerts: settings.desktopAlerts,
    backendUrl: settings.backendUrl,
    backendToken: settings.backendToken,
  };
};

const updateSettings = async (data) => {
  let settings = await prisma.systemSetting.findFirst({ orderBy: { id: "asc" } });
  if (settings) {
    settings = await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        theme: data.theme,
        emailUpdates: data.emailUpdates,
        desktopAlerts: data.desktopAlerts,
        backendUrl: data.backendUrl,
        backendToken: data.backendToken,
      },
    });
  } else {
    settings = await prisma.systemSetting.create({
      data: {
        theme: data.theme || "Light",
        emailUpdates: data.emailUpdates ?? true,
        desktopAlerts: data.desktopAlerts ?? false,
        backendUrl: data.backendUrl,
        backendToken: data.backendToken,
      },
    });
  }
  return {
    theme: settings.theme,
    emailUpdates: settings.emailUpdates,
    desktopAlerts: settings.desktopAlerts,
    backendUrl: settings.backendUrl,
    backendToken: settings.backendToken,
  };
};

module.exports = {
  getAdmin,
  updateAdmin,
  getGym,
  updateGym,
  getSettings,
  updateSettings,
};
