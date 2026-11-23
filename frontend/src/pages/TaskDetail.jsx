import { useEffect, useState } from "react";
import { getTaskComments, addTaskComment, updateTaskStatus, assignTask } from "../api";
import SecurityReviewPanel from "../components/SecurityReviewPanel";
import TaskAuditHistory from "../components/TaskAuditHistory";
import Navbar from "../components/Navbar";

function TaskDetail({
  task: initialTask,
  project,
  token,
  user,
  members = [],
  memberMap = {},
  onBack,
  onTaskUpdated,
  onLogout,
  onGoDashboard,
  onOpenUserManagement,
  onOpenAuditLogs,
  theme,
  onToggleTheme
}) {
  const [task, setTask] = useState(initialTask);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [postError, setPostError] = useState("");

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const canManageProject =
    user?.role === "ADMIN" ||
    (user?.role === "PROJECT_MANAGER" &&
      project.created_by != null &&
      user.id != null &&
      String(project.created_by) === String(user.id));

  const isReviewer = canManageProject;
  const isAssignee = task.assigned_to === user?.id;

  // Status colors
  const statusStyles = {
    TODO: "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200",
    IN_PROGRESS: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    IN_REVIEW: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
  };

  // Priority colors
  const priorityStyles = {
    LOW: "text-gray-500 dark:text-slate-400",
    MEDIUM: "text-amber-600 dark:text-amber-400",
    HIGH: "text-red-600 dark:text-red-400"
  };

  // Load comments on mount
  useEffect(() => {
    let active = true;

    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const data = await getTaskComments(project.id, task.id, token);
        if (!active) return;
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch (err) {
        if (active) setCommentsError(err.message);
      } finally {
        if (active) setCommentsLoading(false);
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [project.id, task.id, token]);

  // Handle posting a comment
  async function handleAddComment(e) {
    e.preventDefault();
    const trimmed = newComment.trim();

    if (!trimmed) return;
    if (trimmed.length > 2000) {
      setPostError("Comment cannot exceed 2000 characters.");
      return;
    }

    setPostingComment(true);
    setPostError("");

    try {
      const data = await addTaskComment(project.id, task.id, token, trimmed);
      // Append the newly created comment returned by backend
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
      }
      setNewComment("");
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPostingComment(false);
    }
  }

  // Handle task status transition
  async function handleStatusTransition(newStatus) {
    setStatusLoading(true);
    setStatusError("");

    try {
      const data = await updateTaskStatus(project.id, task.id, token, newStatus);
      const updated = data.task || { ...task, status: newStatus };
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  // Handle task assignment
  async function handleAssignUser(userId) {
    setAssignLoading(true);
    setAssignError("");

    try {
      const data = await assignTask(project.id, task.id, token, Number(userId));
      const updated = data.task || { ...task, assigned_to: Number(userId) };
      setTask(updated);
      setShowAssignDropdown(false);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      {/* Top Header */}
      <Navbar
        user={user}
        onLogout={onLogout}
        onGoDashboard={onGoDashboard}
        onOpenUserManagement={onOpenUserManagement}
        onOpenAuditLogs={onOpenAuditLogs}
        subtitle={`Project: ${project.name} | Task #${task.id}`}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Navigation */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
        >
          ← Back to Project Tasks
        </button>

        {/* Task Details Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Task #{task.id}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[task.status] || statusStyles.TODO
                  }`}
                >
                  {task.status?.replaceAll("_", " ")}
                </span>

                <span className={`text-xs font-medium ${priorityStyles[task.priority] || "text-gray-500 dark:text-slate-400"}`}>
                  Priority: {task.priority}
                </span>

                {task.is_security_sensitive && (
                  <span className="rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 dark:text-red-400">
                    Security Sensitive {task.risk_level ? `(${task.risk_level})` : ""}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
            </div>

            {/* Quick Assign / Reassign */}
            {canManageProject && task.status !== "DONE" && (
              <div>
                {showAssignDropdown ? (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue=""
                      disabled={assignLoading}
                      onChange={(e) => {
                        if (e.target.value) handleAssignUser(e.target.value);
                      }}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white"
                    >
                      <option value="" disabled>
                        Choose member…
                      </option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role.replaceAll("_", " ")})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAssignDropdown(false)}
                      className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAssignDropdown(true)}
                    className="rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    {task.assigned_to ? "Reassign Member" : "+ Assign Member"}
                  </button>
                )}
                {assignError && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{assignError}</p>}
              </div>
            )}
          </div>

          {/* Assignee banner */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span>Assignee:</span>
            <span className="font-medium text-gray-800 dark:text-slate-200">
              {task.assigned_to
                ? memberMap[task.assigned_to] || `User #${task.assigned_to}`
                : "Unassigned"}
            </span>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-gray-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-slate-300">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Workflow Status Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-slate-800 pt-6">
            <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500">Workflow Action:</span>

            {/* Developer Actions */}
            {isAssignee && task.status === "TODO" && (
              <button
                type="button"
                disabled={statusLoading}
                onClick={() => handleStatusTransition("IN_PROGRESS")}
                className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition"
              >
                {statusLoading ? "Updating..." : "Start Work"}
              </button>
            )}

            {isAssignee && task.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={statusLoading}
                onClick={() => handleStatusTransition("IN_REVIEW")}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60 transition"
              >
                {statusLoading ? "Submit for Review" : "Submit for Review"}
              </button>
            )}

            {/* Reviewer Actions */}
            {isReviewer && task.status === "IN_REVIEW" && (
              <>
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => handleStatusTransition("DONE")}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition"
                >
                  {statusLoading ? "Updating..." : "Approve (Done)"}
                </button>

                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => handleStatusTransition("IN_PROGRESS")}
                  className="rounded-lg border border-amber-500/50 px-4 py-2 text-xs font-semibold text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 disabled:opacity-60 transition"
                >
                  {statusLoading ? "Updating..." : "Request Changes"}
                </button>
              </>
            )}

            {!isAssignee && !isReviewer && (
              <span className="text-xs text-gray-400 dark:text-slate-500 italic">No available actions for your role.</span>
            )}
          </div>

          {statusError && (
            <p role="alert" className="mt-3 text-xs text-red-500 dark:text-red-400">
              {statusError}
            </p>
          )}
        </div>

        {/* Security Review Gate Panel (Only for security-sensitive tasks) */}
        {task.is_security_sensitive && (
          <SecurityReviewPanel
            projectId={project.id}
            taskId={task.id}
            token={token}
            taskStatus={task.status}
            isReviewer={isReviewer}
            memberMap={memberMap}
            onReviewUpdated={() => {
              setStatusError("");
            }}
          />
        )}

        {/* Discussions / Comments Section */}
        <section className="mt-10 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Discussions</h3>
              <span className="rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-slate-400">
                {comments.length}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500">Project members only</span>
          </div>

          {/* Comment submission form */}
          <form onSubmit={handleAddComment} className="mt-6">
            <label htmlFor="task-comment" className="mb-2 block text-xs font-medium text-gray-600 dark:text-slate-300">
              Add to discussion
            </label>

            <textarea
              id="task-comment"
              rows={3}
              maxLength={2000}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question, share progress, or leave feedback…"
              className="w-full resize-y rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 p-4 text-sm text-gray-900 dark:text-white outline-none transition focus:border-emerald-500"
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-slate-500">{newComment.length} / 2000 characters</span>

              <button
                type="submit"
                disabled={postingComment || !newComment.trim()}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {postingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>

            {postError && (
              <p role="alert" className="mt-2 text-xs text-red-500 dark:text-red-400">
                {postError}
              </p>
            )}
          </form>

          {/* Comments List */}
          <div className="mt-8 space-y-4">
            {commentsLoading && (
              <p className="text-sm text-gray-500 dark:text-slate-400">Loading discussions…</p>
            )}

            {commentsError && (
              <p role="alert" className="text-sm text-red-500 dark:text-red-400">
                {commentsError}
              </p>
            )}

            {!commentsLoading && !commentsError && comments.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-800 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
                No comments yet. Start the conversation above!
              </div>
            )}

            {!commentsLoading && !commentsError && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950 p-5 transition hover:border-gray-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{c.author_name}</span>
                        {c.user_id === user?.id && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 dark:text-slate-500">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-slate-200">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Task Audit History */}
        <TaskAuditHistory
          projectId={project.id}
          taskId={task.id}
          token={token}
        />
      </main>
    </div>
  );
}

export default TaskDetail;
