import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { SunIcon, MoonIcon, LogOutIcon, UsersIcon, FileTextIcon, FolderIcon } from "./Icons";
import { VertexArcLogo } from "./VertexArcLogo";

function Navbar({
  user,
  onLogout,
  onOpenUserManagement,
  onOpenAuditLogs,
  onGoDashboard,
  subtitle,
  theme,
  onToggleTheme
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const roleBadges = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    PROJECT_MANAGER: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    DEVELOPER: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
  };

  return (
    <>
      <header className="border-b border-gray-200 dark:border-[#1c1d30] bg-white/95 dark:bg-[#0c0d16]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Brand & Subtitle */}
          <div
            onClick={onGoDashboard ? onGoDashboard : undefined}
            className={`flex items-center gap-3 ${onGoDashboard ? "cursor-pointer group" : ""}`}
          >
            <VertexArcLogo
              className="h-7 w-auto"
              textClassName="text-lg font-bold tracking-tight text-gray-900 dark:text-white"
            />
            {subtitle && (
              <span className="hidden text-xs text-gray-500 dark:text-slate-400 sm:inline-block border-l border-gray-200 dark:border-[#1c1d30] pl-3">
                {subtitle}
              </span>
            )}
          </div>

          {/* Right side: navigation actions */}
          <div className="flex items-center gap-2.5">
            {/* Dashboard shortcut */}
            {onGoDashboard && (
              <button
                type="button"
                onClick={onGoDashboard}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 transition hover:border-gray-300 dark:hover:border-[#272844] hover:text-gray-900 dark:hover:text-white"
              >
                <FolderIcon className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}

            {/* User Profile Pill */}
            {user && (
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-3 py-1.5 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="font-medium text-gray-800 dark:text-slate-200">{user.name}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                    roleBadges[user.role] || "bg-gray-100 dark:bg-[#131422] text-gray-700 dark:text-slate-300 border-gray-200 dark:border-[#272844]"
                  }`}
                >
                  {user.role?.replaceAll("_", " ")}
                </span>
              </div>
            )}

            {/* Admin Controls */}
            {user?.role === "ADMIN" && onOpenAuditLogs && (
              <button
                type="button"
                onClick={onOpenAuditLogs}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 transition hover:bg-purple-100 dark:hover:bg-purple-500/20"
              >
                <FileTextIcon className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>
            )}

            {user?.role === "ADMIN" && onOpenUserManagement && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
              >
                <UsersIcon className="w-3.5 h-3.5" />
                <span>Users</span>
              </button>
            )}

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] text-gray-600 dark:text-slate-300 transition hover:bg-gray-100 dark:hover:bg-[#131422] hover:text-gray-900 dark:hover:text-white"
              >
                {theme === "dark" ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            {/* Sign out */}
            {onLogout && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign out"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign out of VertexArc?"
          message="You will be returned to the landing page. Your active session will be cleanly closed."
          confirmLabel="Sign out"
          variant="warning"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}

export default Navbar;
