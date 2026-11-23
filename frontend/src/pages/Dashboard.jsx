import { useEffect, useState } from "react";
import { getProjects } from "../api";
import CreateProjectForm from "../components/CreateProjectForm";
import Navbar from "../components/Navbar";

function Dashboard({
    token,
    user,
    onSelectProject,
    onToggleSidebar,
    showToast
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
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-white">

            <Navbar
                user={user}
                onToggleSidebar={onToggleSidebar}
            />

            <main className="mx-auto max-w-6xl px-6 py-10">

                {/* Page Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 dark:border-[#1c1d30] pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Projects
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            Workspaces and active backlogs for your development teams
                        </p>
                    </div>

                    {canCreateProject && (
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02]"
                        >
                            <span>+</span>
                            <span>New Project</span>
                        </button>
                    )}
                </div>

                {showCreateForm && canCreateProject && (
                    <CreateProjectForm
                        token={token}
                        onCreated={(newProject) => {
                            setShowCreateForm(false);
                            setRefreshKey((current) => current + 1);
                            if (showToast) {
                                showToast(
                                    "Project Created",
                                    `Project "${newProject?.name || "New Workspace"}" created successfully!`
                                );
                            }
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                )}

                {loading && (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Loading projects...
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-500 dark:text-red-400"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                        No projects found. Create your first project workspace to get started.
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {projects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => onSelectProject(project)}
                                className="group w-full rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 text-left transition hover:border-[#3A0CA3] hover:shadow-lg hover:shadow-[#3A0CA3]/10 focus-visible:outline-2 focus-visible:outline-[#3A0CA3]"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-[#3A0CA3] dark:group-hover:text-[#a78bfa] transition-colors">
                                        {project.name}
                                    </h2>
                                </div>

                                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                    {project.description ||
                                        "No description provided."}
                                </p>

                                <div className="mt-5 border-t border-gray-100 dark:border-[#1c1d30] pt-3.5 flex items-center justify-between">
                                    <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
                                        ID #{project.id}
                                    </span>
                                    <span className="text-xs font-medium text-[#3A0CA3] dark:text-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open workspace →
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
