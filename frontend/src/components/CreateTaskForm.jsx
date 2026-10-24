import { useState } from "react";
import { createTask } from "../api";

function CreateTaskForm({ projectId, token, onCreated, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [securitySensitive, setSecuritySensitive] = useState(false);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await createTask(projectId, token, {
        title: title.trim(),
        description: description.trim(),
        priority,
        is_security_sensitive: securitySensitive,
        risk_level: securitySensitive ? riskLevel : "LOW"
      });

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h3 className="mb-5 text-xl font-semibold">
        Create New Task
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="task-title"
            className="mb-2 block text-sm text-slate-300"
          >
            Task Title
          </label>

          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter task title"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="mb-2 block text-sm text-slate-300"
          >
            Description
          </label>

          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the task"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="mb-2 block text-sm text-slate-300"
          >
            Priority
          </label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={securitySensitive}
            onChange={(event) =>
              setSecuritySensitive(event.target.checked)
            }
            className="h-4 w-4 accent-emerald-500"
          />

          Security-sensitive task
        </label>

        {securitySensitive && (
          <div>
            <label
              htmlFor="task-risk"
              className="mb-2 block text-sm text-slate-300"
            >
              Security Risk Level
            </label>

            <select
              id="task-risk"
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTaskForm;
