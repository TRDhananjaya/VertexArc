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
      const data = await createTask(projectId, token, {
        title: title.trim(),
        description: description.trim(),
        priority,
        isSecuritySensitive: securitySensitive,
        riskLevel: securitySensitive ? riskLevel : null
      });

      onCreated(data?.task || { title: title.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 dark:border-[#221c44] bg-white dark:bg-[#0c0d16] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Create New Task
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
          Assign engineering work, define scope and security criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
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
            className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
          >
            Description
          </label>

          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the task"
            className="w-full resize-y rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
          >
            Priority
          </label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-slate-300 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={securitySensitive}
            onChange={(event) =>
              setSecuritySensitive(event.target.checked)
            }
            className="h-4 w-4 rounded accent-[#3A0CA3]"
          />
          Security-sensitive task
        </label>

        {securitySensitive && (
          <div>
            <label
              htmlFor="task-risk"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Security Risk Level
            </label>

            <select
              id="task-risk"
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1c1d30] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTaskForm;
