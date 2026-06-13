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
  Settings,
} from "lucide-react";

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  gymName: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  currentScreen,
  onNavigate,
  gymName,
  collapsed,
  onToggle,
}: SidebarProps) {
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
      id: Screen.SUBSCRIPTION_PLANS,
      label: "Plans",
      icon: Award,
    },
    {
      id: Screen.SETTINGS,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-50 border-r border-slate-200 z-40 transition-all duration-300 ${
        collapsed ? "w-[80px]" : "w-[280px]"
      }`}
    >
      {/* Brand Identity / Logo Header */}
      <div className={`${collapsed ? "px-0 flex justify-center" : "px-6"} mb-8`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded shadow-sm text-white flex-shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-semibold text-xl tracking-tight text-blue-900 truncate">{gymName || "Titan Fitness"}</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Admin Console</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-3 transition-all text-left font-medium rounded-lg ${
                isActive
                  ? "bg-blue-100/60 text-blue-700 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Version Footer */}
      <div className={`border-t border-slate-300 ${collapsed ? "px-0 py-4 flex justify-center" : "px-0 py-0.8 text-center"}`}>
        <span className={`text-slate-400 font-medium ${collapsed ? "text-[10px]" : "text-xs"}`}>
          {collapsed ? "v1.0" : "Version 1.0.0"}
        </span>
      </div>
    </aside>
  );
}
