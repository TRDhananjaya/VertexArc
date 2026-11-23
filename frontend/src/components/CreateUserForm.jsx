import { useState } from "react";
import { createUser } from "../api";

function CreateUserForm({ token, onCreated, onCancel }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("DEVELOPER");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createUser(token, {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role
            });

            onCreated();
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
                    Create New User
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    Provision credentials and role access for a new engineering team member.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="user-name"
                        className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                        Full Name
                    </label>

                    <input
                        id="user-name"
                        type="text"
                        required
                        maxLength={100}
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="user-email"
                        className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                        Email Address
                    </label>

                    <input
                        id="user-email"
                        type="email"
                        required
                        maxLength={255}
                        autoComplete="off"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="user-password"
                        className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                        Initial Password
                    </label>

                    <input
                        id="user-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
                    />

                    <p className="mt-1.5 text-[11px] text-gray-400 dark:text-slate-500">
                        At least 8 characters. Maximum 72 UTF-8 bytes.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="user-role"
                        className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                        Role
                    </label>

                    <select
                        id="user-role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#272844] bg-gray-50 dark:bg-[#131422] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#3A0CA3] focus:ring-2 focus:ring-[#3A0CA3]/20"
                    >
                        <option value="DEVELOPER">Developer</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                    </select>
                </div>

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
                        {loading ? "Creating..." : "Create User"}
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

export default CreateUserForm;
