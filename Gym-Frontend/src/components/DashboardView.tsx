/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Transaction, Screen } from "../types";
import { Users, Award, DollarSign, Ban, TrendingUp, Calendar, ChevronRight } from "lucide-react";

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  onNavigate: (screen: Screen) => void;
  onRenewMember: (memberId: string) => void;
}

export default function DashboardView({ members, transactions, onNavigate, onRenewMember }: DashboardProps) {
  // Compute numbers dynamically based on actual state arrays
  const totalMembersCount = members.length;
  const activePlansCount = members.filter((m) => m.status === "Active").length;
  const expiredCount = members.filter((m) => m.status === "Expired").length;

  // Let's compute MTD revenue from completed transactions
  const completedTx = transactions.filter((t) => t.status === "Completed");
  const totalRevenueMtd = completedTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Growth percentages placeholders to look authentic to wireframes
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
      title: "Expired Memberships",
      value: expiredCount.toString(),
      change: "Requires action",
      isPositive: false,
      color: "bg-rose-50 text-rose-600",
      icon: Ban,
    },
  ];

  // Dynamic monthly calculation
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const dynamicMonthlySummaries = months.map((m) => {
    const totalAmount = transactions
      .filter((tx) => tx.status === "Completed" && tx.date && tx.date.startsWith(m))
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { month: m, amount: totalAmount };
  });

  const maxAmount = Math.max(...dynamicMonthlySummaries.map((d) => d.amount), 0);

  const chartData = dynamicMonthlySummaries.map((data) => {
    const isCurrentMonth = data.month === new Date().toLocaleDateString("en-US", { month: "short" });
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
              className="bg-white border border-slate-200 p-6 rounded-lg transition-all hover:border-blue-500 hover:shadow-sm"
              id={`dashboard-stat-${i}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    stat.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Block */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-semibold text-lg text-slate-900">Monthly Revenue Trend</h4>
              <p className="text-xs text-slate-500 font-medium">Last 6 months performance tracker</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Year 2026</span>
            </div>
          </div>

          {/* Simple Highly Polished Grid and Bar Chart Representation */}
          <div className="flex-1 min-h-[220px] flex items-end gap-4 relative pt-10 px-2 select-none">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-[11px] font-mono text-slate-400 pointer-events-none mt-1">
              <div className="border-t border-dashed border-slate-100 w-full pt-1">₹60,000</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">₹45,000</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">₹30,000</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">₹15,000</div>
              <div className="w-full h-0 border-t border-slate-300"></div>
            </div>

            {/* Simulated interactive bars */}
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-grow flex flex-col items-center group relative h-[180px] justify-end z-10">
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

          {/* Decorative Donut chart simulation using purely SVG */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Premium Elite - 58% (Circumference 314) */}
              <circle
                cx="72"
                cy="72"
                r="50"
                stroke="#2563eb"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * 58) / 100}
                className="transition-all duration-1000"
              />
              {/* Standard Plus - 32% (starts at strokeOffset of Premium Elite) */}
              <circle
                cx="72"
                cy="72"
                r="50"
                stroke="#ea580c"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * 32) / 100}
                transform="rotate(208.8 72 72)" /* 58% of 360 deg = 208.8 deg */
                className="transition-all duration-1000"
              />
              {/* Basic Tier - 10% */}
              <circle
                cx="72"
                cy="72"
                r="50"
                stroke="#64748b"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * 10) / 100}
                transform="rotate(324 72 72)" /* 58+32 = 90% of 360 deg = 324 deg */
                className="transition-all duration-1000"
              />
            </svg>

            {/* Interactive Centered Metric Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{activePlansCount}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active</p>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                <span>Premium Elite</span>
              </div>
              <span className="font-bold text-slate-800">58%</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
                <span>Standard Plus</span>
              </div>
              <span className="font-bold text-slate-800">32%</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
                <span>Basic Tier</span>
              </div>
              <span className="font-bold text-slate-800">10%</span>
            </div>
          </div>
        </div>
      </div>

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
