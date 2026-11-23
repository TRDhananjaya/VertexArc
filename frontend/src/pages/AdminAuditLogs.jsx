import { useEffect, useState } from "react";
import { getAdminProjectAuditLogs, getAdminTaskAuditLogs } from "../api";

function AdminAuditLogs({ token, onBack }) {
  const [activeTab, setActiveTab] = useState("projects"); // "projects" | "tasks"
  const [projectLogs, setProjectLogs] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "projects") {
          const data = await getAdminProjectAuditLogs(token);
          if (!active) return;
          setProjectLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
        } else {
          const data = await getAdminTaskAuditLogs(token);
          if (!active) return;
          setTaskLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      active = false;
    };
  }, [token, activeTab]);

  function getActionBadge(action) {
    switch (action) {
      case "PROJECT_CREATED":
      case "TASK_CREATED":
        return <span className="rounded bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">Created</span>;
      case "PROJECT_UPDATED":
      case "TASK_UPDATED":
      case "STATUS_CHANGED":
        return <span className="rounded bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-400">Updated</span>;
      case "SECURITY_REVIEW_UPDATED":
        return <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">Security Verified</span>;
      case "SECURITY_REVIEW_RESET":
        return <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">Security Reset</span>;
      case "PROJECT_DELETED":
      case "TASK_DELETED":
        return <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">Deleted</span>;
      case "MEMBER_ADDED":
      case "TASK_ASSIGNED":
        return <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">Assigned</span>;
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">{action}</span>;
    }
  }

  // Filter logs by search query
  const currentLogs = activeTab === "projects" ? projectLogs : taskLogs;
  const filteredLogs = currentLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const targetName = (log.project_name || log.task_title || "").toLowerCase();
    const actorName = (log.actor_name || "").toLowerCase();
    const actorEmail = (log.actor_email || "").toLowerCase();
    const action = (log.action || "").toLowerCase();
    return targetName.includes(q) || actorName.includes(q) || actorEmail.includes(q) || action.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-emerald-400">VertexArc</h1>
          <span className="rounded bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-400">
            Admin Audit Mode
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-emerald-400 transition hover:text-emerald-300"
        >
          ← Back to Dashboard
        </button>

        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">System Audit Logs</h2>
          <p className="mt-2 text-slate-400">
            Immutable, centralized audit history of all critical project and task operations.
          </p>
        </div>

        {/* Tabs & Search controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "projects"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Project Audit Logs ({projectLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "tasks"
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Task Audit Logs ({taskLogs.length})
            </button>
          </div>

          {/* Quick Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, name, actor…"
            className="w-full max-w-xs rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-purple-500"
          />
        </div>

        {/* Feedback states */}
        {loading && <p className="text-slate-400">Loading audit records…</p>}
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && filteredLogs.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No audit records found {searchQuery ? "matching your search query" : ""}.
          </div>
        )}

        {/* Audit Log Table */}
        {!loading && !error && filteredLogs.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">{activeTab === "projects" ? "Project" : "Task"}</th>
                  <th className="px-5 py-4">Actor</th>
                  <th className="px-5 py-4">Change Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-5 py-4 font-medium text-white">
                      {activeTab === "projects" ? (
                        <div>
                          <span>{log.project_name || `Project #${log.project_id}`}</span>
                          <span className="block text-xs text-slate-500 font-mono">ID: {log.project_id}</span>
                        </div>
                      ) : (
                        <div>
                          <span>{log.task_title || `Task #${log.task_id}`}</span>
                          <span className="block text-xs text-slate-500 font-mono">ID: {log.task_id}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <span className="font-semibold text-slate-200">
                        {log.actor_name || `User #${log.actor_id}`}
                      </span>
                      {log.actor_email && (
                        <span className="block text-slate-500">{log.actor_email}</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono text-slate-400 max-w-xs break-words">
                      {log.old_value && (
                        <div className="truncate" title={JSON.stringify(log.old_value)}>
                          <span className="text-slate-500">Old:</span> {JSON.stringify(log.old_value)}
                        </div>
                      )}
                      {log.new_value && (
                        <div className="truncate text-slate-300" title={JSON.stringify(log.new_value)}>
                          <span className="text-slate-500">New:</span> {JSON.stringify(log.new_value)}
                        </div>
                      )}
                      {!log.old_value && !log.new_value && <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminAuditLogs;
