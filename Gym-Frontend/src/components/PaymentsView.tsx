/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Transaction } from "../types";
import { DollarSign, ShieldAlert, TrendingUp, Download, MoreVertical, CreditCard, Banknote, Landmark, QrCode } from "lucide-react";

interface PaymentsViewProps {
  transactions: Transaction[];
  onAddTransaction?: (transaction: any) => void;
}

export default function PaymentsView({ transactions }: PaymentsViewProps) {
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [sortFilter, setSortFilter] = useState("Latest First");

  // Filter computation
  const filteredTx = transactions.filter((tx) => {
    if (methodFilter === "All Methods") return true;
    if (methodFilter === "Credit Card") return tx.paymentMethod === "Visa" || tx.paymentMethod === "Mastercard";
    if (methodFilter === "Cash") return tx.paymentMethod === "Cash";
    if (methodFilter === "Bank Transfer") return tx.paymentMethod === "Bank Transfer";
    if (methodFilter === "UPI") return tx.paymentMethod === "UPI";
    return true;
  });

  // Sort computation
  const sortedTx = [...filteredTx].sort((a, b) => {
    if (sortFilter === "Highest Amount") {
      return b.amount - a.amount;
    }
    if (sortFilter === "Oldest First") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    // Default: "Latest First"
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Live dynamic stats computation
  const totalRevenue = transactions
    .filter((tx) => tx.status === "Completed")
    .reduce((acc, current) => acc + current.amount, 0);

  const pendingDues = transactions
    .filter((tx) => tx.status === "Pending")
    .reduce((acc, current) => acc + current.amount, 0);

  const pendingCount = transactions.filter((tx) => tx.status === "Pending").length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Finance Overview</h2>
          <p className="text-slate-500 font-medium">
            Manage your gym's financial health, track transactions, and monitor outstanding member dues
          </p>
        </div>
        
        <button
          onClick={() => {
            alert("Generating full audit invoice logs spreadsheet...\nSaved to secure download storage.");
          }}
          className="bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-350 transition cursor-pointer"
        >
          <Download className="w-4.5 h-4.5 text-slate-500" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Finance Bento Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Total Revenue MTD */}
        <div className="md:col-span-4 bg-white p-6 border border-slate-200 rounded-lg flex flex-col justify-between h-44 hover:border-blue-500 transition Group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12.4%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Revenue (MTD)</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Pending Card */}
        <div className="md:col-span-4 bg-white p-6 border border-slate-200 rounded-lg flex flex-col justify-between h-44 hover:border-red-500 transition Group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              {pendingCount} Members
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Pending Dues</p>
            <h3 className="text-2xl font-bold text-rose-600">₹{pendingDues.toLocaleString()}</h3>
          </div>
        </div>

        {/* Projected Annual block */}
        <div className="md:col-span-4 bg-blue-600 p-6 rounded-lg flex flex-col justify-between h-44 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Projected Annual</p>
            <h3 className="text-2xl font-bold text-white">₹{(totalRevenue * 12).toLocaleString()}</h3>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-blue-100 font-medium">
            <div className="flex -space-x-1.5 font-mono">
              <div className="w-6 h-6 rounded-full border border-blue-400 bg-blue-500 flex items-center justify-center text-[9px] font-bold">JD</div>
              <div className="w-6 h-6 rounded-full border border-blue-400 bg-blue-400 flex items-center justify-center text-[9px] font-bold">SC</div>
              <div className="w-6 h-6 rounded-full border border-blue-400 bg-blue-700 flex items-center justify-center text-[9px] font-bold">+8</div>
            </div>
            <span>New high-tier memberships today</span>
          </div>

          <div className="absolute -bottom-6 -right-6 opacity-10 transform rotate-12">
            <TrendingUp className="w-32 h-32 text-white" />
          </div>
        </div>
      </div>

      {/* Recent Transactions List Section */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-semibold text-lg text-slate-900">Recent Transactions</h3>
          
          {/* Internal Filters dropdowns */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option>All Methods</option>
              <option>Credit Card</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>UPI</option>
            </select>

            <select
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option>Latest First</option>
              <option>Oldest First</option>
              <option>Highest Amount</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">Invoice Status</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Transaction Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium font-sans">
                    No transactions match your current filters. Record new membership payments to track here!
                  </td>
                </tr>
              ) : (
                sortedTx.map((tx) => {
                  let MethodIcon = CreditCard;
                  if (tx.paymentMethod === "Cash") MethodIcon = Banknote;
                  if (tx.paymentMethod === "Bank Transfer") MethodIcon = Landmark;
                  if (tx.paymentMethod === "UPI") MethodIcon = QrCode;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition duration-150 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-700 text-xs border border-slate-250">
                            {tx.memberName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-850">{tx.memberName}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{tx.planName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.2 px-3 py-1 rounded-full text-xs font-bold border ${
                            tx.status === "Completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : tx.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-250"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "Completed" ? "bg-emerald-500" : tx.status === "Pending" ? "bg-amber-500" : "bg-red-500"
                          }`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <MethodIcon className="w-4 h-4 text-slate-400" />
                          <span>{tx.paymentMethod}</span>
                          <span className="text-[11px] text-slate-400 font-mono italic">{tx.methodDetail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{tx.date}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            alert(`Audit log for invoice index ${tx.id}:\nSubscriber: ${tx.memberName}\nSum: ₹${tx.amount.toLocaleString()}\nDate: ${tx.date}\nStatus: ${tx.status}`);
                          }}
                          className="p-1 hover:bg-slate-100 transition rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info logs */}
        <div className="px-6 py-4 bg-slate-50 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
          <span>Showing 1-{sortedTx.length} of {transactions.length} transactions history</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded font-semibold cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-4 py-2 bg-white border border-slate-250 text-slate-600 rounded font-bold hover:bg-slate-50 transition cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
