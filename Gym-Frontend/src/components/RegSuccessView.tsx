/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Screen } from "../types";
import { Dumbbell, Sparkles, QrCode, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface RegSuccessViewProps {
  gymName: string;
  adminName: string;
  onActivate: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function RegSuccessView({ gymName, adminName, onActivate, onNavigate }: RegSuccessViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleCheckoutConfirm = () => {
    setIsProcessing(true);
    // Latency simulation (1.2 seconds) to feel fully real:
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        onActivate();
        onNavigate(Screen.DASHBOARD);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Banner Decorative Tag */}
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-1.5 rounded-bl-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm select-none">
          <Sparkles className="w-3 h-3 animate-spin" />
          <span>Created Successfully</span>
        </div>

        {/* Header Block */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex w-12 h-12 bg-blue-600 items-center justify-center rounded text-white shadow-md mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{gymName || "Titan Fitness"} Active</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">Console Plan Activation</p>
        </div>

        {isDone ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Verification Approved!</h3>
              <p className="text-xs text-slate-500 mt-1">Directing to Dashboard administration console...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Status overview text */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex flex-col items-center justify-center space-y-3 relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center space-y-2 z-10 transition">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs font-bold text-blue-800">Verifying secure receipt summary...</p>
                </div>
              )}

              {/* Centered QR code hotlinked vector matching screenshots */}
              <div className="w-[150px] h-[150px] bg-white border border-slate-200 p-2.5 rounded shadow-sm relative">
                <img
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuOalbEkqmQue_tVLeIYkIv-TCIMSXhcROCgC-G81OmJw7BrG6SWL5xDCmCi6eQbRJU4eHMsar2PLR5VF2DzkBbyIepSHIP1xmFmnUuhs6f4QCFNqz0cnlxoyxtobFxXtvz5inNtqEW1rkH9sufFOlNxGEJx1gwNUPrN5HVtxvIFPD6rdb6pU7bMjJHp1QUHOXaJ6VGzwTHPaWg2t3twR5qkkd5zl3MJEC2ejdVVa3eQ7ZEu3DLfXTJG2Sw"
                  alt="Registration Payment UPI QR code image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider uppercase">Scan with BHIM UPI, GPay, Paytm or PhonePe</p>
                <div className="h-0.5" />
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 justify-center leading-none">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Titan Fitness Premium Setup</span>
                </span>
              </div>
            </div>

            {/* Properties summary ledger */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <p className="font-bold text-slate-400 uppercase tracking-widest">Active Setup Ledger</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase">
                  Pending Scan Check
                </span>
              </div>

              <div className="flex justify-between items-center font-semibold">
                <span>Selected Admin Plan:</span>
                <span className="text-slate-800 font-bold">Standard - 6 Months</span>
              </div>

              <div className="flex justify-between items-center font-semibold">
                <span>Account Register Name:</span>
                <span className="text-slate-800 font-bold">{adminName || "Alex Johnston"}</span>
              </div>

              <div className="flex justify-between items-center font-semibold">
                <span>Payment Core Method:</span>
                <span className="text-slate-800 font-bold flex items-center gap-1">Fast UPI QR Setup</span>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Setup Cost:</span>
                <span className="text-lg font-black text-blue-900">₹4,500</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckoutConfirm}
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 text-white font-extrabold text-sm rounded-lg hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Confirm Invoice Payment</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => {
                  onActivate();
                  onNavigate(Screen.DASHBOARD);
                }}
                disabled={isProcessing}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Skip / Activate Later
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 font-medium leading-normal block">
              Confirming registration processes the first transaction into the history logs dashboard automatically.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
