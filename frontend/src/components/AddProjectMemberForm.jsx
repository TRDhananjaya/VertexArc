import { useEffect, useState } from "react";
import { getEligibleUsers, addProjectMember } from "../api";

function AddProjectMemberForm({
    projectId,
    token,
    existingMembers,
    onAdded,
    onCancel
}) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadUsers() {
            try {
                setLoading(true);
                setError("");

                const data = await getEligibleUsers(projectId, token);

                if (!active) return;

                const allUsers = Array.isArray(data)
                    ? data
                    : data.users;

                if (!Array.isArray(allUsers)) {
                    throw new Error("Invalid users response");
                }

                setUsers(allUsers);
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

        loadUsers();

        return () => {
            active = false;
        };
    }, [projectId, token]);

    const memberIds = new Set(
        (existingMembers || []).map((member) => Number(member.id))
    );

    const availableUsers = users.filter(
        (account) =>
            account.is_active !== false &&
            !memberIds.has(Number(account.id))
    );

    async function handleSubmit(event) {
        event.preventDefault();

        if (!selectedUserId) {
            setError("Please select a user");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await addProjectMember(
                projectId,
                token,
                Number(selectedUserId)
            );

            onAdded();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-5 rounded-xl border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#0c0d16] p-5 shadow-sm"
        >
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                Add Project Member
            </h4>

            {loading ? (
                <p className="text-xs text-gray-500 dark:text-slate-400">
                    Loading eligible users...
                </p>
            ) : (
                <>
                    <label
                        htmlFor="project-member"
                        className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                        Select User
                    </label>

                    <select
                        id="project-member"
                        value={selectedUserId}
                        onChange={(event) =>
                            setSelectedUserId(event.target.value)
                        }
                        disabled={saving || availableUsers.length === 0}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
                    >
                        <option value="">Choose a user</option>

                        {availableUsers.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} — {account.role.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>

                    {availableUsers.length === 0 && !error && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                            No available users to add.
                        </p>
                    )}
                </>
            )}

            {error && (
                <p role="alert" className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-xs font-medium text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                    type="submit"
                    disabled={
                        loading ||
                        saving ||
                        !selectedUserId
                    }
                    className="rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02] disabled:opacity-50"
                >
                    {saving ? "Adding..." : "Add Member"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1c1d30] transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default AddProjectMemberForm;
