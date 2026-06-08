import { useState, useRef, useEffect } from "react";
import { Search, Bell, HelpCircle, X, CheckCircle2 } from "lucide-react";
import { AdminAccount, Screen, AppNotification } from "../types";

interface HeaderProps {
  admin: AdminAccount;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (screen: Screen) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

export default function Header({
  admin,
  searchQuery,
  onSearchChange,
  onNavigate,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setShowSupport(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30">
      {/* App Title */}
      <div className="flex items-center gap-4 mr-4">
        <h1 className="text-lg font-bold text-blue-900 whitespace-nowrap">Gym-Dashboard</h1>
      </div>

      {/* Search Input Box
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition outline-none"
            placeholder="Search members, transactions, plans..."
          />
        </div>
      </div> */}

      {/* Global Status/Actions */}
      <div className="flex items-center gap-6 ml-4">
        <div className="flex items-center gap-4 text-slate-500">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-600 hover:text-blue-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400 font-medium">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition ${
                          !n.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-blue-600" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                            {n.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Support / Help */}
          <div className="relative" ref={supportRef}>
            <button
              onClick={() => setShowSupport((prev) => !prev)}
              className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-600 hover:text-blue-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {showSupport && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Need Help?</h4>
                    <p className="text-sm text-slate-600">
                      Contact <span className="font-bold text-blue-600">7984491528</span> for support
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User Card */}
        <div
          onClick={() => onNavigate(Screen.SETTINGS)}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 select-none"
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
      </div>
    </header>
  );
}
