/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Member, Screen } from "../types";
import { Check, ShieldCheck, QrCode, ArrowLeft, Loader2 } from "lucide-react";
import { PACKAGES } from "../data";

interface RenewalViewProps {
  members: Member[];
  preselectedMemberId: string | null;
  onConfirmRenewal: (memberId: string, planName: string, amount: number, paymentType: "QR" | "Cash") => void;
  onNavigate: (screen: Screen) => void;
}

export default function RenewalView({
  members,
  preselectedMemberId,
  onConfirmRenewal,
  onNavigate,
}: RenewalViewProps) {
  // Pre-load 
  const defaultSelectedId = preselectedMemberId || "#TF-9042";
  const [selectedMemberId, setSelectedMemberId] = useState(defaultSelectedId);
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]); // Preselect 6 Months popular plan
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<"QR" | "Cash">("QR");

  // Active selected member detail
  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  // Tax calculations
  const subtotal = selectedPackage.price;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + tax;

  const handleConfirmRenewalSubmit = () => {
    if (!selectedMember) return;
    setIsProcessing(true);

    // Simulate standard transaction processing latency (1.5 seconds)
    setTimeout(() => {
      onConfirmRenewal(selectedMember.id, selectedPackage.name, totalAmount, paymentType);
      setIsProcessing(false);
      onNavigate(Screen.MEMBERS_DIRECTORY);
    }, 1500);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Return button */}
      <button
        onClick={() => onNavigate(Screen.MEMBERS_DIRECTORY)}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Members Directory</span>
      </button>

      {/* Main Container Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">New Membership</h2>
        <p className="text-slate-500 font-medium">Configure plan properties and process UPI code scanning</p>
      </div>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left selector panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-lg space-y-6 shadow-sm">
          {/* Section 1: Member Info Selector */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-705 border-b border-slate-100 pb-2">1. Select Target Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5Packed">Search Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="bg-slate-50 border border-slate-250 text-sm font-semibold text-slate-750 px-3 py-2.5 rounded-lg w-full focus:outline-none cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMember && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border overflow-hidden bg-slate-100 flex-shrink-0">
                    {selectedMember.avatarUrl ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedMember.avatarUrl}
                        alt="Member avatar image"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-blue-700 bg-blue-50 text-xs">
                        {selectedMember.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedMember.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        selectedMember.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                      }`} />
                      <span>{selectedMember.status} Subscription</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Renewal Plan Cards Selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-705">2. Choose Subscription Duration</h3>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                GST 18% Extra
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {PACKAGES.map((pkg, i) => {
                const isSelected = selectedPackage.name === pkg.name;
                return (
                  <div
                    key={pkg.name}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`border p-5 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40"
                        : "border-slate-200 hover:border-slate-350 bg-white"
                    }`}
                  >
                    {/* Tick icon / circle for radio */}
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1.5 flex-shrink-0 ${
                        isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-350 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-850 text-base">{pkg.name} Duration</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            pkg.term === "POPULAR"
                              ? "bg-orange-50 text-orange-700 font-bold"
                              : pkg.term === "BEST VALUE"
                              ? "bg-emerald-50 text-emerald-700 font-bold"
                              : "bg-slate-150 text-slate-600"
                          }`}>
                            {pkg.term}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1 block">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Cost section */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-extrabold text-blue-900">₹{pkg.price.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Subtotal</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right checkout scan side panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-lg space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-805 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <QrCode className="w-5 h-5 text-blue-600 animate-pulse" />
            <span>Payment</span>
          </h3>

          {/* Payment Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as "QR" | "Cash")}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="QR">QR (UPI)</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* QR Code Section (visible only when QR is selected) */}
          {paymentType === "QR" && (
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3 relative select-none">
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                  <Loader2 className="w-8 h-8 text-blue-650 animate-spin" />
                  <p className="text-xs font-bold text-blue-800">Processing Payment Securely...</p>
                </div>
              )}

              <div className="w-[140px] h-[140px] bg-white border p-2 rounded shadow-xs relative object-cover">
                {/* Hotlinked authentic QR Code image from wireframes */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9gx_lh02_1xwiNE_5lrzO3Mfbb7htKq9WuZFtuajFSqIzFRu2F0j4wRWAvAxhP2GDjhoyU5g3_7sQA1JlN8dbwILuL46In3zCGjkPS6BkSIrlxKP5kwoQH2tn3TEOI7ezzB8fR0LNUNeRAvnZm1eyDGq97k60bVRIACQZ23okzZ8ltqXjH9ism0lAUZucJ5Rf1-2jJ-b2TxBrt5B1qEOyuZUJSV-LVOnjOkfLlLfdTJBl3guDBDeVqpPcXXxXyH6VC0UTBP3UQcLB"
                  alt="Payment QR Code Scanner Vector"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Merchant: Titan Fitness</span>
                <p className="text-xs font-semibold text-slate-600 block mt-0.5">BHIM UPI • Paytm • PhonePe • GPay</p>
              </div>
            </div>
          )}

          {/* Cash section (visible when Cash is selected) */}
          {paymentType === "Cash" && (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-lg border border-slate-100 space-y-2 select-none">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💵</span>
              </div>
              <p className="text-sm font-bold text-slate-700">Cash Payment</p>
              <p className="text-xs text-slate-500 text-center">Collect ₹{totalAmount.toLocaleString()} at the front desk.</p>
            </div>
          )}

          {/* Pricing Ledger Breakdown */}
          <div className="space-y-3 py-1 text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Plan Subtotal Duration</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-600">
              <span>Govt. Tax (GST @ 18%)</span>
              <span className="font-semibold text-slate-800">₹{tax.toLocaleString()}</span>
            </div>

            {/* Total */}
            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-slate-800">
              <span className="font-bold">Total Amount Due</span>
              <span className="font-black text-xl text-blue-900">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={handleConfirmRenewalSubmit}
              disabled={isProcessing}
              className="w-full py-3.5 bg-blue-600 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Confirm Invoice Payment</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium mt-3 leading-tight block">
              Processing instantly locks the transaction and updates subscriber membership properties in state database files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
