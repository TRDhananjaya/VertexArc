import { useEffect, useState } from "react";
import { getProjectMembers } from "../api";
import AddProjectMemberForm from "./AddProjectMemberForm";

function ProjectMembers({ projectId, token, user, project }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const canManageMembers =
        user?.role === "ADMIN" ||
        (
            user?.role === "PROJECT_MANAGER" &&
            project?.created_by != null &&
            String(project.created_by) === String(user.id)
        );

    // Eligible users endpoint allows both Admins and Project Managers who created the project
    const canShowAddForm = canManageMembers;

    useEffect(() => {
        let active = true;

        async function loadMembers() {
            try {
                setLoading(true);
                setError("");

                const data = await getProjectMembers(projectId, token);

                if (!active) return;

                const memberList = Array.isArray(data)
                    ? data
                    : data.members;

                if (!Array.isArray(memberList)) {
                    throw new Error("Invalid members response");
                }

                setMembers(memberList);
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

        loadMembers();

        return () => {
            active = false;
        };
    }, [projectId, token, refreshKey]);

    return (
        <section className="mb-8 rounded-2xl border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Project Members
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                        Engineers and managers collaborating on this workspace
                    </p>
                </div>

                {canShowAddForm && !showAddForm && (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#3A0CA3]/25 transition hover:scale-[1.02]"
                    >
                        <span>+</span>
                        <span>Add Member</span>
                    </button>
                )}
            </div>

            {showAddForm && canShowAddForm && (
                <AddProjectMemberForm
                    projectId={projectId}
                    token={token}
                    existingMembers={members}
                    onAdded={() => {
                        setShowAddForm(false);
                        setRefreshKey((value) => value + 1);
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {loading && (
                <p className="text-xs text-gray-500 dark:text-slate-400">
                    Loading project members...
                </p>
            )}

            {error && (
                <p role="alert" className="text-xs text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}

            {!loading && !error && members.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-slate-400">
                    No members assigned to this project yet.
                </p>
            )}

            {!loading && !error && members.length > 0 && (
                <div className="space-y-2.5">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-[#1c1d30] bg-gray-50/70 dark:bg-[#050505] p-3.5 transition"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                    {member.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {member.name}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                        {member.email}
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full border border-gray-200 dark:border-[#272844] bg-white dark:bg-[#131422] px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                                {member.role?.replaceAll("_", " ")}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ProjectMembers;
