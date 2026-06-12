/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Screen } from "../types";
import { Dumbbell, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";

interface ForgotPasswordViewProps {
  onNavigate: (screen: Screen) => void;
}

export default function ForgotPasswordView({ onNavigate }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please key in a valid email address.");
      return;
    }
    setError("");
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-blue-600 items-center justify-center rounded text-white shadow-md mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recover Credentials</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">Titan Fitness security</p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <MailCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Reset Vector Dispatched</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                We have transmitted an interactive recovery link to <span className="font-semibold text-slate-705">{email}</span>. Please verify your inbox and spam filters to restore your administrative session.
              </p>
            </div>
            <button
              onClick={() => onNavigate(Screen.LOGIN)}
              className="w-full py-3.5 bg-blue-600 text-white font-extrabold text-sm rounded-lg hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer shadow-sm"
            >
              Back to Login Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed text-center">
              Provide your professional administrator email below. We will transmit a secure recovery cryptographic link to reset your workspace password immediately.
            </p>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Professional Private Email</label>
              <input
                type="email"
                required
                placeholder="arivera_admin@fitadminpro.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white font-extrabold text-sm rounded-lg hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer shadow-sm"
            >
              Transmit Password Reset Vector
            </button>

            <button
              type="button"
              onClick={() => onNavigate(Screen.LOGIN)}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition py-1 cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Cancel & Back to Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
