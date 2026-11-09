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
        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-5 text-xl font-semibold">
                Create New User
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="user-name"
                        className="mb-2 block text-sm text-slate-300"
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="user-email"
                        className="mb-2 block text-sm text-slate-300"
                    >
                        Email
                    </label>

                    <input
                        id="user-email"
                        type="email"
                        required
                        maxLength={255}
                        autoComplete="off"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="user-password"
                        className="mb-2 block text-sm text-slate-300"
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        At least 8 characters. Maximum 72 UTF-8 bytes.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="user-role"
                        className="mb-2 block text-sm text-slate-300"
                    >
                        Role
                    </label>

                    <select
                        id="user-role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                    >
                        <option value="DEVELOPER">Developer</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                    </select>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                    >
                        {loading ? "Creating..." : "Create User"}
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

export default CreateUserForm;
