import { useState } from "react";
import { updateProfile } from "../api";
import { ShieldCheckIcon, AlertCircleIcon, KeyIcon } from "./Icons";

function ProfileModal({ user, token, onProfileUpdated, onClose }) {
  const [name, setName] = useState(user?.name || "");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError("Name must contain 1–100 characters.");
      return;
    }

    const updates = {};
    if (trimmedName !== user.name) {
      updates.name = trimmedName;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        setError("Please enter your current password to verify your identity.");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      updates.currentPassword = currentPassword;
      updates.newPassword = newPassword;
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await updateProfile(token, updates);
      onProfileUpdated(data.user || { ...user, name: trimmedName });
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
      <div className="w-full max-w-md rounded-2xl border border-gray-200/90 dark:border-[#2a1754] bg-white dark:bg-[#0c0d16] p-6 shadow-2xl shadow-slate-300/60 dark:shadow-[0_0_60px_-10px_rgba(58,12,163,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1c1d30] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3A0CA3] to-[#4c1d95] text-white font-bold text-xs shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                Update your personal profile and security credentials
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
          {/* Email (Read-only) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-100/70 dark:bg-[#131422]/60 px-3.5 py-2 text-xs text-gray-500 dark:text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          {/* Role (Read-only RBAC badge) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Assigned Role
            </label>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50/70 dark:bg-[#131422]/60 px-3.5 py-2">
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {user?.role?.replaceAll("_", " ")}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                Managed by Admin
              </span>
            </div>
          </div>

          {/* Name (Editable) */}
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
            />
          </div>

          {/* Password Section Toggle */}
          <div className="pt-2">
            {!showPasswordChange ? (
              <button
                type="button"
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#3A0CA3] dark:text-[#a78bfa] hover:underline"
              >
                <KeyIcon className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50/70 dark:bg-[#131422]/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#0c0d16] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#3A0CA3]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-700 dark:text-slate-300">
                    New Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#0c0d16] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#3A0CA3]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#0c0d16] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#3A0CA3]"
                  />
                </div>
              </div>
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

          {/* Action Buttons */}
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
              <span>{loading ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
