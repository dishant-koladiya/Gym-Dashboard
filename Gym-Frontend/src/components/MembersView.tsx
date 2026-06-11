/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Member, Screen, SubscriptionPlan } from "../types";
import { PACKAGES } from "../data";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  X,
  Users,
  Award,
  Ban,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Banknote,
  Phone,
  MapPin,
  Camera,
} from "lucide-react";

interface MembersViewProps {
  members: Member[];
  plans?: SubscriptionPlan[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onConfirmRenewal: (memberId: string, planName: string, amount: number, paymentType: "QR" | "Cash") => void;
  onNavigate?: (screen: Screen) => void;
  onOpenWizard?: () => void;
}

export default function MembersView({
  members,
  plans,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onConfirmRenewal,
  onNavigate,
  onOpenWizard,
}: MembersViewProps) {
  const planOptions = plans || PACKAGES;
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Input modal forms state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMemberToEdit, setActiveMemberToEdit] = useState<Member | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);

  // New member form temp local state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPlan, setNewPlan] = useState("Monthly Basic");
  const [newStatus, setNewStatus] = useState<"Active" | "Expired" | "Expiring">("Active");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Auto-compute member status from expiryDate (14-day threshold)
  const monthMap: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const getMemberStatus = (m: Member): "Active" | "Expired" | "Expiring" => {
    if (!m.expiryDate || m.expiryDate === "No Expiry") return "Active";
    const parts = m.expiryDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!parts) return "Active";
    const expiry = new Date(parseInt(parts[3]), monthMap[parts[1]], parseInt(parts[2]));
    const daysDiff = (expiry.getTime() - Date.now()) / (1000 * 3600 * 24);
    if (daysDiff < 0) return "Expired";
    if (daysDiff <= 14) return "Expiring";
    return "Active";
  };

  const membersWithStatus = members.map((m) => ({ ...m, status: getMemberStatus(m) }));

  // Member info card state
  const [activeInfoMember, setActiveInfoMember] = useState<string | null>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);

  const [activeImageMember, setActiveImageMember] = useState<string | null>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (infoCardRef.current && !infoCardRef.current.contains(e.target as Node)) {
        setActiveInfoMember(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (imageCardRef.current && !imageCardRef.current.contains(e.target as Node)) {
        setActiveImageMember(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Renewal modal state
  const [renewalMember, setRenewalMember] = useState<Member | null>(null);
  const [renewalPlan, setRenewalPlan] = useState(
    planOptions.find((p) => p.active) || planOptions[0]
  );
  const [renewalPaymentType, setRenewalPaymentType] = useState<"QR" | "Cash">("QR");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateName = (v: string) => !v.trim() ? "Name is required" : "";
  const validateEmail = (v: string) => !v.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "";
  const validatePhone = (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "Phone number is required";
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2).length !== 10 || !/^[6-9]/.test(digits.slice(2)) ? "Enter a valid 10-digit  mobile number" : "";
    if (digits.length === 10) return !/^[6-9]/.test(digits) ? "Indian mobile must start with 6, 7, 8, or 9" : "";
    return "Enter a valid 10-digit mobile number";
  };
  const validateAge = (v: string) => {
    const n = parseInt(v);
    return !v.trim() ? "Age is required" : isNaN(n) || n < 12 || n > 90 ? "Age must be between 12 and 90" : "";
  };

  const addressSchema = z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be at most 200 characters");

  const validateAddress = (v: string) => {
    const result = addressSchema.safeParse(v);
    return result.success ? "" : result.error.issues[0].message;
  };

  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "name") err = validateName(value);
    else if (field === "email") err = validateEmail(value);
    else if (field === "phone") err = validatePhone(value);
    else if (field === "age") err = validateAge(value);
    else if (field === "address") err = validateAddress(value);
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "name" ? newName : field === "email" ? newEmail : field === "phone" ? newPhone : field === "age" ? newAge : field === "address" ? newAddress : "";
    validateField(field, val);
  };

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length <= 10) return digits;
    if (digits.startsWith("91") && digits.length <= 12) return "+91 " + digits.slice(2);
    return v;
  };

  // Filter computation
  const filteredMembers = membersWithStatus.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesPlan = planFilter === "All" || m.plan.toLowerCase().includes(planFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const [memberPage, setMemberPage] = useState(1);
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((memberPage - 1) * ITEMS_PER_PAGE, memberPage * ITEMS_PER_PAGE);

  // Calculate quick stats from computed status (14-day expiry threshold)
  const totalCount = membersWithStatus.length;
  const activeCount = membersWithStatus.filter((m) => m.status === "Active").length;
  const expiringCount = membersWithStatus.filter((m) => m.status === "Expiring").length;
  const expiredCount = membersWithStatus.filter((m) => m.status === "Expired").length;

  const memberStats = [
    { title: "Total Members", value: totalCount.toLocaleString(), change: "All members", isPositive: true, color: "bg-blue-50 text-blue-600", icon: Users },
    { title: "Active Plans", value: activeCount.toLocaleString(), change: "On-going plans", isPositive: true, color: "bg-emerald-50 text-emerald-600", icon: Award },
    { title: "Expiring Soon", value: expiringCount.toString(), change: "Needs attention", isPositive: false, color: "bg-amber-50 text-amber-600", icon: UserCheck },
    { title: "Expired Memberships", value: expiredCount.toString(), change: "Requires action", isPositive: false, color: "bg-rose-50 text-rose-600", icon: Ban },
  ];

  const handleOpenAddModal = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewAge("");
    setNewAddress("");
    setNewPlan("Monthly Basic");
    setNewStatus("Active");
    setNewAvatarUrl("");
    setErrors({});
    setTouched({});
    setIsAddModalOpen(true);
  };

  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allTouched = { name: true, email: true, phone: true, age: true, address: true };
    setTouched(allTouched);
    const nameErr = validateField("name", newName);
    const emailErr = validateField("email", newEmail);
    const phoneErr = validateField("phone", newPhone);
    const ageErr = validateField("age", newAge);
    const addressErr = validateField("address", newAddress);
    if (nameErr || emailErr || phoneErr || ageErr || addressErr) return;

    const duplicateEmail = members.some((m) => m.email.toLowerCase() === newEmail.trim().toLowerCase());
    if (duplicateEmail) {
      setErrors((prev) => ({ ...prev, email: "A member with this email already exists" }));
      return;
    }

    const today = new Date();
    const joinDateStr = today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    const expiry = new Date();
    if (newPlan.includes("6 Months")) {
      expiry.setMonth(expiry.getMonth() + 6);
    } else if (newPlan.includes("Annual") || newPlan.includes("Year")) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }
    const expiryDateStr = expiry.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    onAddMember({
      name: newName,
      email: newEmail,
      phone: newPhone.startsWith("+") ? newPhone : "+91 " + newPhone.replace(/\D/g, ""),
      age: parseInt(newAge),
      address: newAddress,
      joinDate: joinDateStr,
      expiryDate: expiryDateStr,
      plan: newPlan,
      price: newPlan.includes("Annual") ? 8000 : newPlan.includes("6 Months") ? 4500 : 1200,
      status: newStatus,
      lastActive: joinDateStr,
      homeBranch: "Downtown Central",
      avatarUrl: newAvatarUrl || undefined,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (member: Member) => {
    setActiveMemberToEdit(member);
    setNewName(member.name);
    setNewEmail(member.email);
    setNewPhone(member.phone);
    setNewAge(member.age.toString());
    setNewAddress(member.address);
    setNewPlan(member.plan);
    setNewAvatarUrl(member.avatarUrl || "");
    setNewStatus(member.status);
    setErrors({});
    setTouched({});
    setIsEditModalOpen(true);
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMemberToEdit) return;

    const allTouched = { name: true, email: true, phone: true, age: true, address: true };
    setTouched(allTouched);
    const nameErr = validateField("name", newName);
    const emailErr = validateField("email", newEmail);
    const phoneErr = validateField("phone", newPhone);
    const ageErr = validateField("age", newAge);
    const addressErr = validateField("address", newAddress);
    if (nameErr || emailErr || phoneErr || ageErr || addressErr) return;

    onEditMember({
      ...activeMemberToEdit,
      name: newName,
      email: newEmail,
      phone: newPhone,
      age: parseInt(newAge),
      address: newAddress,
      plan: newPlan,
      status: newStatus,
      avatarUrl: newAvatarUrl || undefined,
    });

    setIsEditModalOpen(false);
    setActiveMemberToEdit(null);
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Members Directory</h2>
          <p className="text-slate-500 font-medium">Manage your gym community and membership lifecycles</p>
        </div>
        
        {/* Action button - Opens Wizard */}
        <button
          onClick={() => {
            if (onOpenWizard) {
              onOpenWizard();
            } else {
              handleOpenAddModal();
            }
          }}
          className="bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Dashboard-style stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {memberStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-lg transition-all hover:border-blue-500 hover:shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.title}</p>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight text-center">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Directory Filter Panel */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
            placeholder="Search member name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Plan & Status Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          <select
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded px-3 py-2 cursor-pointer focus:ring-1 focus:ring-blue-600 focus:outline-none"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="All">All Plans</option>
            {planOptions.filter((p) => p.active).map((pkg) => (
              <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
            ))}
          </select>

          <select
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded px-3 py-2 cursor-pointer focus:ring-1 focus:ring-blue-600 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Expiring">Expiring</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== "All" || planFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPlanFilter("All");
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Directory Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">Selected Plan</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No members match your current filters. Tap "Add New Member" to create one.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            onClick={() => member.avatarUrl && setActiveImageMember(activeImageMember === member.id ? null : member.id)}
                            className={`h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-50 shadow-xs flex-shrink-0 ${member.avatarUrl ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''} transition`}
                            title={member.avatarUrl ? "View photo" : ""}
                          >
                            {member.avatarUrl ? (
                              <img
                                referrerPolicy="no-referrer"
                                src={member.avatarUrl}
                                alt="Member Profile image"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-blue-700 bg-blue-50 text-xs">
                                {member.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                            )}
                          </div>
                          {activeImageMember === member.id && member.avatarUrl && (
                            <div
                              ref={imageCardRef}
                              className="absolute left-0 top-full mt-2 z-40 animate-scale-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <p
                            onClick={() => setActiveInfoMember(activeInfoMember === member.id ? null : member.id)}
                            className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition"
                          >
                            {member.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 leading-none mt-0.5">
                            <span className="font-semibold text-slate-600">{member.id}</span>
                            <span>•</span>
                            <span>{member.email}</span>
                          </p>
                          {activeInfoMember === member.id && (
                            <div
                              ref={infoCardRef}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-xl z-40 p-4 animate-scale-in"
                            >
                              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700">
                                  {member.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 leading-tight">{member.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono font-semibold">{member.id}</p>
                                </div>
                              </div>
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <span className="text-xs font-medium text-slate-700">{member.phone}</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 leading-snug">{member.address}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{member.plan}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{member.joinDate}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">{member.expiryDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          member.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : member.status === "Expired"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => { setRenewalMember(member); setRenewalPlan(planOptions.find((p) => p.active) || planOptions[1] || planOptions[0]); setRenewalPaymentType("QR"); }}
                          className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded hover:bg-blue-700 transition active:scale-[0.97] cursor-pointer"
                        >
                          Renew
                        </button>
                        
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded transition cursor-pointer"
                          title="Edit Personal Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setDeleteConfirmMember(member)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition cursor-pointer"
                          title="Remove Member Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="text-slate-500">
            Showing <span className="font-bold text-slate-800">{paginatedMembers.length}</span> of{" "}
            <span className="font-bold text-slate-800">{filteredMembers.length}</span> members records
          </p>
          <div className="flex gap-2">
            <button
              disabled={memberPage <= 1}
              onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                memberPage <= 1 ? "bg-white border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setMemberPage(i + 1)}
                className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                  memberPage === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={memberPage >= totalPages}
              onClick={() => setMemberPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                memberPage >= totalPages ? "bg-white border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Dialog Popup Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg overflow-hidden shadow-xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Add New Member</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMemberSubmit} className="p-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Member Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.name && errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); if (touched.name) validateField("name", e.target.value); }}
                  onBlur={() => handleBlur("name")}
                />
                {touched.name && errors.name && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Email</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.email && errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); if (touched.email) validateField("email", e.target.value); }}
                  onBlur={() => handleBlur("email")}
                />
                {touched.email && errors.email && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  maxLength={18}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.phone && errors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newPhone}
                  onChange={(e) => { setNewPhone(formatPhone(e.target.value)); if (touched.phone) validateField("phone", formatPhone(e.target.value)); }}
                  onBlur={() => handleBlur("phone")}
                />
                {touched.phone && errors.phone && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.phone}</p>}
                {!errors.phone && newPhone && !touched.phone && <p className="text-[11px] text-slate-400 mt-0.5">Indian mobile: 10 digits starting with 6-9</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  min={12}
                  max={120}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.age && errors.age ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newAge}
                  onChange={(e) => { setNewAge(e.target.value); if (touched.age) validateField("age", e.target.value); }}
                  onBlur={() => handleBlur("age")}
                />
                {touched.age && errors.age && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.age}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                <textarea
                  placeholder="e.g. 42, MG Road, Bangalore - 560001"
                  rows={2}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition resize-none ${
                    touched.address && errors.address ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newAddress}
                  onChange={(e) => { setNewAddress(e.target.value); if (touched.address) validateField("address", e.target.value); }}
                  onBlur={() => handleBlur("address")}
                />
                {touched.address && errors.address && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.address}</p>}
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {newAvatarUrl ? (
                      <img src={newAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer">
                    Choose File
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {newAvatarUrl && (
                    <button type="button" onClick={() => setNewAvatarUrl("")} className="text-xs text-red-500 hover:underline cursor-pointer">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Dialog Popup Modal */}
      {isEditModalOpen && activeMemberToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg overflow-hidden shadow-xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-600" />
                <span>Edit Record: {activeMemberToEdit.name}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Member Full Name</label>
                <input
                  type="text"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.name && errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); if (touched.name) validateField("name", e.target.value); }}
                  onBlur={() => handleBlur("name")}
                />
                {touched.name && errors.name && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Email</label>
                <input
                  type="email"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.email && errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); if (touched.email) validateField("email", e.target.value); }}
                  onBlur={() => handleBlur("email")}
                />
                {touched.email && errors.email && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  maxLength={18}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.phone && errors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newPhone}
                  onChange={(e) => { setNewPhone(formatPhone(e.target.value)); if (touched.phone) validateField("phone", formatPhone(e.target.value)); }}
                  onBlur={() => handleBlur("phone")}
                />
                {touched.phone && errors.phone && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  min={12}
                  max={120}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.age && errors.age ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newAge}
                  onChange={(e) => { setNewAge(e.target.value); if (touched.age) validateField("age", e.target.value); }}
                  onBlur={() => handleBlur("age")}
                />
                {touched.age && errors.age && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.age}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                <textarea
                  rows={2}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition resize-none ${
                    touched.address && errors.address ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={newAddress}
                  onChange={(e) => { setNewAddress(e.target.value); if (touched.address) validateField("address", e.target.value); }}
                  onBlur={() => handleBlur("address")}
                />
                {touched.address && errors.address && <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.address}</p>}
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {newAvatarUrl ? (
                      <img src={newAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer">
                    Change Photo
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {newAvatarUrl && (
                    <button type="button" onClick={() => setNewAvatarUrl("")} className="text-xs text-red-500 hover:underline cursor-pointer">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Plan Option</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                >
                  <option value="Monthly Basic">Basic — ₹1,200</option>
                  <option value="Standard - 6 Months">Standard — ₹4,500</option>
                  <option value="Premium Annual">Premium Annual — ₹8,000</option>
                </select>
              </div>

              {/* <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <option value="Active">Active Subscription</option>
                  <option value="Expired">Expired / Suspended</option>
                  <option value="Expiring">Expiring (Attention)</option>
                </select>
              </div> */}

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {renewalMember && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg overflow-hidden shadow-xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-600" />
                <span>Renew Membership — {renewalMember.name}</span>
              </h3>
              <button onClick={() => setRenewalMember(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Plan Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Plan</label>
                  <select
                    value={renewalPlan.name}
                    onChange={(e) => {
                      const pkg = planOptions.find((p) => p.name === e.target.value) || planOptions[0];
                      setRenewalPlan(pkg);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {planOptions.filter((p) => p.active).map((pkg) => (
                    <option key={pkg.name} value={pkg.name}>
                      {pkg.name} — ₹{pkg.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Type</label>
                <select
                  value={renewalPaymentType}
                  onChange={(e) => setRenewalPaymentType(e.target.value as "QR" | "Cash")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="QR">QR (UPI)</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              {/* QR Code Display */}
              {renewalPaymentType === "QR" && (
                <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                  <div className="w-[120px] h-[120px] bg-white border p-2 rounded shadow-xs">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9gx_lh02_1xwiNE_5lrzO3Mfbb7htKq9WuZFtuajFSqIzFRu2F0j4wRWAvAxhP2GDjhoyU5g3_7sQA1JlN8dbwILuL46In3zCGjkPS6BkSIrlxKP5kwoQH2tn3TEOI7ezzB8fR0LNUNeRAvnZm1eyDGq97k60bVRIACQZ23okzZ8ltqXjH9ism0lAUZucJ5Rf1-2jJ-b2TxBrt5B1qEOyuZUJSV-LVOnjOkfLlLfdTJBl3guDBDeVqpPcXXxXyH6VC0UTBP3UQcLB"
                      alt="UPI QR Code"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">BHIM UPI • Paytm • PhonePe • GPay</p>
                </div>
              )}

              {/* Cash Display */}
              {renewalPaymentType === "Cash" && (
                <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Banknote className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Cash Payment</p>
                  <p className="text-xs text-slate-500">Collect at the front desk.</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Plan Price</span>
                  <span className="font-semibold">₹{renewalPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST @ 18%</span>
                  <span className="font-semibold">₹{Math.round(renewalPlan.price * 0.18).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-800 font-bold">
                  <span>Total</span>
                  <span className="text-blue-900">₹{(renewalPlan.price + Math.round(renewalPlan.price * 0.18)).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRenewalMember(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const totalWithTax = renewalPlan.price + Math.round(renewalPlan.price * 0.18);
                    onConfirmRenewal(renewalMember.id, renewalPlan.name, totalWithTax, renewalPaymentType);
                    setRenewalMember(null);
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Renew</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-sm rounded-lg overflow-hidden shadow-xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 bg-rose-50 border-b border-rose-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Delete Member</span>
              </h3>
              <button onClick={() => setDeleteConfirmMember(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-sm mb-2">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirmMember.name}</span>?
              </p>
              <p className="text-xs text-slate-500 mb-6">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmMember(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteMember(deleteConfirmMember.id);
                    setDeleteConfirmMember(null);
                  }}
                  className="px-5 py-2 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}