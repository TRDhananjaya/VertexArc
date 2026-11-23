// variant: "danger" (default, red) | "warning" (amber) | "primary" (emerald)
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, loading, error, variant = "danger" }) {
  const confirmStyles = {
    danger:  "bg-red-500 hover:bg-red-400 text-white",
    warning: "bg-amber-500 hover:bg-amber-400 text-slate-950",
    primary: "bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white shadow-md shadow-[#3A0CA3]/25",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
          {message}
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 dark:border-[#272844] px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] disabled:opacity-60 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${confirmStyles[variant] || confirmStyles.danger}`}
          >
            {loading ? "Please wait..." : confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
