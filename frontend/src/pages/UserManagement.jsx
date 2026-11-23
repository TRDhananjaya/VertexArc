import { useEffect, useState } from "react";
import { getUsers } from "../api";
import CreateUserForm from "../components/CreateUserForm";
import Navbar from "../components/Navbar";

function UserManagement({ token, user, onBack, onGoDashboard, onToggleSidebar }) {
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
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-white">
            <Navbar
                user={user}
                onGoDashboard={onGoDashboard}
                subtitle="Administration / User Management"
                onToggleSidebar={onToggleSidebar}
            />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 text-sm text-[#3A0CA3] dark:text-[#a78bfa] hover:text-[#4812c5] dark:hover:text-[#c4b5fd] font-medium"
                >
                    ← Back to Dashboard
                </button>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 dark:border-[#1c1d30] pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            Manage VertexArc team accounts, access roles, and status
                        </p>
                    </div>

                    {!showCreateForm && (
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02]"
                        >
                            <span>+</span>
                            <span>Create User</span>
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
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Team Members
                    </h2>

                    {!loading && !error && (
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                            {users.length} user{users.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {loading && (
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                        Loading users...
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-500 dark:text-red-400"
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
                    <div className="rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-8 text-center text-xs text-gray-500 dark:text-slate-400">
                        No users found.
                    </div>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="space-y-3">
                        {users.map((account) => (
                            <div
                                key={account.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                        {account.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {account.name}
                                        </h3>

                                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                            {account.email}
                                        </p>

                                        <p className="font-mono text-[10px] text-gray-400 dark:text-slate-500">
                                            User #{account.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                                        {account.role?.replaceAll("_", " ")}
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${account.is_active
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
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
