/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Transaction, Member } from "../types";
import { Download, CreditCard, Banknote, Landmark, QrCode, History, DollarSign, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";

interface PaymentsViewProps {
  transactions: Transaction[];
  members?: Member[];
}

export default function PaymentsView({ transactions: propTransactions, members = [] }: PaymentsViewProps) {
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [sortFilter, setSortFilter] = useState("Latest First");
  const [loyaltyMember, setLoyaltyMember] = useState<string | null>(null);
  const loyaltyRef = useRef<HTMLDivElement>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paymentPage, setPaymentPage] = useState(1);
  const [apiData, setApiData] = useState<Transaction[] | null>(null);
  const [apiTotal, setApiTotal] = useState(0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loyaltyRef.current && !loyaltyRef.current.contains(e.target as Node)) {
        setLoyaltyMember(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => removeEventListener("mousedown", handleClickOutside);
  }, []);

  const backendUrl = (() => {
    try {
      const s = localStorage.getItem("tf_settings");
      if (s) {
        const parsed = JSON.parse(s);
        return parsed.backendUrl?.trim() || "";
      }
    } catch {}
    return "";
  })();

  const backendToken = (() => {
    try {
      const s = localStorage.getItem("tf_settings");
      if (s) {
        const parsed = JSON.parse(s);
        return parsed.backendToken?.trim() || "";
      }
    } catch {}
    return "";
  })();

  useEffect(() => {
    if (!backendUrl || !backendToken) {
      setApiData(null);
      return;
    }

    const sortParam = sortFilter === "Oldest First" ? "oldest" : sortFilter === "Highest Amount" ? "amount" : "latest";
    const methodParam = methodFilter === "All Methods" ? "" : methodFilter;

    const params = new URLSearchParams({
      page: String(paymentPage),
      limit: String(itemsPerPage),
      sort: sortParam,
      method: methodParam,
    });

    const url = `${backendUrl.replace(/\/$/, "")}/api/payments?${params}`;

    console.log("[Payments Payload]", {
      url,
      page: paymentPage,
      limit: itemsPerPage,
      sort: sortParam,
      method: methodParam,
    });

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : json?.data || [];
        const total = json?.pagination?.totalItems ?? list.length;
        setApiData(list);
        setApiTotal(total);
      })
      .catch(() => {
        setApiData(null);
      });
  }, [paymentPage, itemsPerPage, methodFilter, sortFilter, backendUrl, backendToken]);

  const [isLoading, setIsLoading] = useState(false);
  let displayTx: Transaction[] = [];
  let totalItems: number = 0;
  let totalPaymentPages: number = 1;

  // Determine source of data: API data takes precedence when available and not loading
  if (apiData && Array.isArray(apiData) && apiData.length > 0 && !isLoading) {
    displayTx = apiData;
    totalItems = apiTotal;
    totalPaymentPages = Math.ceil(totalItems / itemsPerPage) || 1;
  } else {
    const filteredTx = propTransactions.filter((tx) => {
      if (methodFilter === "All Methods") return true;
      if (methodFilter === "Credit Card") return tx.paymentMethod === "Visa" || tx.paymentMethod === "Mastercard";
      if (methodFilter === "Cash") return tx.paymentMethod === "Cash";
      if (methodFilter === "Bank Transfer") return tx.paymentMethod === "Bank Transfer";
      if (methodFilter === "UPI") return tx.paymentMethod === "UPI";
      return true;
    });
    const sortedTx = [...filteredTx].sort((a, b) => {
      if (sortFilter === "Highest Amount") return b.amount - a.amount;
      if (sortFilter === "Oldest First") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    totalItems = sortedTx.length;
    totalPaymentPages = Math.ceil(totalItems / itemsPerPage) || 1;
    displayTx = sortedTx.slice((paymentPage - 1) * itemsPerPage, paymentPage * itemsPerPage);
  }

  // Export all transactions to CSV
  const handleExportCSV = () => {
    const allTx = apiData ? propTransactions : displayTx;
    const totalRev = allTx
      .filter((tx) => tx.status === "Completed")
      .reduce((acc, cur) => acc + cur.amount, 0);

    const headers = ["Member Name", "Plan", "Status", "Payment Method", "Date", "Amount"];
    const rows = allTx.map((tx) => [
      tx.memberName,
      tx.planName,
      tx.status,
      tx.paymentMethod,
      tx.date,
      tx.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
      "",
      `Total Revenue (Completed),${totalRev}`,
      `Total Transactions,${allTx.length}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const memberTxHistory = loyaltyMember
    ? propTransactions.filter((tx) => tx.memberName === loyaltyMember)
    : [];

  const totalPaid = memberTxHistory
    .filter((tx) => tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const selectedMember = loyaltyMember
    ? members.find((m) => m.name === loyaltyMember)
    : null;

  return (
    <div className="animate-fade-in space-y-3">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Finance Overview</h2>
          <p className="text-slate-500 font-medium">
            Manage your gym's financial health, track transactions, and monitor outstanding member dues
          </p>
        </div>
        

      </div>

      {/* Recent Transactions List Section */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
          <h3 className="font-semibold text-lg text-slate-900">Recent Transactions</h3>
          
          {/* Internal Filters dropdowns */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <select
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option>All Methods</option>
              {/* <option>Credit Card</option> */}
              <option>Cash</option>
              {/* <option>Bank Transfer</option> */}
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

            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPaymentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={30}>30 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
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
              {displayTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium font-sans">
                    No transactions match your current filters. Record new membership payments to track here!
                  </td>
                </tr>
              ) : (
                displayTx.map((tx) => {
                  let MethodIcon = CreditCard;
                  if (tx.paymentMethod === "Cash") MethodIcon = Banknote;
                  if (tx.paymentMethod === "Bank Transfer") MethodIcon = Landmark;
                  if (tx.paymentMethod === "UPI") MethodIcon = QrCode;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition duration-150 group">
                      <td className="px-6 py-4 relative">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-700 text-xs border border-slate-300">
                            {tx.memberName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p
                              className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition"
                              onClick={() => setLoyaltyMember(loyaltyMember === tx.memberName ? null : tx.memberName)}
                            >
                              {tx.memberName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">{tx.planName}</p>
                          </div>
                        </div>

                        {loyaltyMember === tx.memberName && (
                          <div
                            ref={loyaltyRef}
                            className="absolute left-6 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-40 p-4 animate-scale-in"
                          >
                            {selectedMember && (
                              <div className="mb-3 pb-3 border-b border-slate-100 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                                  <span className="font-bold text-sm text-slate-800">{tx.memberName}</span>
                                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    selectedMember.status === "Active"
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : selectedMember.status === "Expiring"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}>
                                    {selectedMember.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{selectedMember.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone className="w-3 h-3" />
                                  <span>{selectedMember.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Expires: {selectedMember.expiryDate}</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-600">
                                  Plan: {selectedMember.plan} — ₹{selectedMember.price.toLocaleString()}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <History className="w-4 h-4 text-blue-600" />
                              <span className="font-bold text-xs text-slate-800">Transaction History</span>
                            </div>
                            {memberTxHistory.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-2">No transactions found</p>
                            ) : (
                              <div className="space-y-2 max-h-36 overflow-y-auto">
                                {memberTxHistory.map((h) => (
                                  <div key={h.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-3 h-3 text-slate-400" />
                                      <span className="text-slate-600">{h.date}</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">₹{h.amount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-500">Total Paid</span>
                              <span className="text-blue-700">₹{totalPaid.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            tx.status === "Completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : tx.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
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
                          {/* <MoreVertical className="w-4 h-4" /> */}
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
        <div className="px-6 py-4 bg-slate-50 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 flex-shrink-0">
          <span>Showing {displayTx.length} of {totalItems} transactions history</span>
          <div className="flex gap-2">
            <button
              disabled={paymentPage <= 1}
              onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${
                paymentPage <= 1 ? "bg-white border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPaymentPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaymentPage(i + 1)}
                className={`px-4 py-2 rounded font-bold transition cursor-pointer ${
                  paymentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={paymentPage >= totalPaymentPages}
              onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}
              className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${
                paymentPage >= totalPaymentPages ? "bg-white border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
