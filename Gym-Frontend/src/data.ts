/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Transaction, AdminAccount, GymInfo, SystemSettings } from "./types";

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_ADMIN: AdminAccount = {
  fullName: "Alex Rivera",
  username: "arivera_admin",
  email: "alex.rivera@fitadminpro.com",
  role: "Super Administrator",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHHjI-aC2dcBbVZbpbl0rThlZfPSmWyGsNGuJlgohNE67cxkPB5n9dqit5KZRwVI7Z1l1pd6tJ5PCPHkZFkQ8_TFAW8pULxiKdV-IVYX0iQtoKpYeTpNU2VPaKeOrSkpdSdhBJESq0qBvE-qJo2ltNVxwjYTFQTqkMTu3-kXJakRsqKnOWZSXxjs3o-z5SMYw_peF6YuvMj9NqSTi5CJu68MuzdM9wGsau0gKEjIyERXVdFcCBqo_hDv4347E_pcxhzCHcBP5zQF6R",
};

export const DEFAULT_GYM: GymInfo = {
  name: "Iron Pulse Performance Center",
  address: "242 Innovation Way, Tech District, San Francisco, CA 94103",
  phone: "+1 (555) 012-3456",
  website: "www.ironpulse.gym",
};

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: "Light",
  emailUpdates: true,
  desktopAlerts: false,
  backendUrl: "http://localhost:5000",
  backendToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc4MDU2NTUyMCwiZXhwIjoxNzgwNjUxOTIwfQ.Z36aaFXkNydvCZUzy_OhCfUwZ0aWce_NnR2bd7KPs_I",
};

// Standard membership packages for Vikram renewal / checkout flow
export const PACKAGES = [
  {
    name: "1 Month",
    term: "SHORT TERM",
    price: 1200,
    features: ["All Equipment Access", "Locker Room Access", "Basic Fitness Assessment"],
  },
  {
    name: "6 Months",
    term: "POPULAR",
    price: 4500,
    features: ["All Equipment Access", "Locker Room + Steam", "2 Guest Passes / Month", "Group Classes Included"],
  },
  {
    name: "1 Year",
    term: "BEST VALUE",
    price: 8000,
    features: ["All Equipment Access", "Locker Room + Steam + Sauna", "5 Guest Passes / Month", "Group Classes Included", "Personal Training (2 Sessions)", "Free Gym Kit Bundle"],
  },
];
