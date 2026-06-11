/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Screen } from "../types";
import { Dumbbell, ShieldAlert, Eye, EyeOff } from "lucide-react";

interface LoginViewProps {
  onLogin: (email: string, password?: string) => Promise<string | undefined> | void;
  onNavigate: (screen: Screen) => void;
}

export default function LoginView({ onLogin, onNavigate }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all requested fields");
      return;
    }
    
    setErrorMsg("");
    setIsLoading(true);
    try {
      const error = await onLogin(email, password);
      if (error) {
        setErrorMsg(error);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Credential verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Logo and Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-blue-600 items-center justify-center rounded text-white shadow-md mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-850 tracking-tight">Welcome Back</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">Titan Fitness Admin Console</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded text-rose-700 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Administrative Email</label>
            <input
              type="email"
              required
              placeholder="admin@titanfitness.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Secret Password</label>
              <button
                type="button"
                onClick={() => onNavigate(Screen.FORGOT_PASSWORD)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 text-white font-extrabold text-sm rounded-lg transition active:scale-[0.98] cursor-pointer shadow-sm ${
              isLoading ? "bg-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Authenticating console..." : "Access Admin System"}
          </button>
        </form>

        {/* Create account bottom link */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Don't have an admin profile? </span>
          <button
            onClick={() => onNavigate(Screen.REGISTER)}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
