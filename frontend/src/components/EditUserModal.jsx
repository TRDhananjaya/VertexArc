import { useState } from "react";
import { updateUser } from "../api";
import { ShieldCheckIcon, AlertCircleIcon } from "./Icons";

function EditUserModal({ userToEdit, currentUser, token, onUpdated, onClose }) {
  const [name, setName] = useState(userToEdit.name || "");
  const [email, setEmail] = useState(userToEdit.email || "");
  const [role, setRole] = useState(userToEdit.role || "DEVELOPER");
  const [isActive, setIsActive] = useState(userToEdit.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSelf = currentUser?.id === userToEdit.id;

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length > 100) {
      setError("Name must contain 1–100 characters.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (isSelf && !isActive) {
      setError("You cannot deactivate your own administrator account.");
      return;
    }

    if (isSelf && role !== "ADMIN") {
      setError("You cannot demote your own administrator account.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await updateUser(token, userToEdit.id, {
        name: trimmedName,
        email: trimmedEmail,
        role,
        is_active: isActive
      });

      onUpdated(data.user || { ...userToEdit, name: trimmedName, email: trimmedEmail, role, is_active: isActive });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-200/90 dark:border-[#2a1754] bg-white dark:bg-[#0c0d16] p-6 shadow-2xl shadow-slate-300/60 dark:shadow-[0_0_60px_-10px_rgba(58,12,163,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1c1d30] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs">
              {userToEdit.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Edit User Account
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                User #{userToEdit.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#131422] transition"
          >
            <span className="text-base font-semibold leading-none">&times;</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="edit-user-name"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Full Name
            </label>
            <input
              id="edit-user-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="edit-user-email"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <input
              id="edit-user-email"
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="edit-user-role"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Access Role
            </label>
            <select
              id="edit-user-role"
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20 disabled:opacity-60"
            >
              <option value="DEVELOPER">Developer (Workspace member, task owner)</option>
              <option value="PROJECT_MANAGER">Project Manager (Project creator, task manager)</option>
              <option value="ADMIN">System Administrator (Full access)</option>
            </select>
            {isSelf && (
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                You cannot change your own role.
              </p>
            )}
          </div>

          {/* Status Toggle (Active / Inactive) */}
          <div className="rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50/70 dark:bg-[#131422]/70 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Account Status
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  {isActive
                    ? "User can log in and access assigned projects."
                    : "Account is disabled. User cannot log in."}
                </p>
              </div>

              <button
                type="button"
                disabled={isSelf}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={isActive}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {isSelf && (
              <p className="mt-2 text-[11px] text-amber-500 dark:text-amber-400">
                You cannot deactivate your own administrator account.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500 dark:text-red-400 font-medium"
            >
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#1c1d30]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 dark:border-[#272844] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02] disabled:opacity-50"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
