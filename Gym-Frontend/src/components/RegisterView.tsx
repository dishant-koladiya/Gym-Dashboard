/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Screen } from "../types";
import { Dumbbell, ShieldAlert } from "lucide-react";

interface RegisterViewProps {
  onRegister: (gymName: string, adminName: string, email: string, password?: string) => Promise<string | undefined> | void;
  onNavigate: (screen: Screen) => void;
}

export default function RegisterView({ onRegister, onNavigate }: RegisterViewProps) {
  const [gymName, setGymName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!gymName || !adminName || !email || !password || !confirmPassword) {
      setErrorMsg("All fields are strictly required");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const error = await onRegister(gymName, adminName, email, password);
      if (error) {
        setErrorMsg(error);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Account registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-2xl space-y-5">
        
        {/* Brand identity header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-blue-600 items-center justify-center rounded text-white shadow-md mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Admin Account</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">Bootstrap gym console</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded text-rose-700 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register forms */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Gym Organization Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Iron Pulse Performance Center"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Admin Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Professional Private Email</label>
            <input
              type="email"
              required
              placeholder="alex.rivera@fitadminpro.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 text-white font-extrabold text-sm rounded-lg transition active:scale-[0.98] cursor-pointer shadow-sm mt-2 ${
              isLoading ? "bg-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Configuring admin account..." : "Create Credentials & Plan Setup"}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Already registered? </span>
          <button
            onClick={() => onNavigate(Screen.LOGIN)}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
