import { useEffect, useState } from "react";
import { getUsers } from "../api";
import CreateUserForm from "../components/CreateUserForm";

function UserManagement({ token, onBack }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        async function loadUsers() {
            setLoading(true);
            setError("");

            try {
                const data = await getUsers(token);

                if (!active) return;

                const userList = Array.isArray(data)
                    ? data
                    : data.users;

                if (!Array.isArray(userList)) {
                    throw new Error("Unexpected users API response format");
                }

                setUsers(userList);
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
    }, [token, refreshKey]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-slate-800 bg-slate-900">
                <div className="mx-auto max-w-6xl px-6 py-5">
                    <h1 className="text-2xl font-bold text-emerald-400">
                        VertexArc
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 text-sm text-emerald-400 hover:text-emerald-300"
                >
                    ← Back to Dashboard
                </button>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">
                            User Management
                        </h2>

                        <p className="mt-2 text-slate-400">
                            Manage VertexArc team accounts.
                        </p>
                    </div>

                    {!showCreateForm && (
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                            + Create User
                        </button>
                    )}
                </div>

                {showCreateForm && (
                    <CreateUserForm
                        token={token}
                        onCreated={() => {
                            setShowCreateForm(false);
                            setRefreshKey((current) => current + 1);
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                )}

                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                        Team Members
                    </h3>

                    {!loading && !error && (
                        <span className="text-sm text-slate-400">
                            {users.length} user{users.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {loading && (
                    <p className="text-slate-400">
                        Loading users...
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
                    >
                        {error}

                        <button
                            type="button"
                            onClick={() =>
                                setRefreshKey((current) => current + 1)
                            }
                            className="ml-4 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && users.length === 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                        No users found.
                    </div>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="space-y-4">
                        {users.map((account) => (
                            <div
                                key={account.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                            >
                                <div>
                                    <h4 className="font-semibold">
                                        {account.name}
                                    </h4>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {account.email}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        User #{account.id}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="rounded-md bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                        {account.role?.replaceAll("_", " ")}
                                    </span>

                                    <span
                                        className={`rounded-md px-3 py-1 text-xs font-medium ${account.is_active
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {account.is_active ? "Active" : "Inactive"}
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

export default UserManagement;
