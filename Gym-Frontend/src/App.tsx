/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Screen, Member, Transaction, AdminAccount, GymInfo, SystemSettings, AppNotification } from "./types";
import {
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  DEFAULT_ADMIN,
  DEFAULT_GYM,
  DEFAULT_SETTINGS,
} from "./data";

// Views
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import MembersView from "./components/MembersView";
import PaymentsView from "./components/PaymentsView";
import RenewalView from "./components/RenewalView";
import SettingsView from "./components/SettingsView";
import LoginView from "./components/LoginView";
import RegisterView from "./components/RegisterView";
import ForgotPasswordView from "./components/ForgotPasswordView";
import RegSuccessView from "./components/RegSuccessView";

import { CheckCircle2, UserPlus, Trash, Sparkles } from "lucide-react";

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
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Auxiliary state for member selection in renew panel
  const [preselectedMemberId, setPreselectedMemberId] = useState<string | null>(null);

  // Global search input in top bar
  const [globalSearch, setGlobalSearch] = useState("");

  // Notification bell state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("tf_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Toast dynamic array system
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "error" }[]>([]);

  // Track if localStorage had data on mount — skip API overwrite if so
  const hasLocalData = useRef({
    members: !!localStorage.getItem("tf_members"),
    transactions: !!localStorage.getItem("tf_transactions"),
  });

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
    localStorage.setItem("tf_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Fetch active members from backend – skip if localStorage already has data
useEffect(() => {
  if (hasLocalData.current.members) return;
  async function fetchActiveMembers() {
    try {
      const res = await fetch(getApiUrl("/api/members/active"), {
        headers: getHeaders(),
      });
      if (res.ok) {
        const raw = await res.json();
        const mapped = Array.isArray(raw)
          ? raw.map((m) => mapBackendMemberToFrontend(m))
          : raw.data?.members?.map((m) => mapBackendMemberToFrontend(m)) ?? [];

        if (mapped.length > 0) {
          setMembers(mapped);
        }
      }
    } catch (e) {
      console.log("Failed to load active members", e);
    }
  }
  fetchActiveMembers();
  }, [settings.backendUrl, settings.backendToken]);

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

  // Mapper from live Prisma backend schema payload to system frontend states
  const mapBackendMemberToFrontend = (m: any): Member => {
    const activeSub = m.subscriptions && m.subscriptions[0] ? m.subscriptions[0] : null;
    const planName = activeSub && activeSub.plan ? activeSub.plan.name : "No Active Plan";
    const planPrice = activeSub && activeSub.plan ? parseFloat(activeSub.plan.price) || 0 : 0;
    
    let joinDate = m.createdAt 
      ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    if (activeSub && activeSub.startDate) {
      joinDate = new Date(activeSub.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    let expiryDate = "No Expiry";
    if (activeSub && activeSub.endDate) {
      expiryDate = new Date(activeSub.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    let status: "Active" | "Expired" | "Expiring" = "Active";
    if (m.status === "INACTIVE" || (activeSub && activeSub.status === "EXPIRED")) {
      status = "Expired";
    } else if (activeSub && activeSub.endDate) {
      const timeDiff = new Date(activeSub.endDate).getTime() - Date.now();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      if (daysDiff < 0) {
        status = "Expired";
      } else if (daysDiff <= 14) {
        status = "Expiring";
      }
    }

    const lastActive = m.attendance && m.attendance[0]
      ? new Date(m.attendance[0].checkIn).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : joinDate;

    return {
      id: m.id ? String(m.id) : String(Math.floor(1000 + Math.random() * 9000)),
      name: m.name,
      email: m.email,
      phone: m.phone || "",
      age: m.age || 0,
      address: m.address || "",
      avatarUrl: m.avatarUrl || undefined,
      joinDate,
      expiryDate,
      plan: planName,
      price: planPrice,
      status,
      lastActive,
      homeBranch: "Downtown Central"
    };
  };

  // Mapper from live Prisma backend Payment schema to frontend Transaction
  const mapBackendPaymentToFrontend = (p: any): Transaction => {
    const memberName = p.subscription && p.subscription.member ? p.subscription.member.name : "N/A";
    const planName = p.subscription && p.subscription.plan ? p.subscription.plan.name : "N/A";
    const dateStr = p.paymentDate 
      ? new Date(p.paymentDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    return {
      id: p.id ? String(p.id) : String(Math.floor(10000 + Math.random() * 90000)),
      memberName,
      planName,
      paymentMethod: "UPI",
      methodDetail: "Prisma Database Settlement",
      amount: parseFloat(p.amount) || 0,
      date: dateStr,
      status: p.status === "PAID" ? "Completed" : "Pending"
    };
  };

  // Load and synchronize data from external API routes – skip if localStorage had data
  useEffect(() => {
    async function fetchBackendDb() {
      if (!hasLocalData.current.members) {
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
            const mapped = list.map((m: any) => mapBackendMemberToFrontend(m));
            if (mapped.length > 0) {
              setMembers(mapped);
            }
          }
        } catch (e) {
          console.log("Offline or connection fallback for members active.");
        }
      }

      if (!hasLocalData.current.transactions) {
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
            const mapped = list.map((p: any) => mapBackendPaymentToFrontend(p));
            if (mapped.length > 0) {
              setTransactions(mapped);
            }
          } else {
            const fallbackRes = await fetch("/api/transactions");
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              if (Array.isArray(data)) setTransactions(data);
            }
          }
        } catch (e) {
          console.log("Offline local storage fallback active.");
        }
      }

      try {
        const res = await fetch(getApiUrl("/api/admin"), { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.fullName) setAdmin(data);
        }
      } catch (e) {
        console.log("Admin config fallback active.");
      }

      try {
        const res = await fetch(getApiUrl("/api/gym"), { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setGym(data);
        }
      } catch (e) {
        console.log("Gym config fallback active.");
      }

      try {
        const res = await fetch(getApiUrl("/api/settings"));
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.log("System settings config fallback active.");
      }
    }
    fetchBackendDb();
  }, [settings.backendUrl, settings.backendToken]);

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
        
        setAdmin({
          fullName: adminObj.name || adminObj.fullName || "Backend Admin",
          username: adminObj.username || emailStr.split("@")[0],
          email: adminObj.email || emailStr,
          role: "Super Administrator",
          avatarUrl: DEFAULT_ADMIN.avatarUrl,
        });
        
        localStorage.setItem("tf_is_logged_in", "true");
        setIsLoggedIn(true);
        setCurrentScreen(Screen.DASHBOARD);
        showToast(`Welcome back! Live database synchronized.`, "success");
        return undefined;
      } catch (err: any) {
        return err.message || "Connection refused by the backend server";
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
      setAdmin({
        fullName: capitalized || "Alex Rivera",
        username: mockName || "arivera_admin",
        email: emailStr,
        role: "Super Administrator",
        avatarUrl: DEFAULT_ADMIN.avatarUrl,
      });
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

        // Apply fallback authorization header if returned on creation
        if (payload.token) {
          setSettings((prev) => ({
            ...prev,
            backendToken: payload.token,
          }));
        }
      } catch (err: any) {
        return err.message || "Connection refused by backend during account registration.";
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

    showToast("Admin account configured successfully!", "success");
    setCurrentScreen(Screen.REG_SUCCESS);
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
    const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
    let generatedId = `#TF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newM: Member = {
      ...mRaw,
      id: generatedId,
    };

    // Pre-insert log dynamically
    setMembers((prev) => [newM, ...prev]);
    showToast(`Member profile for ${newM.name} generated successfully.`, "success");

    // Push notification for bell icon
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        message: `New member created: ${newM.name}`,
        memberName: newM.name,
        timestamp: new Date().toLocaleString(),
        read: false,
      },
      ...prev,
    ]);

    // Navigate directly to Subscription/Renewal page with the new member preselected
    setPreselectedMemberId(generatedId);
    setCurrentScreen(Screen.MEMBERSHIP_RENEWAL);

    // Active synchronization with backend server
    try {
      if (isCustomBackend) {
        // Step 1: Create Member
        const memberPayload = {
          name: newM.name,
          email: newM.email,
          phone: newM.phone,
          age: newM.age,
          address: newM.address,
        };
        const memberRes = await fetch(getApiUrl("/api/members"), {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(memberPayload),
        });

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          const createdMember = memberData.data || memberData.member || memberData;
          const createdId = createdMember.id;

          if (createdId) {
            // Sync local state ID with the database ID so edit and delete actions work instantly
            setMembers((prev) =>
              prev.map((item) => (item.id === generatedId ? { ...item, id: String(createdId) } : item))
            );

            // Step 2: Fetch and find or create correct subscription plan ID
            let planId = 1;
            const plansRes = await fetch(getApiUrl("/api/memberships/plans"), { headers: getHeaders() });
            if (plansRes.ok) {
              const rawPlans = await plansRes.json();
              const plansList = Array.isArray(rawPlans) ? rawPlans : (rawPlans.data || rawPlans.plans || []);
              const matchingPlan = plansList.find((p: any) => p.name.toLowerCase().includes(newM.plan.toLowerCase()) || p.price === newM.price);
              
              if (matchingPlan) {
                planId = matchingPlan.id;
              } else {
                // Let's create the plan dynamically on user's backend, preventing any subscription failures!
                const createPlanRes = await fetch(getApiUrl("/api/memberships/plans"), {
                  method: "POST",
                  headers: getHeaders(),
                  body: JSON.stringify({
                    name: newM.plan,
                    price: newM.price,
                    durationMonths: newM.plan.includes("6 Months") ? 6 : (newM.plan.includes("Year") || newM.plan.includes("Annual") ? 12 : 1),
                    description: `${newM.plan} premium access package`,
                  }),
                });
                if (createPlanRes.ok) {
                  const newPlanData = await createPlanRes.json();
                  planId = (newPlanData.data || newPlanData.plan || newPlanData).id || 1;
                }
              }
            }

            // Step 3: Trigger subscribeMember mapping Subscription & Payment records on their database
            await fetch(getApiUrl("/api/memberships/subscribe"), {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify({
                memberId: createdId,
                planId: planId,
              }),
            });
          }
        }
      } else {
        // Fallback or demo local storage server mode
        await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newM),
        });
      }
    } catch (err) {
      console.log("Custom backend API sync failed.", err);
    }
  };

  // Directory: Modify existing member properties
  const handleEditMember = async (updatedM: Member) => {
    const originalMembers = [...members];
    
    // Optimistic UI update
    setMembers((prev) => prev.map((item) => (item.id === updatedM.id ? updatedM : item)));
    showToast(`Saving modifications for ${updatedM.name}...`, "info");

    try {
      const isCustomBackend = settings.backendUrl && settings.backendUrl.trim();
      const dbId = isCustomBackend ? updatedM.id.replace("#TF-", "") : updatedM.id;
      const response = await fetch(getApiUrl(`/api/members/${encodeURIComponent(dbId)}`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: updatedM.name,
          email: updatedM.email,
          phone: updatedM.phone,
          address: updatedM.address,
          status: updatedM.status === "Expired" ? "INACTIVE" : "ACTIVE",
        }),
      });

      if (!response.ok) {
        setMembers(originalMembers);
        const errData = await response.json().catch(() => ({}));
        showToast(`Backend edit failed: ${errData.message || "Invalid DB request"}`, "error");
      } else {
        showToast(`Modifications for ${updatedM.name} saved successfully.`, "success");
      }
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

  // Routing directly to payment activation renewal
  const handleRenewMemberRouting = (memberId: string) => {
    setPreselectedMemberId(memberId);
    setCurrentScreen(Screen.MEMBERSHIP_RENEWAL);
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
  };

  // Settings: Apply corporate parameters
  const handleSettingsSave = async (updated: { admin: AdminAccount; gym: GymInfo; settings: SystemSettings }) => {
    setAdmin(updated.admin);
    setGym(updated.gym);
    setSettings(updated.settings);
    showToast("Global system configurations saved successfully!", "success");

    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.admin),
      });
      await fetch("/api/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.gym),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.settings),
      });
    } catch (err) {
      console.log("Settings backend API sync skipped.");
    }
  };

  // Utility to auto toggle adding a member from sidebar
  const handleOpenNewMemberOnDirectory = () => {
    setCurrentScreen(Screen.MEMBERS_DIRECTORY);
    // Dynamic message instruction
    showToast("Tap 'Add New Member' on the top right to register.", "info");
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
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
            onRenewMember={handleRenewMemberRouting}
          />
        );
      case Screen.MEMBERS_DIRECTORY:
        return (
          <MembersView
            members={members}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onRenewMember={handleRenewMemberRouting}
            onConfirmRenewal={handleConfirmRenewalSubmit}
          />
        );
      case Screen.PAYMENTS_FINANCE:
        return <PaymentsView transactions={transactions} />;
      case Screen.MEMBERSHIP_RENEWAL:
        return (
          <RenewalView
            members={members}
            preselectedMemberId={preselectedMemberId}
            onConfirmRenewal={handleConfirmRenewalSubmit}
            onNavigate={setCurrentScreen}
          />
        );
      case Screen.SETTINGS:
        return (
          <SettingsView
            admin={admin}
            gym={gym}
            settings={settings}
            onSave={handleSettingsSave}
          />
        );
      default:
        return (
          <DashboardView
            members={members}
            transactions={transactions}
            onNavigate={setCurrentScreen}
            onRenewMember={handleRenewMemberRouting}
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
        onOpenNewMemberModal={handleOpenNewMemberOnDirectory}
        gymName={gym.name}
      />

      {/* Main content body panel */}
      <div className="flex-1 flex flex-col min-w-0 pl-[280px]">
        
        {/* Persistent App bar */}
        <Header
          admin={admin}
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (currentScreen !== Screen.MEMBERS_DIRECTORY && currentScreen !== Screen.PAYMENTS_FINANCE) {
              setCurrentScreen(Screen.MEMBERS_DIRECTORY);
            }
          }}
          onNavigate={handleNavigationTransition}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Primary responsive view stage */}
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] overflow-y-auto">
          {renderScreenContent()}
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-slate-400 px-8 py-6">
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
function ToastContainer({ toasts }: { toasts: any[] }) {
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
                ? "text-rose-450"
                : "text-blue-400"
            }`} />
            <p className="leading-normal">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
