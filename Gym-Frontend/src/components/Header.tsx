import { useState, useRef, useEffect } from "react";
import { AdminAccount, Screen } from "../types";
import { User, LogOut, Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  [Screen.DASHBOARD]: "Dashboard",
  [Screen.MEMBERS_DIRECTORY]: "Members",
  [Screen.PAYMENTS_FINANCE]: "Payments",
  [Screen.SUBSCRIPTION_PLANS]: "Plans",
  [Screen.SETTINGS]: "Settings",
  [Screen.LOGIN]: "Login",
  [Screen.REGISTER]: "Register",
  [Screen.FORGOT_PASSWORD]: "Forgot Password",
  [Screen.REG_SUCCESS]: "Registration",
};

interface HeaderProps {
  admin: AdminAccount;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({
  admin,
  onNavigate,
  currentScreen,
  collapsed,
  onToggleSidebar,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30">
      {/* Left Section: Toggle + Title */}
      <div className="flex items-center gap-3 mr-4">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center rounded-lg transition cursor-pointer flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-blue-900 whitespace-nowrap">{PAGE_TITLES[currentScreen] || "Dashboard"}</h1>
      </div>

      {/* Global Status/Actions */}
      <div className="flex items-center gap-6 ml-4">
        {/* User Card with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Manage Account"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition duration-150">
                {admin.fullName}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                {admin.role}
              </p>
            </div>

            <div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200 group-hover:border-blue-600 transition duration-150 shadow-sm">
              <img
                referrerPolicy="no-referrer"
                src={admin.avatarUrl}
                alt="Admin Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-50 animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800 truncate">{admin.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{admin.email}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); onNavigate(Screen.SETTINGS); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                Edit Profile
              </button>
              <button
                onClick={() => { setDropdownOpen(false); onNavigate(Screen.LOGIN); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
