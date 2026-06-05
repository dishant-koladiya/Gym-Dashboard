/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Member, Screen } from "../types";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  X,
  CreditCard,
  UserCheck,
  UserPlus
} from "lucide-react";

interface MembersViewProps {
  members: Member[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onRenewMember: (id: string) => void;
}

export default function MembersView({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onRenewMember,
}: MembersViewProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Input modal forms state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMemberToEdit, setActiveMemberToEdit] = useState<Member | null>(null);

  // New member form temp local state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlan, setNewPlan] = useState("Monthly Basic");
  const [newStatus, setNewStatus] = useState<"Active" | "Expired" | "Expiring">("Active");

  // Filter computation
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesPlan = planFilter === "All" || m.plan.toLowerCase().includes(planFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate quick stats on current grid
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "Active").length;
  const expiringCount = members.filter((m) => m.status === "Expiring").length;
  const expiredCount = members.filter((m) => m.status === "Expired").length;

  const monthlyRevenue = members.filter((m) => m.status === "Active").reduce((sum, m) => {
    let rate = m.price;
    if (m.plan.toLowerCase().includes("6 month")) {
      rate = m.price / 6;
    } else if (m.plan.toLowerCase().includes("annual") || m.plan.toLowerCase().includes("year") || m.plan.toLowerCase().includes("12 month")) {
      rate = m.price / 12;
    }
    return sum + (rate || 0);
  }, 0);

  const handleOpenAddModal = () => {
    // Reset form fields
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewPlan("Monthly Basic");
    setNewStatus("Active");
    setIsAddModalOpen(true);
  };

  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    // Default dates based on packaging
    const today = new Date();
    const joinDateStr = today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    // Add 1 month or 6 months based on package
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
      phone: newPhone || "+91 99999 88888",
      joinDate: joinDateStr,
      expiryDate: expiryDateStr,
      plan: newPlan,
      price: newPlan.includes("Annual") ? 8000 : newPlan.includes("6 Months") ? 4500 : 1200,
      status: newStatus,
      lastActive: joinDateStr,
      homeBranch: "Downtown Central",
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (member: Member) => {
    setActiveMemberToEdit(member);
    setNewName(member.name);
    setNewEmail(member.email);
    setNewPhone(member.phone);
    setNewPlan(member.plan);
    setNewStatus(member.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMemberToEdit) return;

    onEditMember({
      ...activeMemberToEdit,
      name: newName,
      email: newEmail,
      phone: newPhone,
      plan: newPlan,
      status: newStatus,
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
        
        {/* Action button - Opens Modal */}
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Quick Summary Section inside directory context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live DB
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Active Plans</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">{activeCount}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 p-1.5 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Expiring Soon</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">{expiringCount}</h3>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 font-bold rounded-full">
              Attention
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Monthly Revenue Rate</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">₹{Math.round(monthlyRevenue).toLocaleString()}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 p-1.5 rounded-full">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
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
            <option value="Premium">Premium Plans</option>
            <option value="Standard">Standard Plans</option>
            <option value="Basic">Basic Plans</option>
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
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-50 shadow-xs flex-shrink-0">
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
                        <div>
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 leading-none mt-0.5">
                            <span className="font-semibold text-slate-600">{member.id}</span>
                            <span>•</span>
                            <span>{member.email}</span>
                          </p>
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
                          onClick={() => onRenewMember(member.id)}
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
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
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
            Showing <span className="font-bold text-slate-800">{filteredMembers.length}</span> of{" "}
            <span className="font-bold text-slate-800">{members.length}</span> members records
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded font-semibold cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded font-bold">1</button>
            <button className="px-3 py-1 bg-white border border-slate-250 text-slate-600 rounded font-semibold hover:bg-slate-50 transition cursor-pointer">2</button>
            <button className="px-3 py-1 bg-white border border-slate-250 text-slate-600 rounded font-semibold hover:bg-slate-50 transition cursor-pointer">Next</button>
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
                <span>Add Record: New Member</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMemberSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Member Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Email</label>
                <input
                  required
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Plan Option</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                >
                  <option value="Monthly Basic">Monthly Basic — ₹1,200</option>
                  <option value="Standard - 6 Months">Standard - 6 Months — ₹4,500</option>
                  <option value="Premium Annual">Premium Annual — ₹8,000</option>
                </select>
              </div>

              <div className="space-y-1.5">
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
            
            <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Member Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Plan Option</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                >
                  <option value="Monthly Basic">Monthly Basic — ₹1,200</option>
                  <option value="Standard - 6 Months">Standard - 6 Months — ₹4,500</option>
                  <option value="Premium Annual">Premium Annual — ₹8,000</option>
                </select>
              </div>

              <div className="space-y-1.5">
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
              </div>

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
    </div>
  );
}
