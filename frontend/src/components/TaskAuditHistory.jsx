import { useEffect, useState } from "react";
import { getTaskAuditLogs } from "../api";
import { FileTextIcon } from "./Icons";

function TaskAuditHistory({ projectId, taskId, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        const data = await getTaskAuditLogs(projectId, taskId, token);
        if (!active) return;
        setLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (isExpanded) {
      loadLogs();
    }

    return () => {
      active = false;
    };
  }, [projectId, taskId, token, isExpanded]);

  function getActionBadge(action) {
    switch (action) {
      case "TASK_CREATED":
        return <span className="rounded bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">Created</span>;
      case "STATUS_CHANGED":
        return <span className="rounded bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-400">Status Changed</span>;
      case "SECURITY_REVIEW_UPDATED":
        return <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">Security Check Updated</span>;
      case "SECURITY_REVIEW_RESET":
        return <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">Security Check Reset</span>;
      case "TASK_ASSIGNED":
        return <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">Assigned</span>;
      case "TASK_DELETED":
        return <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">Soft Deleted</span>;
      default:
        return <span className="rounded bg-gray-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-slate-300">{action}</span>;
    }
  }

  function formatChangeValues(oldVal, newVal) {
    if (!oldVal && !newVal) return null;

    // Check if it's a status transition
    if (oldVal?.status && newVal?.status) {
      return (
        <span className="font-mono text-xs text-gray-600 dark:text-slate-300">
          <span className="line-through text-gray-500 dark:text-slate-500">{oldVal.status}</span> → <strong className="text-gray-900 dark:text-white">{newVal.status}</strong>
        </span>
      );
    }

    // Generic JSON stringify if objects
    return (
      <div className="mt-1 font-mono text-[11px] text-gray-500 dark:text-slate-400">
        {oldVal && <div>From: {JSON.stringify(oldVal)}</div>}
        {newVal && <div>To: {JSON.stringify(newVal)}</div>}
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <FileTextIcon className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Task Audit Trail</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          {isExpanded ? "Hide Audit History" : "View Audit History"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 border-t border-gray-200 dark:border-slate-800 pt-5">
          {loading && <p className="text-xs text-gray-500 dark:text-slate-400">Loading audit history…</p>}
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

          {!loading && !error && logs.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-500">No recorded audit events for this task.</p>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-gray-500 dark:text-slate-400">
                        by <strong className="text-gray-800 dark:text-slate-200">{log.actor_name || `User #${log.actor_id}`}</strong>
                      </span>
                    </div>

                    <span className="text-gray-500 dark:text-slate-500">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                    </span>
                  </div>

                  {/* Changes detail */}
                  <div className="mt-2 text-gray-600 dark:text-slate-300">
                    {formatChangeValues(log.old_value, log.new_value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default TaskAuditHistory;
