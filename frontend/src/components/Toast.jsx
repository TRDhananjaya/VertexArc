import { useEffect } from "react";
import { CheckIcon, AlertCircleIcon } from "./Icons";

/**
 * Toast — Global popup notification banner.
 * Displays high-visibility feedback for project creation, task creation, and user updates.
 */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-start gap-3.5 rounded-2xl border border-gray-200/90 dark:border-[#2a1754] bg-white/95 dark:bg-[#0c0d16]/95 p-4 shadow-2xl shadow-slate-300/60 dark:shadow-[0_0_50px_-10px_rgba(58,12,163,0.35)] backdrop-blur-xl">
        {/* Status Icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            isError
              ? "bg-red-500/10 text-red-500 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {isError ? (
            <AlertCircleIcon className="w-4 h-4" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            {toast.title || (isError ? "Error" : "Success")}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#131422] transition"
          aria-label="Close notification"
        >
          <span className="text-sm font-semibold leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
}

export default Toast;
