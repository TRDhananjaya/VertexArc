import { useEffect, useState } from "react";
import { getProjectTasks, deleteProject, updateTaskStatus, assignTask, getProjectMembers, deleteTask } from "../api";
import CreateTaskForm from "../components/CreateTaskForm";
import EditProjectForm from "../components/EditProjectForm";
import EditTaskForm from "../components/EditTaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import ProjectMembers from "../components/ProjectMembers";
import TaskDetail from "./TaskDetail";
import Navbar from "../components/Navbar";

function ProjectDetails({
  project: initialProject,
  token,
  user,
  onBack,
  onGoDashboard,
  onToggleSidebar,
  showToast
}) {
  const [project, setProject] = useState(initialProject);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusLoading, setStatusLoading] = useState(null);
  const [statusError, setStatusError] = useState("");

  // Members list — used to build the assign dropdown and name lookup map
  const [members, setMembers] = useState([]);

  // memberMap lets us look up a user's name by ID: memberMap[5] → "Alice Chen"
  // This is built from the members array so we don't have to search the array every render
  const memberMap = {};
  members.forEach((m) => { memberMap[m.id] = m.name; });

  // Per-task assign dropdown visibility: assigningTaskId holds the task ID whose
  // dropdown is currently open, or null if none
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  // editingTaskId: the ID of the task whose EditTaskForm is currently open (or null)
  const [editingTaskId, setEditingTaskId] = useState(null);

  // deleteTaskTarget: the full task object to be deleted (drives the ConfirmDialog)
  // We store the whole object so the dialog can display the task title in its message
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);
  const [deleteTaskError, setDeleteTaskError] = useState("");

  // Can this user manage (edit/delete) this project?
  const canManageProject =
    user?.role === "ADMIN" ||
    (user?.role === "PROJECT_MANAGER" &&
      project.created_by != null &&
      user.id != null &&
      String(project.created_by) === String(user.id));

  // Can this user create tasks in this project?
  const canCreateTask = canManageProject;

  // Is this user a reviewer? (Admin or the PM who created the project)
  // Reviewers can approve tasks (IN_REVIEW → DONE) or request changes (IN_REVIEW → IN_PROGRESS)
  const isReviewer = canManageProject;

  // Handle task status transitions
  // This function is called when a user clicks a status action button
  async function handleStatusChange(taskId, newStatus) {
    setStatusLoading(taskId);  // Show loading on this specific task
    setStatusError("");

    try {
      await updateTaskStatus(project.id, taskId, token, newStatus);

      // Refresh the task list to reflect the change
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(null);  // Clear loading state
    }
  }

  // Load tasks whenever the project changes or a task is created.
  useEffect(() => {
    let active = true;

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const data = await getProjectTasks(project.id, token);

        if (!active) return;

        const taskList = Array.isArray(data)
          ? data
          : data.tasks;

        if (!Array.isArray(taskList)) {
          throw new Error("Unexpected tasks API response format");
        }

        setTasks(taskList);
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, [project.id, token, refreshKey]);

  // Load project members so we can:
  // 1. Build the memberMap for displaying assignee names
  // 2. Populate the assign dropdown with eligible users
  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        const data = await getProjectMembers(project.id, token);
        if (!active) return;
        const list = Array.isArray(data) ? data : data.members;
        if (Array.isArray(list)) setMembers(list);
      } catch {
        // If we can't load members, the page still works — assignment just won't show names
      }
    }

    loadMembers();
    return () => { active = false; };
  }, [project.id, token]);

  // Handle task assignment
  // userId: the ID of the member to assign (comes from the dropdown selection)
  async function handleAssign(taskId, userId) {
    setAssignLoading(true);
    setAssignError("");

    try {
      await assignTask(project.id, taskId, token, Number(userId));
      setAssigningTaskId(null);           // Close the dropdown
      setRefreshKey((k) => k + 1);        // Refresh task list to show updated assignment
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  }

  // Handle task update from EditTaskForm
  function handleTaskUpdated(updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setEditingTaskId(null);
  }

  // Handle task soft-delete
  async function handleDeleteTask() {
    if (!deleteTaskTarget) return;

    setDeleteTaskLoading(true);
    setDeleteTaskError("");

    try {
      await deleteTask(project.id, deleteTaskTarget.id, token);
      setDeleteTaskTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setDeleteTaskError(err.message);
    } finally {
      setDeleteTaskLoading(false);
    }
  }

  // Handle project deletion
  async function handleDeleteProject() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteProject(project.id, token);
      onBack(); // Return to dashboard — the deleted project will no longer appear
    } catch (err) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  }

  // Handle successful project edit
  function handleProjectUpdated(updatedProject) {
    setProject(updatedProject);
    setShowEditForm(false);
  }

  // Task status colors
  const statusStyles = {
    TODO: "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200",
    IN_PROGRESS: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    IN_REVIEW: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
  };

  // Task priority colors
  const priorityStyles = {
    LOW: "text-gray-500 dark:text-slate-400",
    MEDIUM: "text-amber-600 dark:text-amber-400",
    HIGH: "text-red-600 dark:text-red-400"
  };

  // If a task is selected, render the full TaskDetail view with discussions
  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        project={project}
        token={token}
        user={user}
        members={members}
        memberMap={memberMap}
        onGoDashboard={onGoDashboard}
        onToggleSidebar={onToggleSidebar}
        onBack={() => setSelectedTask(null)}
        onTaskUpdated={(updatedTask) => {
          setSelectedTask(updatedTask);
          handleTaskUpdated(updatedTask);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white">
      {/* Unified Navbar */}
      <Navbar
        user={user}
        onGoDashboard={onGoDashboard}
        subtitle={`Project: ${project.name}`}
        onToggleSidebar={onToggleSidebar}
      />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-[#3A0CA3] dark:text-[#a78bfa] hover:text-[#4812c5] dark:hover:text-[#c4b5fd] transition font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Project information */}
        <div className="mb-8 border-b border-gray-200/80 dark:border-[#1c1d30] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {project.name}
              </h1>

              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Edit / Delete buttons — only for authorized users */}
            {canManageProject && !showEditForm && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1c1d30] transition shadow-sm"
                >
                  Edit Project
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-500/40 bg-red-500/5 px-3.5 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 transition"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>

          {/* Delete error message */}
          {deleteError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-500 dark:text-red-400"
            >
              {deleteError}
            </div>
          )}
        </div>

        {/* Edit Project form */}
        {showEditForm && canManageProject && (
          <EditProjectForm
            project={project}
            token={token}
            onUpdated={handleProjectUpdated}
            onCancel={() => setShowEditForm(false)}
          />
        )}

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <ConfirmDialog
            title="Delete Project"
            message={`Are you sure you want to delete "${project.name}"? This action will archive the project and all its associated data. This cannot be undone.`}
            confirmLabel="Delete Project"
            onConfirm={handleDeleteProject}
            onCancel={() => setShowDeleteConfirm(false)}
            loading={deleteLoading}
            variant="danger"
          />
        )}

        {/* Delete Task confirmation dialog */}
        {deleteTaskTarget && (
          <ConfirmDialog
            title="Delete Task"
            message={`Are you sure you want to delete "${deleteTaskTarget.title}"? This task will be archived and removed from active views. Its audit history will be preserved.`}
            confirmLabel="Delete Task"
            onConfirm={handleDeleteTask}
            onCancel={() => {
              setDeleteTaskTarget(null);
              setDeleteTaskError("");
            }}
            loading={deleteTaskLoading}
            error={deleteTaskError}
            variant="danger"
          />
        )}

        {/* Project Members */}
        <ProjectMembers
          projectId={project.id}
          project={project}
          token={token}
          user={user}
        />

        {/* Tasks heading and Create Task button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Tasks
            </h2>

            {!loading && !error && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} in development backlog
              </p>
            )}
          </div>

          {/* Only authorized users can see this button */}
          {canCreateTask && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02]"
            >
              <span>+</span>
              <span>New Task</span>
            </button>
          )}
        </div>

        {/* Create Task form */}
        {canCreateTask && showCreateForm && (
          <CreateTaskForm
            projectId={project.id}
            token={token}
            onCreated={(createdTask) => {
              setShowCreateForm(false);
              setRefreshKey((current) => current + 1);
              if (showToast) {
                showToast(
                  "Task Created",
                  `Task "${createdTask?.title || "New Task"}" created successfully!`
                );
              }
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Loading state */}
        {loading && (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Loading tasks...
          </p>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {/* Status change error */}
        {statusError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-500 dark:text-red-400"
          >
            {statusError}
          </div>
        )}

        {/* Empty task list */}
        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-8 text-center text-sm text-gray-500 dark:text-slate-400 shadow-sm">
            No tasks found in this project.
          </div>
        )}

        {/* Task cards */}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 shadow-sm transition hover:border-[#3A0CA3]/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer text-base font-semibold text-gray-900 dark:text-white transition group-hover:text-[#3A0CA3] dark:group-hover:text-[#a78bfa]"
                      title="Click to view full details and discussions"
                    >
                      {task.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Task status */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[task.status] ||
                        statusStyles.TODO
                        }`}
                    >
                      {task.status?.replaceAll("_", " ") || "UNKNOWN"}
                    </span>

                    {/* Edit & Delete buttons (Admin / project owner) */}
                    {canManageProject && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTaskId(editingTaskId === task.id ? null : task.id)
                          }
                          className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1c1d30] transition"
                        >
                          {editingTaskId === task.id ? "Close" : "Edit"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTaskError("");
                            setDeleteTaskTarget(task);
                          }}
                          className="rounded-lg border border-red-500/40 bg-red-500/5 px-2.5 py-1 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task details */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 dark:border-[#1c1d30] pt-3 text-xs text-gray-500 dark:text-slate-400">
                  {/* Priority */}
                  <span
                    className={
                      priorityStyles[task.priority] ||
                      "text-gray-500 dark:text-slate-400"
                    }
                  >
                    Priority: {task.priority || "Not set"}
                  </span>

                  {/* Security-sensitive indicator */}
                  {task.is_security_sensitive && (
                    <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500 dark:text-red-400">
                      Security Sensitive
                    </span>
                  )}

                  {/* Security risk level */}
                  {task.risk_level && (
                    <span>
                      Risk: {task.risk_level}
                    </span>
                  )}

                  {/* Assigned user — show name from memberMap, or "Unassigned" */}
                  <span>
                    {task.assigned_to
                      ? `Assigned: ${memberMap[task.assigned_to] || `User #${task.assigned_to}`}`
                      : "Unassigned"}
                  </span>

                  {/* Task ID */}
                  <span className="ml-auto font-mono text-gray-400 dark:text-slate-500">
                    #{task.id}
                  </span>
                </div>

                {/* ── Status action buttons ── */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Developer actions: only the ASSIGNED developer sees these */}
                  {task.assigned_to === user?.id &&
                    task.status === "TODO" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition"
                    >
                      {statusLoading === task.id ? "Updating..." : "Start Work"}
                    </button>
                  )}

                  {task.assigned_to === user?.id &&
                    task.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_REVIEW")}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60 transition"
                    >
                      {statusLoading === task.id ? "Updating..." : "Submit for Review"}
                    </button>
                  )}

                  {/* Reviewer actions: Admin or project owner sees these */}
                  {isReviewer &&
                    task.status === "IN_REVIEW" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => {
                        if (task.is_security_sensitive) {
                          setSelectedTask(task);
                        } else {
                          handleStatusChange(task.id, "DONE");
                        }
                      }}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition"
                      title={task.is_security_sensitive ? "Open security checklist to review & approve" : "Approve task"}
                    >
                      {statusLoading === task.id
                        ? "Updating..."
                        : task.is_security_sensitive
                        ? "Security Review & Approve"
                        : "Approve"}
                    </button>
                  )}

                  {isReviewer &&
                    task.status === "IN_REVIEW" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      className="rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 disabled:opacity-60 transition"
                    >
                      {statusLoading === task.id ? "Updating..." : "Request Changes"}
                    </button>
                  )}
                </div>

                {/* ── Assign Task ── */}
                {canManageProject && task.status !== "DONE" && (
                  <div className="mt-3">
                    {assigningTaskId === task.id ? (
                      /* Dropdown is open for this task */
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          defaultValue=""
                          disabled={assignLoading}
                          onChange={(e) => {
                            if (e.target.value) handleAssign(task.id, e.target.value);
                          }}
                          className="rounded-lg border border-gray-300 dark:border-[#272844] bg-white dark:bg-[#131422] px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        >
                          <option value="" disabled>
                            {members.length === 0 ? "No members yet" : "Select a member…"}
                          </option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — {m.role.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => { setAssigningTaskId(null); setAssignError(""); }}
                          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition"
                        >
                          Cancel
                        </button>

                        {assignError && (
                          <span className="text-xs text-red-500 dark:text-red-400">{assignError}</span>
                        )}
                      </div>
                    ) : (
                      /* Show the "Assign" button */
                      <button
                        type="button"
                        onClick={() => { setAssigningTaskId(task.id); setAssignError(""); }}
                        className="text-xs text-[#3A0CA3] dark:text-[#a78bfa] hover:text-[#4812c5] dark:hover:text-[#c4b5fd] transition"
                      >
                        {task.assigned_to ? "Reassign →" : "Assign →"}
                      </button>
                    )}
                  </div>
                )}

                {/* Details & Discussion link */}
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(task)}
                    className="text-xs font-medium text-[#3A0CA3] dark:text-[#a78bfa] transition hover:text-[#4812c5] dark:hover:text-[#c4b5fd]"
                  >
                    View Details & Discussions →
                  </button>
                </div>

                {/* Inline Edit Task Form */}
                {editingTaskId === task.id && (
                  <EditTaskForm
                    task={task}
                    projectId={project.id}
                    token={token}
                    onUpdated={handleTaskUpdated}
                    onCancel={() => setEditingTaskId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjectDetails;
