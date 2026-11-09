import { useEffect, useState } from "react";
import { getUsers, addProjectMember } from "../api";

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

                const data = await getUsers(token);

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
    }, [token]);

    const memberIds = new Set(
        existingMembers.map((member) => Number(member.id))
    );

    const availableUsers = users.filter(
        (account) =>
            account.is_active &&
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
            className="mb-5 rounded-lg border border-slate-700 bg-slate-950 p-5"
        >
            <h4 className="mb-4 text-lg font-semibold text-white">
                Add Project Member
            </h4>

            {loading ? (
                <p className="text-sm text-slate-400">
                    Loading available users...
                </p>
            ) : (
                <>
                    <label
                        htmlFor="project-member"
                        className="mb-2 block text-sm text-slate-300"
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                    >
                        <option value="">Choose a user</option>

                        {availableUsers.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} — {account.role.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>

                    {availableUsers.length === 0 && !error && (
                        <p className="mt-3 text-sm text-slate-400">
                            No available users to add.
                        </p>
                    )}
                </>
            )}

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            <div className="mt-5 flex gap-3">
                <button
                    type="submit"
                    disabled={
                        loading ||
                        saving ||
                        !selectedUserId
                    }
                    className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                    {saving ? "Adding..." : "Add Member"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default AddProjectMemberForm;
