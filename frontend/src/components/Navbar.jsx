import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

function Navbar({
  user,
  onLogout,
  onOpenUserManagement,
  onOpenAuditLogs,
  onGoDashboard,
  subtitle
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const roleBadges = {
    ADMIN: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    PROJECT_MANAGER: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    DEVELOPER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Brand & Subtitle */}
          <div
            onClick={onGoDashboard ? onGoDashboard : undefined}
            className={`flex items-center gap-3 ${onGoDashboard ? "cursor-pointer group" : ""}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 group-hover:bg-emerald-500/20 transition">
              V
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
                VertexArc
              </span>
              {subtitle && (
                <span className="ml-3 hidden text-xs text-slate-400 sm:inline-block">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* User Identity & Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Dashboard shortcut when inside detail views */}
            {onGoDashboard && (
              <button
                type="button"
                onClick={onGoDashboard}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
              >
                Dashboard
              </button>
            )}

            {/* User Profile Pill */}
            {user && (
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
                <span className="font-medium text-slate-200">{user.name}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                    roleBadges[user.role] || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {user.role?.replaceAll("_", " ")}
                </span>
              </div>
            )}

            {/* Admin Navigation Controls */}
            {user?.role === "ADMIN" && onOpenAuditLogs && (
              <button
                type="button"
                onClick={onOpenAuditLogs}
                className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
              >
                Audit Logs
              </button>
            )}

            {user?.role === "ADMIN" && onOpenUserManagement && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                Users
              </button>
            )}

            {/* Logout — opens a confirmation dialog first */}
            {onLogout && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign out of VertexArc?"
          message="You will be returned to the login screen. Any unsaved changes will be lost."
          confirmLabel="Yes, sign out"
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
