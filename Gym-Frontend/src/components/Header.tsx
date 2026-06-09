import { AdminAccount, Screen } from "../types";

const PAGE_TITLES: Record<string, string> = {
  [Screen.DASHBOARD]: "Dashboard",
  [Screen.MEMBERS_DIRECTORY]: "Members",
  [Screen.PAYMENTS_FINANCE]: "Payments",
  [Screen.MEMBERSHIP_RENEWAL]: "Memberships",
  [Screen.SETTINGS]: "Settings",
  [Screen.LOGIN]: "Login",
  [Screen.REGISTER]: "Register",
  [Screen.FORGOT_PASSWORD]: "Forgot Password",
  [Screen.REG_SUCCESS]: "Registration",
};

interface HeaderProps {
  admin: AdminAccount;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

export default function Header({
  admin,
  onNavigate,
  currentScreen,
}: HeaderProps) {
  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30">
      {/* App Title */}
      <div className="flex items-center gap-4 mr-4">
        <h1 className="text-lg font-bold text-blue-900 whitespace-nowrap">{PAGE_TITLES[currentScreen] || "Dashboard"}</h1>
      </div>

      {/* Global Status/Actions */}
      <div className="flex items-center gap-6 ml-4">
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
