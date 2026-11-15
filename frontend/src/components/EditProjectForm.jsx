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
    <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-white">
          Edit Project
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Update the project name or description.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-project-name"
            className="mb-2 block text-sm text-slate-300"
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
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="edit-project-description"
            className="mb-2 block text-sm text-slate-300"
          >
            Description
          </label>

          <textarea
            id="edit-project-description"
            rows={4}
            maxLength={5000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the project"
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
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

export default EditProjectForm;
