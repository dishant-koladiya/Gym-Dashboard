/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AdminAccount, GymInfo, SystemSettings, Screen } from "../types";
import { Save, Settings2, Key, Home, Camera } from "lucide-react";

interface SettingsViewProps {
  admin: AdminAccount;
  gym: GymInfo;
  settings: SystemSettings;
  onSave: (updated: { admin: AdminAccount; gym: GymInfo; settings: SystemSettings }) => void;
  onNavigate: (screen: Screen) => void;
}

export default function SettingsView({ admin, gym, settings, onSave, onNavigate }: SettingsViewProps) {
  // Account settings state
  const [fullName, setFullName] = useState(admin.fullName);
  const [username, setUsername] = useState(admin.username);
  const [email, setEmail] = useState(admin.email);
  const [role] = useState(admin.role);

  // Gym info settings state
  const [gymName, setGymName] = useState(gym.name);
  const [gymAddress, setGymAddress] = useState(gym.address);
  const [gymPhone, setGymPhone] = useState(gym.phone);
  const [gymWebsite, setGymWebsite] = useState(gym.website);

  // System settings state
  const [emailUpdates, setEmailUpdates] = useState(settings.emailUpdates);
  const [desktopAlerts, setDesktopAlerts] = useState(settings.desktopAlerts);

  // Admin avatar state
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(admin.avatarUrl);

  const handleAdminAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAdminAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Password panel state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      admin: {
        ...admin,
        fullName,
        username,
        email,
        avatarUrl: adminAvatarUrl,
      },
      gym: {
        name: gymName,
        address: gymAddress,
        phone: gymPhone,
        website: gymWebsite,
      },
      settings: {
        ...settings,
        theme: "Light",
        emailUpdates,
        desktopAlerts,
      },
    });

    // Reset password fields on success
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDiscard = () => {
    if (confirm("Discard all unsaved changes and reload system defaults?")) {
      setFullName(admin.fullName);
      setUsername(admin.username);
      setEmail(admin.email);
      setAdminAvatarUrl(admin.avatarUrl);
      setGymName(gym.name);
      setGymAddress(gym.address);
      setGymPhone(gym.phone);
      setGymWebsite(gym.website);
      setEmailUpdates(settings.emailUpdates);
      setDesktopAlerts(settings.desktopAlerts);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-8 max-w-4xl pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-slate-500 font-medium">Configure corporate administrative rules and customized notifications</p>
        </div>

        {/* Global Save Trigger */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Discard
          </button>
          
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Grid panels */}
      <div className="space-y-6">
        
        {/* Module 1: Admin Account Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-805 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <span>Admin Credentials</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-4">
            <div className="relative group">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-blue-600 transition flex items-center justify-center bg-slate-50">
                <img
                  referrerPolicy="no-referrer"
                  src={adminAvatarUrl}
                  alt="Admin Avatar settings"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 shadow-sm cursor-pointer" title="Change Photo">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAdminAvatarUpload} />
              </label>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 text-base">{fullName}</h4>
              <p className="text-xs text-slate-500 font-medium">Profile role assigned: <span className="font-bold text-blue-600">{role}</span></p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">UUID: #TF-ADM-0042</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Private Email</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Security Role Access</label>
              <input
                type="text"
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-150 rounded text-sm text-slate-500 font-semibold cursor-not-allowed uppercase"
                value={role}
              />
            </div>
          </div>

          {/* Password Reset subset layout */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <Key className="w-3.5 h-3.5" />
              <span>Modify Password Panel</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="Current Secure Password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="New Secure Password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Gym Information settings block */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-805 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Gym Information Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Corporate Gym Name</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Address Line</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Telephone Line</label>
              <input
                type="tel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Public Domain Website</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                value={gymWebsite}
                onChange={(e) => setGymWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>



        {/* Module 3: Notification Alert Settings */}
        {/* <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-805 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-600" />
            <span>Notification Preferences</span>
          </h3>

          <label className="flex items-center gap-3.5 cursor-pointer text-sm font-semibold text-slate-700 group">
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600 focus:outline-none cursor-pointer"
            />
            <span>Email daily transactions summaries automatically</span>
          </label>

          <label className="flex items-center gap-3.5 cursor-pointer text-sm font-semibold text-slate-700 group">
            <input
              type="checkbox"
              checked={desktopAlerts}
              onChange={(e) => setDesktopAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600 focus:outline-none cursor-pointer"
            />
            <span>Enable desktop popup warnings for expiring subscriptions</span>
          </label>
        </div> */}

      </div>

    </form>
  );
}
