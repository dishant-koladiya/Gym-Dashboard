/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Member, Transaction, Screen } from "../types";
import { Users, Award, DollarSign, Ban, Calendar, ChevronRight } from "lucide-react";

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  onNavigate: (screen: Screen) => void;
}

export default function DashboardView({ members, transactions, onNavigate }: DashboardProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Compute numbers dynamically based on actual state arrays
  const totalMembersCount = members.length;
  const activePlansCount = members.filter((m) => m.status === "Active").length;
  const expiredCount = members.filter((m) => m.status === "Expired").length;

  // Members expiring within the next 30 days
  const today = new Date();
  const expiringSoonMembers = members.filter((m) => {
    if (!m.expiryDate || m.status === "Expired") return false;
    const parts = m.expiryDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!parts) return false;
    const monthMap: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const expiry = new Date(parseInt(parts[3]), monthMap[parts[1]], parseInt(parts[2]));
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14;
  });
  const expiringSoonCount = expiringSoonMembers.length;

  // Let's compute MTD revenue from completed transactions
  const completedTx = transactions.filter((t) => t.status === "Completed");
  const totalRevenueMtd = completedTx.reduce((sum, tx) => sum + tx.amount, 0);

  const stats = [
    {
      title: "Total Members",
      value: totalMembersCount.toLocaleString(),
      change: "Active metrics",
      isPositive: true,
      color: "bg-blue-50 text-blue-600",
      icon: Users,
    },
    {
      title: "Active Plans",
      value: activePlansCount.toLocaleString(),
      change: "On-going plans",
      isPositive: true,
      color: "bg-emerald-50 text-emerald-600",
      icon: Award,
    },
    {
      title: "Revenue (MTD)",
      value: `₹${totalRevenueMtd.toLocaleString()}`,
      change: "Real collection",
      isPositive: true,
      color: "bg-blue-50 text-blue-600",
      icon: DollarSign,
    },
    {
      title: expiredCount > 0 ? "Expired Memberships" : "Expiring Memberships",
      value: expiredCount > 0 ? expiredCount.toString() : expiringSoonCount.toString(),
      change: expiredCount > 0
        ? `${expiringSoonCount} expiring soon`
        : `${expiringSoonCount} in last month`,
      isPositive: false,
      color: expiredCount > 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600",
      icon: Ban,
    },
  ];

  // Compute plan distribution from active members
  const activeMembers = members.filter((m) => m.status === "Active");
  const planSegments = [
    {
      label: "Premium Elite",
      color: "#2563eb",
      members: activeMembers.filter(
        (m) =>
          m.plan.toLowerCase().includes("premium") ||
          m.plan.toLowerCase().includes("annual") ||
          m.plan.toLowerCase().includes("year") ||
          m.price >= 8000
      ),
    },
    {
      label: "Standard Plus",
      color: "#ea580c",
      members: activeMembers.filter(
        (m) =>
          m.plan.toLowerCase().includes("standard") ||
          m.plan.toLowerCase().includes("6 month") ||
          (m.price >= 4500 && m.price < 8000)
      ),
    },
    {
      label: "Basic Tier",
      color: "#64748b",
      members: activeMembers.filter(
        (m) =>
          !m.plan.toLowerCase().includes("premium") &&
          !m.plan.toLowerCase().includes("annual") &&
          !m.plan.toLowerCase().includes("year") &&
          !m.plan.toLowerCase().includes("standard") &&
          !m.plan.toLowerCase().includes("6 month") &&
          m.price < 4500
      ),
    },
  ];
  const totalPlanned = planSegments.reduce((sum, s) => sum + s.members.length, 0) || 1;
  const segments = planSegments.map((s) => ({
    ...s,
    count: s.members.length,
    percent: Math.round((s.members.length / totalPlanned) * 100),
  }));
  const CIRCUMFERENCE = 314;
  let cumulativeAngle = 0;
  const svgSegments = segments.map((s) => {
    const angle = (s.percent / 100) * 360;
    const seg = {
      ...s,
      dashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * s.percent) / 100,
      rotation: cumulativeAngle,
    };
    cumulativeAngle += angle;
    return seg;
  });

  // Dynamic monthly calculation filtered by selected year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dynamicMonthlySummaries = months.map((m) => {
    const totalAmount = transactions
      .filter((tx) => tx.status === "Completed" && tx.date && tx.date.startsWith(m) && tx.date.includes(String(selectedYear)))
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { month: m, amount: totalAmount };
  });

  const maxAmount = Math.max(...dynamicMonthlySummaries.map((d) => d.amount), 0);

  // Compute dynamic Y-axis grid lines based on actual max revenue
  const gridSteps = 4;
  const gridMax = Math.ceil(maxAmount / 5000) * 5000 || 50000;
  const gridStep = Math.round(gridMax / gridSteps / 1000) * 1000 || 10000;
  const gridLines = [1, 2, 3, 4].map((i) => gridStep * i).filter((v) => v <= gridMax);

  const chartData = dynamicMonthlySummaries.map((data) => {
    const isCurrentMonth = data.month === new Date().toLocaleDateString("en-US", { month: "short" }) && selectedYear === currentYear;
    const percentHeight = maxAmount > 0 ? Math.max(12, Math.round((data.amount / maxAmount) * 90)) : 10;
    return {
      month: data.month,
      amount: `₹${data.amount.toLocaleString()}`,
      height: `${percentHeight}%`,
      active: isCurrentMonth,
    };
  });

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-slate-500 font-medium">Titan Fitness real-time operational metrics</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200 p-5 rounded-lg transition-all hover:border-blue-500 hover:shadow-sm"
              id={`dashboard-stat-${i}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  {stat.title}
                </p>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight text-center">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Block */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h4 className="font-semibold text-lg text-slate-900">Monthly Revenue Trend</h4>
              <p className="text-xs text-slate-500 font-medium">12 months performance tracker</p>
            </div>
            <div className="self-start sm:self-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent outline-none font-medium text-slate-600 cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simple Highly Polished Grid and Bar Chart Representation */}
          <div className="flex-1 min-h-[220px] flex items-end gap-3 sm:gap-4 relative pt-10 px-2 select-none overflow-x-auto">
            {/* Background Grid Lines — dynamic Y-axis labels from actual revenue */}
            {/* <div className="absolute inset-0 flex flex-col justify-between text-[11px] font-mono text-slate-400 pointer-events-none mt-1">
              {[...gridLines].reverse().map((val, i) => (
                <div key={i} className="border-t border-dashed border-slate-200 w-full pt-1">
                  ₹{val.toLocaleString()}
                </div>
              ))}`
            </div> */}

            {/* Simulated interactive bars */}
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-grow min-w-[30px] flex flex-col items-center group relative h-[180px] justify-end z-10">
                {/* Floating tooltip */}
                <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform duration-120 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm z-30">
                  {data.amount}
                </div>
                
                {/* Visual Bar */}
                <div
                  style={{ height: data.height }}
                  className={`w-full rounded-t-sm transition-all duration-300 cursor-pointer ${
                    data.active
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-200 group-hover:bg-blue-500"
                  }`}
                />
                
                {/* Label */}
                <span className={`mt-2 text-xs font-semibold ${data.active ? "text-blue-700 font-bold" : "text-slate-500"}`}>
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution donut block */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-lg text-slate-900">Plan Distribution</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Breakdown by active membership tier</p>
          </div>

          {/* Dynamic Donut chart from real member data */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <svg className="w-36 h-36 transform -rotate-90">
              {svgSegments.map((s, i) => (
                <circle
                  key={i}
                  cx="72"
                  cy="72"
                  r="50"
                  stroke={s.color}
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={s.dashoffset}
                  transform={`rotate(${s.rotation} 72 72)`}
                  className="transition-all duration-1000"
                />
              ))}
            </svg>

            {/* Interactive Centered Metric Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{activePlansCount}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active</p>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            {segments.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span>{s.label}</span>
                </div>
                <span className="font-bold text-slate-800">{s.percent}% ({s.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiring Soon Section */}
      {expiringSoonMembers.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-amber-100 bg-amber-50/40">
            <h4 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-600" />
              <span>Expiring Soon — {expiringSoonCount} member{expiringSoonCount > 1 ? "s" : ""} within 30 days</span>
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringSoonMembers.map((m) => {
                  const parts = m.expiryDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
                  const monthMap: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
                  const expiry = parts ? new Date(parseInt(parts[3]), monthMap[parts[1]], parseInt(parts[2])) : new Date();
                  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={m.id} className="hover:bg-amber-50/30 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-xs shadow-sm">
                            {m.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <p className="font-bold text-slate-800">{m.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{m.plan}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{m.expiryDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          daysLeft <= 7
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : daysLeft <= 14
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {daysLeft} day{daysLeft > 1 ? "s" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Membership Sales Dashboard Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-lg text-slate-900">Recent Membership Sales</h4>
            <p className="text-xs text-slate-500 font-medium">Real-time incoming subscriptions and payments</p>
          </div>
          <button
            onClick={() => onNavigate(Screen.PAYMENTS_FINANCE)}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Payments</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Plan Selected</th>
                <th className="px-6 py-3.5">Amount Paid</th>
                <th className="px-6 py-3.5">Transaction Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-450 font-medium font-sans">
                    No recent transaction records in the system. Create a member to log sales!
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 4).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shadow-sm">
                          {tx.memberName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tx.memberName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{tx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{tx.planName}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          tx.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                            : tx.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-250"
                            : "bg-rose-50 text-rose-700 border border-rose-250"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onNavigate(Screen.PAYMENTS_FINANCE)}
                        className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-100 transition font-medium cursor-pointer"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
