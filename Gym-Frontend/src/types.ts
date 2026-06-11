/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Screen {
  LOGIN = "login",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot_password",
  REG_SUCCESS = "reg_success",
  DASHBOARD = "dashboard",
  MEMBERS_DIRECTORY = "members_directory",
  PAYMENTS_FINANCE = "payments_finance",
  SUBSCRIPTION_PLANS = "subscription_plans",
  ADD_MEMBER_WIZARD = "add_member_wizard",
  SETTINGS = "settings",
}

export interface SubscriptionPlan {
  name: string;
  term: string;
  price: number;
  features: string[];
  active: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  joinDate: string;
  expiryDate: string;
  plan: string;
  price: number;
  status: "Active" | "Expired" | "Expiring";
  lastActive: string;
  homeBranch: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  memberId?: string;
  memberName: string;
  planName: string;
  paymentMethod: "Visa" | "Mastercard" | "Cash" | "Bank Transfer" | "UPI";
  methodDetail: string; // Card digits or details e.g. "•••• 4242"
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Failed";
}

export interface AdminAccount {
  fullName: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface GymInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
}

export interface SystemSettings {
  theme: "Light" | "Dark" | "Auto";
  emailUpdates: boolean;
  desktopAlerts: boolean;
  backendUrl?: string;
  backendToken?: string;
}
