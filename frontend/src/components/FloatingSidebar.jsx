import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import {
  SunIcon,
  MoonIcon,
  LogOutIcon,
  UsersIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  SidebarIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  BellIcon,
  SettingsIcon
} from "./Icons";
import { VertexArcEmblem } from "./VertexArcLogo";

/**
 * FloatingSidebar — Expandable Capsule Dock inspired by modern minimalist SaaS interfaces.
 * Smoothly toggles between a slim 64px icon dock and a rich 288px floating control panel.
 */
function FloatingSidebar({
  user,
  activeView, // "dashboard" | "project" | "users" | "audit"
  projectName,
  onGoDashboard,
  onOpenUserManagement,
  onOpenAuditLogs,
  onLogout,
  theme,
  onToggleTheme,
  isExpanded,
  onToggleExpand,
  unreadNotificationCount = 0,
  onOpenNotifications,
  onOpenProfile
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activePillClass =
    "bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] text-white shadow-md shadow-[#3A0CA3]/35 font-semibold";
  const inactiveBtnClass =
    "text-gray-600 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#131422]/80";

  return (
    <>
      {/* ── MOBILE OVERLAY BACKDROP (When Expanded on mobile) ── */}
      {isExpanded && (
        <div
          onClick={onToggleExpand}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── DESKTOP FLOATING CAPSULE DOCK & EXPANDABLE PANEL ── */}
      <aside
        aria-label="Floating Sidebar"
        className={`fixed left-4 top-4 bottom-4 z-50 flex flex-col justify-between rounded-3xl border border-gray-200/90 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/70 transition-all duration-300 ease-in-out ${
          isExpanded
            ? "w-72 p-5"
            : "w-16 py-4 px-2 items-center hidden md:flex"
        }`}
      >
        {/* ── TOP HEADER / BRAND & EXPAND TOGGLE ── */}
        <div className="w-full">
          {isExpanded ? (
            /* EXPANDED HEADER */
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1c1d30] pb-4">
              <div
                onClick={onGoDashboard}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="VertexArc Home"
              >
                <VertexArcEmblem className="h-6 w-auto transition-transform group-hover:scale-105" />
                <span className="text-sm font-bold tracking-tight text-gray-950 dark:text-white font-sans">
                  Vertex<span className="bg-gradient-to-r from-[#3A0CA3] to-[#7C3AED] bg-clip-text text-transparent">Arc</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Theme Mode Toggle Pill */}
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-2 py-1 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1c1d30] transition"
                  >
                    {theme === "dark" ? (
                      <>
                        <MoonIcon className="w-3 h-3 text-violet-400" />
                        <span className="hidden sm:inline">Dark</span>
                      </>
                    ) : (
                      <>
                        <SunIcon className="w-3 h-3 text-amber-500" />
                        <span className="hidden sm:inline">Light</span>
                      </>
                    )}
                  </button>
                )}

                {/* Collapse Button */}
                <button
                  type="button"
                  onClick={onToggleExpand}
                  title="Collapse Sidebar"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#131422] hover:text-gray-900 dark:hover:text-white transition"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* COLLAPSED HEADER */
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Expand Toggle Button at Top (Matches reference image [<] icon) */}
              <button
                type="button"
                onClick={onToggleExpand}
                title="Expand Sidebar"
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#131422] hover:text-gray-900 dark:hover:text-white transition"
              >
                <SidebarIcon className="w-4 h-4" />
                {/* Tooltip */}
                <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                  <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                    Expand Sidebar
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onGoDashboard}
                title="VertexArc Home"
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:scale-105"
              >
                <VertexArcEmblem className="h-6 w-auto" />
                <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                  <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                    Dashboard
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ── NAVIGATION LIST (Middle) ── */}
        <div className="w-full flex-1 overflow-y-auto py-4">
          {isExpanded ? (
            /* ── EXPANDED NAVIGATION LIST ── */
            <div className="space-y-5">
              {/* Workspace Section */}
              <div>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                  Workspace
                </p>

                <div className="space-y-1">
                  {/* All Projects */}
                  <button
                    type="button"
                    onClick={onGoDashboard}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                      activeView === "dashboard" ? activePillClass : inactiveBtnClass
                    }`}
                  >
                    <FolderIcon className="w-4 h-4 shrink-0" />
                    <span>Projects & Backlogs</span>
                  </button>

                  {/* Nested Active Project (Directly under Projects & Backlogs) */}
                  {activeView === "project" && (
                    <div className="ml-4 pl-3 border-l-2 border-[#3A0CA3]/40 dark:border-[#3A0CA3]/60 my-1 space-y-1">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#3A0CA3]/10 text-xs font-semibold text-[#3A0CA3] dark:text-[#c4b5fd]">
                        <LayersIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{projectName || "Active Project"}</span>
                      </div>
                    </div>
                  )}

                  {/* Notifications Navigation Tab (Equal sibling to Projects & Backlogs) */}
                  {onOpenNotifications && (
                    <button
                      type="button"
                      onClick={onOpenNotifications}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                        activeView === "notifications" ? activePillClass : inactiveBtnClass
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BellIcon className="w-4 h-4 shrink-0" />
                        <span>Notifications</span>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-xs ${
                            activeView === "notifications"
                              ? "bg-white text-[#3A0CA3]"
                              : "bg-[#3A0CA3] text-white"
                          }`}
                        >
                          {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Section (Only for Admins) */}
              {user?.role === "ADMIN" && (
                <div>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                    Administration
                  </p>

                  <div className="space-y-1">
                    {onOpenAuditLogs && (
                      <button
                        type="button"
                        onClick={onOpenAuditLogs}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          activeView === "audit" ? activePillClass : inactiveBtnClass
                        }`}
                      >
                        <FileTextIcon className="w-4 h-4 shrink-0" />
                        <span>Audit Trail</span>
                      </button>
                    )}

                    {onOpenUserManagement && (
                      <button
                        type="button"
                        onClick={onOpenUserManagement}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          activeView === "users" ? activePillClass : inactiveBtnClass
                        }`}
                      >
                        <UsersIcon className="w-4 h-4 shrink-0" />
                        <span>User Management</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Security & Compliance Highlights */}
              <div className="rounded-2xl border border-gray-100 dark:border-[#1c1d30] bg-gray-50/70 dark:bg-[#050505]/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
                  Platform Signals
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3-Point Security Gate</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500 leading-tight">
                  Mandatory code & role verification before deployment.
                </p>
              </div>
            </div>
          ) : (
            /* ── COLLAPSED NAVIGATION LIST ── */
            <nav className="flex flex-col items-center gap-2 w-full">
              {/* Projects */}
              <button
                type="button"
                onClick={onGoDashboard}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                  activeView === "dashboard" ? activePillClass : inactiveBtnClass
                }`}
              >
                <FolderIcon className="w-4 h-4" />
                <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                  <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                    Projects & Backlogs
                  </div>
                </div>
              </button>

              {/* Active Project shortcut */}
              {activeView === "project" && (
                <button
                  type="button"
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${activePillClass}`}
                  title={projectName || "Active Project"}
                >
                  <LayersIcon className="w-4 h-4" />
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      {projectName ? `Project: ${projectName}` : "Active Project"}
                    </div>
                  </div>
                </button>
              )}

              {/* Notifications in collapsed mode */}
              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    activeView === "notifications" ? activePillClass : inactiveBtnClass
                  }`}
                  title="Notifications"
                >
                  <BellIcon className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </span>
                  )}
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      Notifications {unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : ""}
                    </div>
                  </div>
                </button>
              )}

              {/* Admin: Audit Logs */}
              {user?.role === "ADMIN" && onOpenAuditLogs && (
                <button
                  type="button"
                  onClick={onOpenAuditLogs}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    activeView === "audit" ? activePillClass : inactiveBtnClass
                  }`}
                >
                  <FileTextIcon className="w-4 h-4" />
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      Audit Trail
                    </div>
                  </div>
                </button>
              )}

              {/* Admin: Users */}
              {user?.role === "ADMIN" && onOpenUserManagement && (
                <button
                  type="button"
                  onClick={onOpenUserManagement}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    activeView === "users" ? activePillClass : inactiveBtnClass
                  }`}
                >
                  <UsersIcon className="w-4 h-4" />
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      User Management
                    </div>
                  </div>
                </button>
              )}

              {/* Divider Line */}
              <div className="w-6 h-px bg-gray-200 dark:bg-[#1c1d30] my-2" />

              {/* Theme Toggle in collapsed mode */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${inactiveBtnClass}`}
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === "dark" ? (
                    <SunIcon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <MoonIcon className="w-4 h-4 text-slate-700" />
                  )}
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </div>
                  </div>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* ── BOTTOM PROFILE & LOGOUT ── */}
        <div className="w-full border-t border-gray-100 dark:border-[#1c1d30] pt-4">
          {isExpanded ? (
            /* EXPANDED PROFILE CARD & SIGN OUT AT BOTTOM */
            <div className="space-y-3">
              {/* User Identity Info */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-500/30 overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user?.name || "Avatar"} className="h-full w-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="truncate min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || "User"}
                    </p>
                    <span className="inline-block rounded-full bg-purple-100 dark:bg-purple-500/15 text-[10px] font-semibold text-purple-700 dark:text-purple-300 px-2 py-0.5 mt-0.5">
                      {user?.role?.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    title="Account Settings & Password"
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#131422] transition"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Clean Separator Line */}
              <div className="w-full border-t border-gray-100 dark:border-[#1c1d30]" />

              {/* Dedicated Sign Out Button at the Very Bottom */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 hover:border-red-500/30 transition shadow-xs"
                >
                  <LogOutIcon className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            /* COLLAPSED PROFILE ICONS */
            <div className="flex flex-col items-center gap-2.5 w-full">
              {user && (
                <div className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-500/30 overflow-hidden cursor-default">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user?.name || "Avatar"} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-950 whitespace-nowrap">
                      {user.name} ({user.role?.replaceAll("_", " ")})
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings in collapsed mode */}
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#131422] transition`}
                  title="Account Settings & Password"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl whitespace-nowrap">
                      Account Settings
                    </div>
                  </div>
                </button>
              )}

              {/* Clean Separator Line in Collapsed View */}
              <div className="w-5 h-px bg-gray-200 dark:bg-[#1c1d30]" />

              {onLogout && (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                  title="Sign Out"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <div className="absolute left-full ml-3 hidden items-center group-hover:flex pointer-events-none z-50">
                    <div className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xl whitespace-nowrap">
                      Sign Out
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAVIGATION (< md) ── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-4 right-4 h-14 z-40 flex items-center justify-around px-3 rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60"
      >
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#131422] transition"
          title="Menu"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onGoDashboard}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            activeView === "dashboard" ? activePillClass : inactiveBtnClass
          }`}
          title="Dashboard"
        >
          <FolderIcon className="w-4 h-4" />
        </button>

        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
              activeView === "notifications" ? activePillClass : inactiveBtnClass
            }`}
            title="Notifications"
          >
            <BellIcon className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {user?.role === "ADMIN" && onOpenAuditLogs && (
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              activeView === "audit" ? activePillClass : inactiveBtnClass
            }`}
            title="Audit Logs"
          >
            <FileTextIcon className="w-4 h-4" />
          </button>
        )}

        {user?.role === "ADMIN" && onOpenUserManagement && (
          <button
            type="button"
            onClick={onOpenUserManagement}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              activeView === "users" ? activePillClass : inactiveBtnClass
            }`}
            title="Users"
          >
            <UsersIcon className="w-4 h-4" />
          </button>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:text-red-500 transition"
            title="Sign Out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign Out"
          message="Are you sure you want to end your session? You will need to sign in again to access projects."
          confirmLabel="Sign Out"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
          variant="danger"
        />
      )}
    </>
  );
}

export default FloatingSidebar;
