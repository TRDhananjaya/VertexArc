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

    // GET /api/users is currently Admin-only.
    // We'll enable Project Managers after adding a
    // restricted user-selection endpoint.
    const canShowAddForm =
        canManageMembers && user?.role === "ADMIN";

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
        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">
                    Project Members
                </h3>

                {canShowAddForm && !showAddForm && (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                        + Add Member
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
                <p className="text-sm text-slate-400">
                    Loading project members...
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm text-red-400">
                    {error}
                </p>
            )}

            {!loading && !error && members.length === 0 && (
                <p className="text-sm text-slate-400">
                    No members found.
                </p>
            )}

            {!loading && !error && members.length > 0 && (
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                        >
                            <div>
                                <p className="font-medium text-white">
                                    {member.name}
                                </p>

                                <p className="text-sm text-slate-400">
                                    {member.email}
                                </p>
                            </div>

                            <span className="rounded-md bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
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
