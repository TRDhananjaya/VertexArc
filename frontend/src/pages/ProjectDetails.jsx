import { useEffect, useState } from "react";
import { getProjectTasks } from "../api";
import CreateTaskForm from "../components/CreateTaskForm";
import ProjectMembers from "../components/ProjectMembers";

function ProjectDetails({ project, token, user, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Admins can create tasks in any project.
  // Project Managers can create tasks in projects they created.
  const canCreateTask =
    user?.role === "ADMIN" ||
    (user?.role === "PROJECT_MANAGER" &&
      project.created_by != null &&
      user.id != null &&
      String(project.created_by) === String(user.id));

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
          <h2 className="text-3xl font-bold">
            {project.name}
          </h2>

          <p className="mt-3 text-slate-400">
            {project.description || "No description provided."}
          </p>
        </div>

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
                    <h4 className="text-lg font-semibold">
                      {task.title}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  {/* Task status */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status] ||
                      statusStyles.TODO
                      }`}
                  >
                    {task.status?.replaceAll("_", " ") || "UNKNOWN"}
                  </span>
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

                  {/* Task ID */}
                  <span className="ml-auto text-xs text-slate-500">
                    Task #{task.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjectDetails;
