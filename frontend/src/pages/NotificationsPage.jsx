import { useState } from "react";
import Navbar from "../components/Navbar";
import {
  BellIcon,
  CheckIcon,
  FolderIcon,
  LayersIcon
} from "../components/Icons";

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

/**
 * NotificationsPage — Full workspace page view for team notifications.
 * Standardized to exactly match Projects, User Management, and Audit Trail layouts.
 */
function NotificationsPage({
  user,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onGoDashboard,
  onNavigateNotification,
  onToggleSidebar
}) {
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  function getTypeBadge(type) {
    switch (type) {
      case "ASSIGNMENT":
        return {
          icon: <LayersIcon className="w-3.5 h-3.5 text-[#3A0CA3] dark:text-[#a78bfa]" />,
          bg: "bg-[#3A0CA3]/10 text-[#3A0CA3] dark:text-[#c4b5fd] border-[#3A0CA3]/20",
          label: "Task Assigned"
        };
      case "STATUS_CHANGE":
        return {
          icon: <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />,
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          label: "Status Updated"
        };
      case "PROJECT":
        return {
          icon: <FolderIcon className="w-3.5 h-3.5 text-blue-500" />,
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          label: "Project"
        };
      default:
        return {
          icon: <BellIcon className="w-3.5 h-3.5 text-purple-500" />,
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          label: "Notice"
        };
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white">
      {/* Unified Mobile Navbar Header */}
      <Navbar
        user={user}
        onGoDashboard={onGoDashboard}
        subtitle="Workspace / Notifications"
        onToggleSidebar={onToggleSidebar}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 font-sans">
        {/* Consistent Back to Dashboard Link */}
        <button
          type="button"
          onClick={onGoDashboard}
          className="mb-6 text-sm text-[#3A0CA3] dark:text-[#a78bfa] hover:text-[#4812c5] dark:hover:text-[#c4b5fd] transition font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Standardized Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 dark:border-[#1c1d30] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#3A0CA3] to-[#7C3AED] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Live updates on assigned tasks, project progress, and workspace actions
            </p>
          </div>

          {unreadCount > 0 && onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02]"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Tabs Controls (Matches System Audit Logs tabs exactly) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1.5 rounded-xl bg-gray-100 dark:bg-[#0c0d16] p-1 border border-gray-200 dark:border-[#1c1d30]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] text-white shadow-sm"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === "unread"
                  ? "bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] text-white shadow-sm"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List Container */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 px-6 text-center text-xs text-gray-500 dark:text-slate-400">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3A0CA3]/10 text-[#3A0CA3] dark:text-[#c4b5fd] mb-3">
                <BellIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {filter === "unread" ? "No unread notifications" : "No notifications found"}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                {filter === "unread"
                  ? "You're all caught up! Switch to 'All' to review earlier updates."
                  : "You will be alerted here whenever tasks are assigned to you or progress changes."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#1c1d30]">
              {filtered.map((item) => {
                const badge = getTypeBadge(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onNavigateNotification) {
                        onNavigateNotification(item);
                      }
                    }}
                    className={`group/card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition cursor-pointer ${
                      item.is_read
                        ? "hover:bg-gray-50/80 dark:hover:bg-[#131422]/70"
                        : "bg-[#3A0CA3]/5 dark:bg-[#3A0CA3]/10 hover:bg-[#3A0CA3]/15 dark:hover:bg-[#3A0CA3]/20"
                    }`}
                    title={item.link ? `Go to ${item.link}` : "Click to view"}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Unread indicator bullet */}
                      <div className="mt-1 flex items-center justify-center shrink-0">
                        {!item.is_read ? (
                          <span className="h-2 w-2 rounded-full bg-[#3A0CA3] shadow-xs" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-transparent" />
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white group-hover/card:text-[#3A0CA3] dark:group-hover/card:text-[#a78bfa] transition-colors">
                            {item.title}
                          </h4>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed break-words">
                          {item.message}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400 dark:text-slate-500">
                          <span>{formatTime(item.created_at)}</span>
                          {item.link && (
                            <>
                              <span>•</span>
                              <span className="text-[#3A0CA3] dark:text-[#c4b5fd] font-medium group-hover/card:underline">
                                {item.link.startsWith("/projects") ? "Open in workspace →" : "View →"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Item */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0 pl-6 sm:pl-0">
                      {!item.is_read && onMarkRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(item.id);
                          }}
                          className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1c1d30] transition shadow-xs"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;
