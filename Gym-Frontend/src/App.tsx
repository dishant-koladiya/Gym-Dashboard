/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Screen,
  Member,
  Transaction,
  AdminAccount,
  GymInfo,
  SystemSettings,
  SubscriptionPlan,
} from "./types";
import {
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  DEFAULT_ADMIN,
  DEFAULT_GYM,
  DEFAULT_SETTINGS,
  PACKAGES,
} from "./data";

// Views
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import MembersView from "./components/MembersView";
import PaymentsView from "./components/PaymentsView";
import SubscriptionPlansView from "./components/SubscriptionPlansView";
import AddMemberWizard from "./components/AddMemberWizard";
import SettingsView from "./components/SettingsView";
import LoginView from "./components/LoginView";
import RegisterView from "./components/RegisterView";
import ForgotPasswordView from "./components/ForgotPasswordView";
import RegSuccessView from "./components/RegSuccessView";

import { CheckCircle2, Trash, Sparkles } from "lucide-react";

export default function App() {
  // 1. Core States loaded from localStorage (persistence) or fallback to data.ts
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("tf_is_logged_in") === "true";
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const isLoggedInInitially = localStorage.getItem("tf_is_logged_in") === "true";
    if (!isLoggedInInitially) {
      return Screen.LOGIN;
    }
    const saved = localStorage.getItem("tf_current_screen");
    return (saved as Screen) || Screen.DASHBOARD;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem("tf_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("tf_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [admin, setAdmin] = useState<AdminAccount>(() => {
    const saved = localStorage.getItem("tf_admin");
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });

  const [gym, setGym] = useState<GymInfo>(() => {
    const saved = localStorage.getItem("tf_gym");
    return saved ? JSON.parse(saved) : DEFAULT_GYM;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("tf_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Subscription plans state (editable)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem("tf_subscription_plans");
    return saved ? JSON.parse(saved) : [...PACKAGES];
  });



  // Toast dynamic array system
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "error" }[]>([]);

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("tf_sidebar_collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("tf_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Force re-fetch from API when incremented (used after reset)
  const [refreshKey, setRefreshKey] = useState(0);

  // 2. Synchronization effect
  useEffect(() => {
    localStorage.setItem("tf_current_screen", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem("tf_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("tf_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("tf_admin", JSON.stringify(admin));
  }, [admin]);

  useEffect(() => {
    localStorage.setItem("tf_gym", JSON.stringify(gym));
  }, [gym]);

  useEffect(() => {
    localStorage.setItem("tf_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("tf_subscription_plans", JSON.stringify(subscriptionPlans));
  }, [subscriptionPlans]);

  // Fetch active members from backend
useEffect(() => {
  async function fetchActiveMembers() {
    if (!isLoggedIn) return;
    const token = settings.backendToken?.trim();
    if (!token) return;
    try {
      const res = await fetch(getApiUrl("/api/members/active"), {
        headers: getHeaders(),
      });
      if (res.ok) {
        const raw = await res.json();
        let list = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw.data && Array.isArray(raw.data)) {
          list = raw.data;
        } else if (raw.data && Array.isArray(raw.data.members)) {
          list = raw.data.members;
        }
        setMembers((prev) => {
          const mapped = list.map((m: Record<string, unknown>) => {
            const frontend = mapBackendMemberToFrontend(m);
            const existing = prev.find((x) => x.id === frontend.id);
            if (existing?.avatarUrl) frontend.avatarUrl = existing.avatarUrl;
            return frontend;
          });
          return mapped.length > 0 ? mapped : prev;
        });
      }
    } catch (e: unknown) {
      console.log("Failed to load active members", e);
    }
  }
  fetchActiveMembers();
  }, [settings.backendUrl, settings.backendToken, refreshKey]);

  // Dynamic Base URL getters for user custom backend integration
  const getApiUrl = (path: string) => {
    const base = settings.backendUrl ? settings.backendUrl.trim().replace(/\/$/, "") : "";
    return base + path;
  };

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (settings.backendToken && settings.backendToken.trim()) {
      headers["Authorization"] = `Bearer ${settings.backendToken.trim()}`;
    }
    return headers;
  };

  const mapBackendMemberToFrontend = (m: Record<string, unknown>): Member => {
    const memberSubscriptions = m.subscriptions as Array<Record<string, unknown>> | undefined;
    const activeSub = memberSubscriptions?.[0] ?? null;
    const activeSubPlan = activeSub?.plan as Record<string, unknown> | undefined;
    const planName = activeSubPlan?.name as string | undefined
      ?? (m.plan_name as string | undefined) ?? "No Active Plan";
    const planPrice = activeSubPlan ? parseFloat(activeSubPlan.price as string) || 0
      : typeof m.price === 'number' ? m.price
      : 0;

    const fmt = (d: string) => {
      const parsed = new Date(d);
      return isNaN(parsed.getTime())
        ? new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    };

    let joinDate = (m.createdAt as string | undefined)
      ? fmt(m.createdAt as string)
      : (m.join_date as string | undefined)
        ? fmt(m.join_date as string)
        : (m.joinDate as string | undefined)
          ? fmt(m.joinDate as string)
          : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    if (activeSub && (activeSub.startDate as string | undefined)) {
      joinDate = fmt(activeSub.startDate as string);
    }

    let expiryDate = "No Expiry";
    if (m.expiry_date as string | undefined) {
      expiryDate = fmt(m.expiry_date as string);
    } else if (activeSub && (activeSub.endDate as string | undefined)) {
      expiryDate = fmt(activeSub.endDate as string);
    }

    let status: "Active" | "Expired" | "Expiring" = "Active";
    const raw = String((m.status as string | undefined) || '').toLowerCase();
    if (raw === "inactive" || raw === "expired" || (activeSub && (activeSub.status as string) === "EXPIRED")) {
      status = "Expired";
    } else if (activeSub && (activeSub.endDate as string | undefined)) {
      const timeDiff = new Date(activeSub.endDate as string).getTime() - Date.now();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      if (daysDiff < 0) {
        status = "Expired";
      } else if (daysDiff <= 14) {
        status = "Expiring";
      }
    }

    const attendance = m.attendance as Array<Record<string, unknown>> | undefined;
    const lastActive = attendance?.[0]
      ? fmt((attendance[0].checkIn as string))
      : joinDate;

    return {
      id: (m.id as string | undefined) ? String(m.id) : String(Math.floor(1000 + Math.random() * 9000)),
      name: m.name as string | undefined,
      email: m.email as string | undefined,
      phone: (m.phone as string | undefined) || "",
      age: (m.age as number | undefined) || 0,
      address: (m.address as string | undefined) || "",
      avatarUrl: (m.avatarUrl as string | undefined) || undefined,
      joinDate,
      expiryDate,
      plan: planName,
      price: planPrice,
      status,
      lastActive,
      homeBranch: "Downtown Central"
    };
  };

  const mapBackendPaymentToFrontend = (p: Record<string, unknown>): Transaction => {
    const sub = p.subscription as Record<string, unknown> | undefined;
    const subMember = sub?.member as Record<string, unknown> | undefined;
    const subPlan = sub?.plan as Record<string, unknown> | undefined;
    const memberName = (subMember?.name as string | undefined) || (p.member_name as string | undefined) || (p.memberName as string | undefined) || "N/A";
    const planName = (subPlan?.name as string | undefined) || (p.plan_name as string | undefined) || (p.planName as string | undefined) || "N/A";
    const dateStr = (p.paymentDate as string | undefined)
      ? new Date(p.paymentDate as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : (p.date as string | undefined)
        ? new Date(p.date as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    return {
      id: (p.id as string | undefined) ? String(p.id) : String(Math.floor(10000 + Math.random() * 90000)),
      memberName,
      planName,
      paymentMethod: ((p.payment_method as string | undefined) || (p.paymentMethod as string | undefined) || "UPI") as "Visa" | "Mastercard" | "Cash" | "Bank Transfer" | "UPI",
      methodDetail: (p.method_detail as string | undefined) || (p.methodDetail as string | undefined) || "Database Settlement",
      amount: parseFloat(p.amount as string) || 0,
      date: dateStr,
      status: (p.status as string) === "PAID" || (p.status as string) === "Completed" ? "Completed" : "Pending"
    };
  };

  // Load and synchronize data from external API routes
  useEffect(() => {
    async function fetchBackendDb() {
      if (!isLoggedIn) return;
      const token = settings.backendToken?.trim();
      if (!token) return;
      try {
        const res = await fetch(getApiUrl("/api/members"), { headers: getHeaders() });
        if (res.ok) {
          const raw = await res.json();
          let list = [];
          if (Array.isArray(raw)) {
            list = raw;
          } else if (raw && raw.data && Array.isArray(raw.data.members)) {
            list = raw.data.members;
          } else if (raw && Array.isArray(raw.members)) {
            list = raw.members;
          }
          setMembers((prev) => {
            const mapped = list.map((m: Record<string, unknown>) => {
              const frontend = mapBackendMemberToFrontend(m);
              const existing = prev.find((x) => x.id === frontend.id);
              if (existing?.avatarUrl) frontend.avatarUrl = existing.avatarUrl;
              return frontend;
            });
            return mapped.length > 0 ? mapped : prev;
          });
        }
      } catch (e: unknown) {
        console.log("Offline or connection fallback for members.");
      }

      try {
        const res = await fetch(getApiUrl("/api/payments"), { headers: getHeaders() });
        if (res.ok) {
          const raw = await res.json();
          let list = [];
          if (Array.isArray(raw)) {
            list = raw;
          } else if (raw && raw.data) {
            if (Array.isArray(raw.data)) {
              list = raw.data;
            } else if (Array.isArray(raw.data.payments)) {
              list = raw.data.payments;
            }
          } else if (raw && Array.isArray(raw.payments)) {
            list = raw.payments;
          }
          const mapped = list.map((p: Record<string, unknown>) => mapBackendPaymentToFrontend(p));
          if (mapped.length > 0) {
            setTransactions((prev) => {
              const existingIds = new Set(mapped.map((t) => t.id));
              const localOnly = prev.filter((t) => !existingIds.has(t.id));
              return [...mapped, ...localOnly];
            });
          }
        } else {
          const fallbackRes = await fetch("/api/transactions");
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (Array.isArray(data)) setTransactions(data);
          }
        }
      } catch (e: unknown) {
        console.log("Offline local storage fallback active.");
      }

      try {
        const res = await fetch(getApiUrl("/api/admin"), { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.fullName) setAdmin(data);
        }
      } catch (e: unknown) {
        console.log("Admin config fallback active.");
      }

      try {
        const res = await fetch(getApiUrl("/api/gym"), { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setGym(data);
        }
      } catch (e: unknown) {
        console.log("Gym config fallback active.");
      }

      try {
        const res = await fetch(getApiUrl("/api/settings"));
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (e: unknown) {
        console.log("System settings config fallback active.");
      }
    }
    fetchBackendDb();
  }, [settings.backendUrl, settings.backendToken, refreshKey]);

  // Toast Trigger Helper
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 3. Admin Callbacks / Interactive Handlers

  // App Login
  const handleLoginSubmit = async (emailStr: string, passwordStr?: string): Promise<string | undefined> => {
    const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
    if (isCustomBackend) {
      try {
        const response = await fetch(getApiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailStr, password: passwordStr }),
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return errData.message || errData.error || "Invalid username or password";
        }
        
        const data = await response.json();
        const payload = data.data || data;
        const jwtoken = payload.token;
        const adminObj = payload.user || payload.admin || { name: "Backend Admin", email: emailStr };
        
        setSettings((prev) => ({
          ...prev,
          backendToken: jwtoken,
        }));
        
        setAdmin((prev) => ({
          fullName: adminObj.name || adminObj.fullName || "Backend Admin",
          username: adminObj.username || emailStr.split("@")[0],
          email: adminObj.email || emailStr,
          role: "Super Administrator",
          avatarUrl: prev.avatarUrl || DEFAULT_ADMIN.avatarUrl,
        }));
        
        localStorage.setItem("tf_is_logged_in", "true");
        setIsLoggedIn(true);
        setCurrentScreen(Screen.DASHBOARD);
        showToast(`Welcome back! Live database synchronized.`, "success");
        return undefined;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : "Connection refused by the backend server";
      }
    } else {
      // Offline local sandbox fallback - verify password matches if they registered locally
      const savedEmail = localStorage.getItem("tf_sandbox_email");
      const savedPassword = localStorage.getItem("tf_sandbox_password");

      if (savedEmail && emailStr.trim().toLowerCase() === savedEmail.trim().toLowerCase()) {
        if (savedPassword && passwordStr !== savedPassword) {
          return "Invalid password for this local administrator account";
        }
      }

      const mockName = emailStr.split("@")[0];
      const capitalized = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      setAdmin((prev) => ({
        fullName: capitalized || "Alex Rivera",
        username: mockName || "arivera_admin",
        email: emailStr,
        role: "Super Administrator",
        avatarUrl: prev.avatarUrl || DEFAULT_ADMIN.avatarUrl,
      }));
      localStorage.setItem("tf_is_logged_in", "true");
      setIsLoggedIn(true);
      setCurrentScreen(Screen.DASHBOARD);
      showToast(`Welcome back! Enjoy local sandbox mode.`, "success");
      return undefined;
    }
  };

  // App Signup / Register
  const handleRegisterSubmit = async (
    gName: string,
    aName: string,
    aEmail: string,
    aPassword?: string
  ): Promise<string | undefined> => {
    const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
    let registeredToken = "";

    if (isCustomBackend) {
      try {
        const registerPayload = {
          name: aName,
          email: aEmail,
          password: aPassword,
          gymName: gName,
        };

        let response = await fetch(getApiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerPayload),
        });

        if (response.status === 404) {
          // Attempt alternate endpoint block
          response = await fetch(getApiUrl("/api/auth/signup"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerPayload),
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return errData.message || errData.error || `Registration failed with status ${response.status}`;
        }

        const data = await response.json();
        const payload = data.data || data;

        if (payload.token) {
          registeredToken = payload.token;
          setSettings((prev) => ({
            ...prev,
            backendToken: registeredToken,
          }));
        }
      } catch (err: unknown) {
        return err instanceof Error ? err.message : "Connection refused by backend during account registration.";
      }
    } else {
      // Local local storage sandbox state persistence
      localStorage.setItem("tf_sandbox_email", aEmail);
      if (aPassword) {
        localStorage.setItem("tf_sandbox_password", aPassword);
      }
    }

    setGym({
      name: gName,
      address: "242 Innovation Way, Tech District, San Francisco, CA 94103",
      phone: "+91 90000 11111",
      website: "www." + gName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
    });

    setAdmin({
      fullName: aName,
      username: aName.toLowerCase().split(" ").join("_"),
      email: aEmail,
      role: "Super Administrator",
      avatarUrl: DEFAULT_ADMIN.avatarUrl,
    });

    if (registeredToken) {
      localStorage.setItem("tf_is_logged_in", "true");
      setIsLoggedIn(true);
      setCurrentScreen(Screen.DASHBOARD);
      showToast("Account created! Your live database is ready.", "success");
    } else {
      showToast("Admin account configured successfully!", "success");
      setCurrentScreen(Screen.REG_SUCCESS);
    }
    return undefined;
  };

  // Activate setup on success payment QR screen
  const handleSetupActivationConfirm = () => {
    // Write setup payment record to transactions
    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      memberName: admin.fullName,
      planName: "Standard Setup - 6 Months",
      paymentMethod: "UPI",
      methodDetail: "Fast UPI scan approved",
      amount: 4500,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Completed",
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`${gym.name} is now fully active!`, "success");
  };

  // Directory: Add pristine new member
  const handleAddMember = async (mRaw: Omit<Member, "id">) => {
    const generatedId = `#TF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newM: Member = { ...mRaw, id: generatedId };

    setMembers((prev) => [newM, ...prev]);
    showToast(`Member profile for ${newM.name} generated successfully.`, "success");
    setCurrentScreen(Screen.MEMBERS_DIRECTORY);

    syncMemberToBackend(generatedId, newM, newM.plan, newM.price);

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      memberName: newM.name,
      planName: newM.plan,
      paymentMethod: "UPI",
      methodDetail: "UPI QR Payment",
      amount: newM.price,
      date: dateStr,
      status: "Completed",
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Directory: Modify existing member properties
  const handleEditMember = async (updatedM: Member) => {
    const originalMembers = [...members];
    
    // Optimistic UI update
    setMembers((prev) => prev.map((item) => (item.id === updatedM.id ? updatedM : item)));
    showToast(`Saving modifications for ${updatedM.name}...`, "info");

    try {
      const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
      const hasToken = settings.backendToken && settings.backendToken.trim();
      if (!isCustomBackend || !hasToken) return;

      const dbId = updatedM.id.replace("#TF-", "");
      const expiryForBackend = updatedM.expiryDate && updatedM.expiryDate !== "No Expiry"
        ? new Date(updatedM.expiryDate).toISOString().split('T')[0]
        : "";

      const response = await fetch(getApiUrl(`/api/members/${encodeURIComponent(dbId)}`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: updatedM.name,
          email: updatedM.email,
          phone: updatedM.phone,
          age: updatedM.age,
          address: updatedM.address,
          expiry_date: expiryForBackend,
          status: updatedM.status === "Expired" ? "inactive" : "active",
        }),
      });

      if (!response.ok) {
        setMembers(originalMembers);
        const errData = await response.json().catch(() => ({}));
        showToast(`Backend edit failed: ${errData.message || "Invalid DB request"}`, "error");
        return;
      }

      // Sync plan change if different from original
      const originalMember = originalMembers.find((m) => m.id === updatedM.id);
      if (originalMember && originalMember.plan !== updatedM.plan) {
        const plansRes = await fetch(getApiUrl("/api/memberships/plans"), { headers: getHeaders() });
        if (plansRes.ok) {
          const rawPlans = await plansRes.json();
          const plansList = Array.isArray(rawPlans) ? rawPlans : (rawPlans.data || rawPlans.plans || []);
          const matchingPlan = plansList.find((p: { name: string; price: number }) =>
            p.name.toLowerCase().includes(updatedM.plan.toLowerCase()) || p.price === updatedM.price
          );
          if (matchingPlan) {
            await fetch(getApiUrl("/api/memberships/subscribe"), {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify({ memberId: dbId, planId: matchingPlan.id, recordPayment: false }),
            });
          }
        }
      }

      showToast(`Modifications for ${updatedM.name} saved successfully.`, "success");
    } catch (err) {
      setMembers(originalMembers);
      console.log("API edit sync fallback active.", err);
      showToast(`Network error: Failed to update your backend.`, "error");
    }
  };

  // Directory: Remove member profile
  const handleDeleteMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const originalMembers = [...members];
    const originalTransactions = [...transactions];

    // Optimistic UI updates
    setMembers((prev) => prev.filter((item) => item.id !== memberId));
    setTransactions((prev) => prev.filter((item) => item.memberName !== target.name));
    showToast(`Requesting profile removal for ${target.name}...`, "info");

    try {
      const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
      const dbId = isCustomBackend ? memberId.replace("#TF-", "") : memberId;
      const response = await fetch(getApiUrl(`/api/members/${encodeURIComponent(dbId)}`), {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        // Roll back if error occurs (e.g. Prisma foreign key constraint violation)
        setMembers(originalMembers);
        setTransactions(originalTransactions);
        
        let errorMsg = "Check for active Subscriptions/Payments on pgAdmin. Force cascade delete required.";
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
          else if (errData.error) errorMsg = errData.error;
        } catch (_) {}

        showToast(`DB Delete FAILED: ${errorMsg}`, "error");
      } else {
        showToast(`${target.name} profile completed removal successfully.`, "success");
      }
    } catch (err) {
      setMembers(originalMembers);
      setTransactions(originalTransactions);
      console.log("API delete sync fallback active.", err);
      showToast(`Failed to connect to your live backend database.`, "error");
    }
  };

  // Checkout: Confirm Renewal Invoice Completion
  const handleConfirmRenewalSubmit = (memberId: string, planNameStr: string, paidAmount: number, paymentType: "QR" | "Cash" = "QR") => {
    // Process update dates
    const today = new Date();
    const joinDateStr = today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    const expiry = new Date();
    if (planNameStr.includes("6 Months")) {
      expiry.setMonth(expiry.getMonth() + 6);
    } else if (planNameStr.includes("Year") || planNameStr.includes("Annual")) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }
    const expiryDateStr = expiry.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    // Update members state
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status: "Active",
            plan: planNameStr,
            price: paidAmount,
            expiryDate: expiryDateStr,
            joinDate: joinDateStr,
            lastActive: joinDateStr,
          };
        }
        return m;
      })
    );

    // Retrieve name for record log
    const memberObj = members.find((m) => m.id === memberId);
    const mName = memberObj ? memberObj.name : "Vikram Singh";

    // Insert payment transaction log
    const paymentMethod = paymentType === "QR" ? "UPI" : "Cash";
    const methodDetail = paymentType === "QR" ? "BHIM UPI Terminal QR" : "Cash at Front Desk";
    const renewalTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      memberName: mName,
      planName: planNameStr,
      paymentMethod: paymentMethod as "UPI" | "Cash",
      methodDetail: methodDetail,
      amount: paidAmount,
      date: joinDateStr,
      status: "Completed",
    };
    setTransactions((prev) => [renewalTx, ...prev]);
    showToast(`Membership for ${mName} renewed successfully! Plan active until ${expiryDateStr}.`, "success");

    // Sync new expiry to backend
    syncRenewalToBackend(memberId, planNameStr, expiryDateStr);
  };

  const syncRenewalToBackend = async (memberId: string, planNameStr: string, expiryDateStr: string) => {
    const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
    const hasToken = settings.backendToken && settings.backendToken.trim();
    if (!isCustomBackend || !hasToken) return;

    const dbId = memberId.replace("#TF-", "");
    const expiryIso = new Date(expiryDateStr).toISOString().split('T')[0];

    try {
      await fetch(getApiUrl(`/api/members/${encodeURIComponent(dbId)}`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          expiry_date: expiryIso,
          status: "active",
        }),
      });
    } catch {
      console.log("Renewal backend sync skipped.");
    }
  };

  // Settings: Apply corporate parameters
  const handleSettingsSave = async (updated: { admin: AdminAccount; gym: GymInfo; settings: SystemSettings }) => {
    setAdmin(updated.admin);
    setGym(updated.gym);
    setSettings(updated.settings);
    showToast("Global system configurations saved successfully!", "success");

    try {
      await fetch(getApiUrl("/api/admin"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(updated.admin),
      });
      await fetch(getApiUrl("/api/gym"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(updated.gym),
      });
      await fetch(getApiUrl("/api/settings"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(updated.settings),
      });
    } catch (err) {
      console.log("Settings backend API sync skipped.");
    }
  };

  // Reset all data — clears DB, localStorage, and resets state to factory defaults
  // Subscription Plans: Save edited plans
  const handleSavePlans = (updatedPlans: SubscriptionPlan[]) => {
    setSubscriptionPlans(updatedPlans);
    showToast("Subscription plans updated successfully!", "success");
  };

  // Add Member Wizard: Complete all 3 steps
  const syncMemberToBackend = async (
    localId: string,
    m: Member,
    planName: string,
    planPrice: number,
  ) => {
    const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
    const hasToken = settings.backendToken && settings.backendToken.trim();
    if (!isCustomBackend || !hasToken) return;
    try {
      const expiryForBackend = m.expiryDate && m.expiryDate !== "No Expiry"
        ? new Date(m.expiryDate).toISOString().split('T')[0]
        : "";

      const memberRes = await fetch(getApiUrl("/api/members"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: m.name, email: m.email, phone: m.phone, age: m.age, address: m.address,
          expiry_date: expiryForBackend,
        }),
      });
      if (!memberRes.ok) {
        const errBody = await memberRes.json().catch(() => ({}));
        const reason = errBody.message || errBody.error || `Server error (${memberRes.status})`;
        if (memberRes.status === 401) {
          showToast("Session expired. Please log out and log back in.", "error");
        } else {
          showToast(`Backend sync failed: ${reason}`, "error");
        }
        return;
      }
      const memberData = await memberRes.json();
      const createdMember = memberData.data || memberData.member || memberData;
      const createdId = createdMember.id;
      if (!createdId) return;

      setMembers((prev) =>
        prev.map((item) => (item.id === localId ? { ...item, id: String(createdId) } : item))
      );

      let foundPlanId: string | null = null;
      const plansRes = await fetch(getApiUrl("/api/memberships/plans"), { headers: getHeaders() });
      if (plansRes.ok) {
        const rawPlans = await plansRes.json();
        const plansList = Array.isArray(rawPlans) ? rawPlans : (rawPlans.data || rawPlans.plans || []);
        const matchingPlan = plansList.find((p: { name: string; price: number }) =>
          p.name.toLowerCase().includes(planName.toLowerCase()) || p.price === planPrice
        );
        if (matchingPlan) {
          foundPlanId = matchingPlan.id;
        } else {
          const createPlanRes = await fetch(getApiUrl("/api/memberships/plans"), {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              name: planName,
              price: planPrice,
              durationMonths: planName.includes("6 Months") ? 6 : (planName.includes("Year") || planName.includes("Annual") ? 12 : 1),
              description: `${planName} premium access package`,
            }),
          });
          if (createPlanRes.ok) {
            const newPlanData = await createPlanRes.json();
            const createdPlan = newPlanData.data || newPlanData.plan || newPlanData;
            if (createdPlan && createdPlan.id) {
              foundPlanId = createdPlan.id;
            }
          }
        }
      }
      if (foundPlanId) {
        await fetch(getApiUrl("/api/memberships/subscribe"), {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ memberId: createdId, planId: foundPlanId, recordPayment: false }),
        });
      }
    } catch {
      showToast("Could not reach backend server. Check your connection.", "error");
    }
  };

  const handleAddMemberWizardComplete = (result: {
    member: Omit<Member, "id">;
    planName: string;
    planPrice: number;
    paymentType: "UPI" | "Cash";
  }) => {
    const generatedId = `#TF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newM: Member = {
      ...result.member,
      id: generatedId,
    };

    setMembers((prev) => [newM, ...prev]);
    showToast(`Member ${newM.name} created successfully with ${result.planName}.`, "success");

    syncMemberToBackend(generatedId, newM, result.planName, result.planPrice);

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const paymentMethod = result.paymentType === "UPI" ? "UPI" as const : "Cash" as const;
    const methodDetail = result.paymentType === "UPI" ? "UPI QR Payment" : "Cash at Front Desk";

    const renewalTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      memberName: newM.name,
      planName: result.planName,
      paymentMethod,
      methodDetail,
      amount: result.planPrice,
      date: dateStr,
      status: "Completed",
    };
    setTransactions((prev) => [renewalTx, ...prev]);

    setCurrentScreen(Screen.MEMBERS_DIRECTORY);
  };

  const handleOpenWizard = () => {
    setCurrentScreen(Screen.ADD_MEMBER_WIZARD);
  };

  const handleNavigationTransition = (target: Screen) => {
    if (target === Screen.LOGIN) {
      localStorage.removeItem("tf_is_logged_in");
      setIsLoggedIn(false);
      setCurrentScreen(Screen.LOGIN);
      showToast("Administrator logged out successfully.", "info");
    } else {
      setCurrentScreen(target);
    }
  };

  // 4. Structural Router View Switcher
  const renderScreenContent = () => {
    switch (currentScreen) {
      case Screen.DASHBOARD:
        return (
          <DashboardView
            members={members}
            transactions={transactions}
            onNavigate={setCurrentScreen}
          />
        );
      case Screen.MEMBERS_DIRECTORY:
        return (
          <MembersView
            members={members}
            plans={subscriptionPlans}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onConfirmRenewal={handleConfirmRenewalSubmit}
            onNavigate={setCurrentScreen}
            onOpenWizard={handleOpenWizard}
          />
        );
      case Screen.PAYMENTS_FINANCE:
        return <PaymentsView transactions={transactions} members={members} />;
      case Screen.SUBSCRIPTION_PLANS:
        return (
          <SubscriptionPlansView
            plans={subscriptionPlans}
            onSave={handleSavePlans}
          />
        );
      case Screen.ADD_MEMBER_WIZARD:
        return (
          <AddMemberWizard
            members={members}
            plans={subscriptionPlans}
            onComplete={handleAddMemberWizardComplete}
            onCancel={() => setCurrentScreen(Screen.MEMBERS_DIRECTORY)}
          />
        );
      case Screen.SETTINGS:
        return (
          <SettingsView
            admin={admin}
            gym={gym}
            settings={settings}
            onSave={handleSettingsSave}
            onNavigate={handleNavigationTransition}
          />
        );
      default:
        return (
          <DashboardView
            members={members}
            transactions={transactions}
            onNavigate={setCurrentScreen}
          />
        );
    }
  };

  // Standard non-dashboard wrappers (Logins, Signup onboarding screens)
  const isOnboardingScreen =
    currentScreen === Screen.LOGIN ||
    currentScreen === Screen.REGISTER ||
    currentScreen === Screen.FORGOT_PASSWORD ||
    currentScreen === Screen.REG_SUCCESS;

  if (isOnboardingScreen) {
    return (
      <div className="min-h-screen bg-slate-900 overflow-y-auto">
        {currentScreen === Screen.LOGIN && (
          <LoginView onLogin={handleLoginSubmit} onNavigate={setCurrentScreen} />
        )}
        {currentScreen === Screen.REGISTER && (
          <RegisterView onRegister={handleRegisterSubmit} onNavigate={setCurrentScreen} />
        )}
        {currentScreen === Screen.FORGOT_PASSWORD && (
          <ForgotPasswordView onNavigate={setCurrentScreen} />
        )}
        {currentScreen === Screen.REG_SUCCESS && (
          <RegSuccessView
            gymName={gym.name}
            adminName={admin.fullName}
            onActivate={handleSetupActivationConfirm}
            onNavigate={setCurrentScreen}
          />
        )}

        {/* Transient Toasts notifications renderer */}
        {toasts.length > 0 && <ToastContainer toasts={toasts} />}
      </div>
    );
  }

  // Dashboard Master Frame View Layout
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Navigation rail sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigationTransition}
        gymName={gym.name}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />

      {/* Main content body panel */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "pl-[80px]" : "pl-[280px]"}`}>
        
        {/* Persistent App bar */}
        <Header
          admin={admin}
          onNavigate={handleNavigationTransition}
          currentScreen={currentScreen}
          collapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Primary responsive view stage */}
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] overflow-y-auto">
          {renderScreenContent()}
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-slate-400 px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">FitLife Pro</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">&copy; {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact Support</span>
            </div>
            <div className="text-slate-500">
              <span>Version 2.1.0</span>
            </div>
          </div>
          <div className="max-w-7xl mx-auto text-center mt-3 text-[10px] text-slate-600 sm:hidden">
            &copy; {new Date().getFullYear()} FitLife Pro. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Transient Toasts notifications renderer */}
      {toasts.length > 0 && <ToastContainer toasts={toasts} />}
    </div>
  );
}

// Inner modular Toast popups container for premium styling representation
function ToastContainer({ toasts }: { toasts: Array<{ id: string; message: string; type: string }> }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => {
        let IconElement = CheckCircle2;
        if (toast.type === "edit" || toast.type === "info") IconElement = Sparkles;
        if (toast.type === "error") IconElement = Trash;

        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 text-white text-xs font-bold px-4 py-3.5 rounded-lg shadow-2xl animate-scale-in pointer-events-auto"
          >
            <IconElement className={`w-5 h-5 flex-shrink-0 ${
              toast.type === "success"
                ? "text-emerald-400"
                : toast.type === "error"
                ? "text-rose-500"
                : "text-blue-400"
            }`} />
            <p className="leading-normal">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
