import { useState } from "react";
import { updateProject } from "../api";

function EditProjectForm({ project, token, onUpdated, onCancel }) {
  const [name, setName] = useState(project.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 150) {
      setError("Project name must contain 1–150 characters.");
      return;
    }

    if (description.trim().length > 5000) {
      setError("Description cannot exceed 5000 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await updateProject(project.id, token, {
        name: trimmedName,
        description: description.trim()
      });

      onUpdated(data.project);
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
          Edit Project
        </h2>

        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
          Update the project name or description.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-project-name"
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
          >
            Project Name
          </label>

          <input
            id="edit-project-name"
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter project name"
            className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        <div>
          <label
            htmlFor="edit-project-description"
            className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
          >
            Description
          </label>

          <textarea
            id="edit-project-description"
            rows={3}
            maxLength={5000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the project"
            className="w-full resize-y rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
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

export default EditProjectForm;
