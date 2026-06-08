/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Screen } from "../types";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  Award,
  AlertCircle,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onOpenNewMemberModal: () => void;
  gymName: string;
}

export default function Sidebar({ currentScreen, onNavigate, onOpenNewMemberModal, gymName }: SidebarProps) {
  const menuItems = [
    {
      id: Screen.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: Screen.MEMBERS_DIRECTORY,
      label: "Members",
      icon: Users,
    },
    {
      id: Screen.PAYMENTS_FINANCE,
      label: "Payments",
      icon: CreditCard,
    },
    {
      id: Screen.MEMBERSHIP_RENEWAL,
      label: "Memberships",
      icon: Award,
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: AlertCircle,
      disabled: true,
    },
    {
      id: Screen.SETTINGS,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] flex flex-col py-6 bg-slate-50 border-r border-slate-200 z-40">
      {/* Brand Identity / Logo Header */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded shadow-sm text-white">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-xl tracking-tight text-blue-900">{gymName || "Titan Fitness"}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Add New Member Button */}
      <div className="px-4 mb-6">
        {/* <button
          onClick={onOpenNewMemberModal}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Member</span>
        </button> */}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.label}
              disabled={isDisabled}
              onClick={() => onNavigate(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left font-medium ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : isActive
                  ? "bg-blue-100/60 border-l-4 border-blue-600 text-blue-700 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="text-sm">{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  MOCK
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-4 mt-auto pt-4 border-t border-slate-200">
        <button
          onClick={() => onNavigate(Screen.LOGIN)}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 transition rounded-lg text-left font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
