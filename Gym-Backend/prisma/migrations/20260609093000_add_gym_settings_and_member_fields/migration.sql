-- CreateTable: Gym
CREATE TABLE "Gym" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SystemSetting
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'Light',
    "emailUpdates" BOOLEAN NOT NULL DEFAULT true,
    "desktopAlerts" BOOLEAN NOT NULL DEFAULT false,
    "backendUrl" TEXT,
    "backendToken" TEXT,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add address and avatarUrl columns to Member
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
