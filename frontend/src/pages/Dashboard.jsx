import { useEffect, useState } from "react";
import { getProjects } from "../api";
import CreateProjectForm from "../components/CreateProjectForm";
import Navbar from "../components/Navbar";

function Dashboard({
    token,
    user,
    onLogout,
    onSelectProject,
    onOpenUserManagement,
    onOpenAuditLogs,
    theme,
    onToggleTheme
}) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const canCreateProject =
        user?.role === "ADMIN" ||
        user?.role === "PROJECT_MANAGER";

    useEffect(() => {
        let active = true;

        async function loadProjects() {
            setLoading(true);
            setError("");

            try {
                const data = await getProjects(token);

                if (!active) return;

                if (!Array.isArray(data?.projects)) {
                    throw new Error(
                        "Invalid projects response from server"
                    );
                }

                setProjects(data.projects);

            } catch (err) {
                if (active) {
                    setError(err.message);
                    setProjects([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProjects();

        return () => {
            active = false;
        };

    }, [token, refreshKey]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">

            <Navbar
                user={user}
                onLogout={onLogout}
                onOpenUserManagement={onOpenUserManagement}
                onOpenAuditLogs={onOpenAuditLogs}
                theme={theme}
                onToggleTheme={onToggleTheme}
            />

            <main className="mx-auto max-w-6xl px-6 py-10">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        Dashboard
                    </h2>

                    <p className="mt-2 text-gray-500 dark:text-slate-400">
                        Your projects and development workspace
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                    <h3 className="text-xl font-semibold">
                        Your Projects
                    </h3>

                    {canCreateProject && (
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                            + New Project
                        </button>
                    )}

                </div>

                {showCreateForm && canCreateProject && (
                    <CreateProjectForm
                        token={token}
                        onCreated={() => {
                            setShowCreateForm(false);
                            setRefreshKey((current) => current + 1);
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                )}

                {loading && (
                    <p className="text-gray-500 dark:text-slate-400">
                        Loading projects...
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-gray-500 dark:text-slate-400">
                        No projects found.
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {projects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => onSelectProject(project)}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left transition hover:border-emerald-500/50 focus-visible:outline-2 focus-visible:outline-emerald-400"
                            >
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                </h4>

                                <p className="mt-3 line-clamp-3 text-sm text-gray-500 dark:text-slate-400">
                                    {project.description ||
                                        "No description provided."}
                                </p>

                                <div className="mt-5 border-t border-gray-200 dark:border-slate-800 pt-4">
                                    <span className="text-xs text-gray-500 dark:text-slate-500">
                                        Project ID: {project.id}
                                    </span>
                                </div>

                            </button>
                        ))}

                    </div>
                )}

            </main>
        </div>
    );
}

export default Dashboard;
