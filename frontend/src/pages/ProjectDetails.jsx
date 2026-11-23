import { useEffect, useState } from "react";
import { getProjectTasks, deleteProject, updateTaskStatus, assignTask, getProjectMembers, deleteTask } from "../api";
import CreateTaskForm from "../components/CreateTaskForm";
import EditProjectForm from "../components/EditProjectForm";
import EditTaskForm from "../components/EditTaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import ProjectMembers from "../components/ProjectMembers";
import TaskDetail from "./TaskDetail";

function ProjectDetails({ project: initialProject, token, user, onBack }) {
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
    TODO: "bg-slate-700 text-slate-200",
    IN_PROGRESS: "bg-blue-500/15 text-blue-400",
    IN_REVIEW: "bg-amber-500/15 text-amber-400",
    DONE: "bg-emerald-500/15 text-emerald-400"
  };

  // Task priority colors
  const priorityStyles = {
    LOW: "text-slate-400",
    MEDIUM: "text-amber-400",
    HIGH: "text-red-400"
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
        onBack={() => setSelectedTask(null)}
        onTaskUpdated={(updatedTask) => {
          setSelectedTask(updatedTask);
          handleTaskUpdated(updatedTask);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-bold text-emerald-400">
            VertexArc
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Dashboard
        </button>

        {/* Project information */}
        <div className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                {project.name}
              </h2>

              <p className="mt-3 text-slate-400">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Edit / Delete buttons — only for authorized users */}
            {canManageProject && !showEditForm && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Edit Project
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
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
            <h3 className="text-xl font-semibold">
              Project Tasks
            </h3>

            {!loading && !error && (
              <p className="mt-1 text-sm text-slate-400">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Only authorized users can see this button */}
          {canCreateTask && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              + New Task
            </button>
          )}
        </div>

        {/* Create Task form */}
        {canCreateTask && showCreateForm && (
          <CreateTaskForm
            projectId={project.id}
            token={token}
            onCreated={() => {
              setShowCreateForm(false);
              setRefreshKey((current) => current + 1);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Loading state */}
        {loading && (
          <p className="text-slate-400">
            Loading tasks...
          </p>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            {error}
          </div>
        )}

        {/* Status change error */}
        {statusError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            {statusError}
          </div>
        )}

        {/* Empty task list */}
        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No tasks found in this project.
          </div>
        )}

        {/* Task cards */}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer text-lg font-semibold text-white transition hover:text-emerald-400"
                      title="Click to view full details and discussions"
                    >
                      {task.title}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Task status */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status] ||
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
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                        >
                          {editingTaskId === task.id ? "Close" : "Edit"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTaskError("");
                            setDeleteTaskTarget(task);
                          }}
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task details */}
                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-4 text-sm">
                  {/* Priority */}
                  <span
                    className={
                      priorityStyles[task.priority] ||
                      "text-slate-400"
                    }
                  >
                    Priority: {task.priority || "Not set"}
                  </span>

                  {/* Security-sensitive indicator */}
                  {task.is_security_sensitive && (
                    <span className="rounded-md bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                      Security Sensitive
                    </span>
                  )}

                  {/* Security risk level */}
                  {task.risk_level && (
                    <span className="text-slate-400">
                      Risk: {task.risk_level}
                    </span>
                  )}

                  {/* Assigned user — show name from memberMap, or "Unassigned" */}
                  <span className="text-slate-500">
                    {task.assigned_to
                      ? `Assigned: ${memberMap[task.assigned_to] || `User #${task.assigned_to}`}`
                      : "Unassigned"}
                  </span>

                  {/* Task ID */}
                  <span className="ml-auto text-xs text-slate-500">
                    Task #{task.id}
                  </span>
                </div>

                {/* ── Status action buttons ── */}
                {/* These buttons implement the task workflow state machine.
                    Which buttons appear depends on:
                    1. The task's current status
                    2. Whether the logged-in user is the assigned developer
                    3. Whether the logged-in user is a reviewer (Admin / project owner)
                */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {/* Developer actions: only the ASSIGNED developer sees these */}
                  {/* TODO → IN_PROGRESS: "Start Work" */}
                  {task.assigned_to === user?.id &&
                    task.status === "TODO" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 disabled:opacity-60"
                    >
                      {statusLoading === task.id ? "Updating..." : "Start Work"}
                    </button>
                  )}

                  {/* IN_PROGRESS → IN_REVIEW: "Submit for Review" */}
                  {task.assigned_to === user?.id &&
                    task.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_REVIEW")}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
                    >
                      {statusLoading === task.id ? "Updating..." : "Submit for Review"}
                    </button>
                  )}

                  {/* Reviewer actions: Admin or project owner sees these */}
                  {/* IN_REVIEW → DONE: "Approve" */}
                  {isReviewer &&
                    task.status === "IN_REVIEW" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "DONE")}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {statusLoading === task.id ? "Updating..." : "Approve"}
                    </button>
                  )}

                  {/* IN_REVIEW → IN_PROGRESS: "Request Changes" */}
                  {isReviewer &&
                    task.status === "IN_REVIEW" && (
                    <button
                      type="button"
                      disabled={statusLoading === task.id}
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      className="rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 disabled:opacity-60"
                    >
                      {statusLoading === task.id ? "Updating..." : "Request Changes"}
                    </button>
                  )}
                </div>

                {/* ── Assign Task ── */}
                {/* Only reviewers (Admin / PM owner) can assign tasks.
                    We show an "Assign" button that expands into a dropdown of project members. */}
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
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white"
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
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>

                        {assignError && (
                          <span className="text-xs text-red-400">{assignError}</span>
                        )}
                      </div>
                    ) : (
                      /* Show the "Assign" button */
                      <button
                        type="button"
                        onClick={() => { setAssigningTaskId(task.id); setAssignError(""); }}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
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
                    className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
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
