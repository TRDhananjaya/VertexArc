import { BellIcon, FolderIcon, ShieldCheckIcon, MessageSquareIcon } from "./Icons";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

function NotificationPanel({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onClose
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-start p-4 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-sm ml-0 md:ml-20 mt-14 md:mt-2 rounded-2xl border border-gray-200/90 dark:border-[#2a1754] bg-white/95 dark:bg-[#0c0d16]/95 p-5 shadow-2xl shadow-slate-300/60 dark:shadow-[0_0_60px_-10px_rgba(58,12,163,0.35)] backdrop-blur-xl animate-in slide-in-from-left-4 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1c1d30] pb-3.5">
          <div className="flex items-center gap-2">
            <BellIcon className="w-4 h-4 text-[#3A0CA3] dark:text-[#a78bfa]" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] font-medium text-[#3A0CA3] dark:text-[#a78bfa] hover:underline"
              >
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#131422] transition"
            >
              <span className="text-base font-semibold leading-none">&times;</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="mt-3 divide-y divide-gray-100 dark:divide-[#1c1d30]/60 max-h-[420px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#131422] text-gray-400">
                <BellIcon className="w-5 h-5" />
              </div>
              <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                All caught up
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
                You have no notifications right now.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.is_read;

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (isUnread && onMarkRead) onMarkRead(n.id);
                  }}
                  className={`group flex items-start gap-3 py-3 px-2 rounded-xl transition cursor-pointer ${
                    isUnread
                      ? "bg-[#3A0CA3]/5 dark:bg-[#3A0CA3]/10 hover:bg-[#3A0CA3]/10"
                      : "hover:bg-gray-50 dark:hover:bg-[#131422]/60"
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    {n.type === "TASK_ASSIGNED" ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <FolderIcon className="w-3.5 h-3.5" />
                      </div>
                    ) : n.type === "SECURITY" ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <MessageSquareIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#3A0CA3] dark:bg-[#a78bfa] shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
