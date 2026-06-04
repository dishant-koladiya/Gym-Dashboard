const { PrismaClient } = require("@prisma/client");

// Instantiate Prisma Client with logging configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

module.exports = prisma;
