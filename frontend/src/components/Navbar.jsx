import { VertexArcLogo } from "./VertexArcLogo";
import { SidebarIcon } from "./Icons";

/**
 * Navbar — Streamlined contextual header.
 * Displays breadcrumbs, project context, and user identity without duplicate navigation buttons.
 * All global navigation, theme switching, and sign-out are managed by the FloatingSidebar.
 */
function Navbar({
  user,
  subtitle,
  onGoDashboard,
  onToggleSidebar
}) {
  const roleBadges = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    PROJECT_MANAGER: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    DEVELOPER: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
  };

  return (
    <header className="md:hidden border-b border-gray-200/80 dark:border-[#1c1d30] bg-white/75 dark:bg-[#0c0d16]/75 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Mobile Toggle & Contextual Breadcrumb */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 dark:border-[#1c1d30] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] transition"
              title="Toggle Navigation Menu"
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={onGoDashboard ? onGoDashboard : undefined}
            className={`flex items-center gap-2.5 ${onGoDashboard ? "cursor-pointer group" : ""}`}
          >
            <VertexArcLogo
              className="h-6 w-auto"
              textClassName="text-base font-bold tracking-tight text-gray-900 dark:text-white"
            />
            {subtitle && (
              <span className="text-xs text-gray-500 dark:text-slate-400 sm:inline-block border-l border-gray-200 dark:border-[#1c1d30] pl-2.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: User Identity Pill (Clean, zero duplicate navigation buttons) */}
        {user && (
          <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-[#1c1d30] bg-gray-50/80 dark:bg-[#050505]/80 px-3 py-1 text-xs shadow-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <span className="font-medium text-gray-800 dark:text-slate-200 text-xs">{user.name}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                roleBadges[user.role] || "bg-gray-100 dark:bg-[#131422] text-gray-700 dark:text-slate-300 border-gray-200 dark:border-[#272844]"
              }`}
            >
              {user.role?.replaceAll("_", " ")}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
