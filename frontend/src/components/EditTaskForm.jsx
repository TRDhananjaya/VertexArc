import { useState } from "react";
import { updateTaskDetails } from "../api";

// EditTaskForm — pre-filled with the current task values.
// Props:
//   task    — the task object being edited ({ id, title, description, priority })
//   projectId — needed for the API call URL
//   token   — JWT for authorization
//   onUpdated(updatedTask) — called after a successful save
//   onCancel — called when the user dismisses the form without saving
function EditTaskForm({ task, projectId, token, onUpdated, onCancel }) {
  // Initialize form state from the existing task values
  // This is the same "initializing state from props" pattern we used in EditProjectForm
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "MEDIUM");
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
      const data = await updateTaskDetails(projectId, task.id, token, {
        title: title.trim(),
        description: description.trim(),
        priority
      });

      // Pass the updated task back up to ProjectDetails so the card refreshes
      onUpdated(data.task);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50/70 dark:bg-[#0c0d16] p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">
        Edit Task #{task.id}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Title */}
        <div>
          <label
            htmlFor={`edit-task-title-${task.id}`}
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400"
          >
            Title
          </label>

          <input
            id={`edit-task-title-${task.id}`}
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor={`edit-task-desc-${task.id}`}
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400"
          >
            Description
          </label>

          <textarea
            id={`edit-task-desc-${task.id}`}
            rows={3}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor={`edit-task-priority-${task.id}`}
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400"
          >
            Priority
          </label>

          <select
            id={`edit-task-priority-${task.id}`}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1c1d30] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTaskForm;
