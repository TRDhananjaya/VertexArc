// Database queries for the projects table.
const pool = require("../db");

// Create a project and automatically add its creator as a member.
// The transaction ensures both database operations succeed together.
async function createProject({ name, description, userId }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const projectResult = await client.query(
            `INSERT INTO projects (name, description, created_by)
             VALUES ($1, $2, $3)
             RETURNING id, name, description, created_by,
                       created_at, updated_at`,
            [name, description, userId]
        );

        const project = projectResult.rows[0];

        // Automatically add the creator to the project
        await client.query(
            `INSERT INTO project_members (project_id, user_id)
             VALUES ($1, $2)`,
            [project.id, userId]
        );

        await client.query("COMMIT");

        return project;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Admins can view all active projects.
// Other users see only active projects they joined.
async function getProjectsForUser(userId, isAdmin) {
    let result;

    if (isAdmin) {
        result = await pool.query(
            `SELECT p.id, p.name, p.description, p.created_by,
                    p.created_at, p.updated_at,
                    u.name AS creator_name
             FROM projects p
             JOIN users u ON u.id = p.created_by
             WHERE p.deleted_at IS NULL
             ORDER BY p.created_at DESC`
        );
    } else {
        result = await pool.query(
            `SELECT p.id, p.name, p.description, p.created_by,
                    p.created_at, p.updated_at,
                    u.name AS creator_name
             FROM projects p
             JOIN users u ON u.id = p.created_by
             JOIN project_members pm ON pm.project_id = p.id
             WHERE pm.user_id = $1
               AND p.deleted_at IS NULL
             ORDER BY p.created_at DESC`,
            [userId]
        );
    }

    return result.rows;
}

// Find an active project using its ID
async function findProjectById(projectId) {
    const result = await pool.query(
        `SELECT id, name, created_by
         FROM projects
         WHERE id = $1
           AND deleted_at IS NULL`,
        [projectId]
    );

    return result.rows[0] || null;
}

// Check whether a user belongs to an active project
async function isProjectMember(projectId, userId) {
    const result = await pool.query(
        `SELECT 1
         FROM project_members pm
         JOIN projects p ON p.id = pm.project_id
         WHERE pm.project_id = $1
           AND pm.user_id = $2
           AND p.deleted_at IS NULL`,
        [projectId, userId]
    );

    return result.rows.length > 0;
}

// Get members only when the project has not been deleted
async function getMembersForProject(projectId) {
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.role
         FROM project_members pm
         JOIN projects p ON p.id = pm.project_id
         JOIN users u ON u.id = pm.user_id
         WHERE pm.project_id = $1
           AND p.deleted_at IS NULL
         ORDER BY u.name`,
        [projectId]
    );

    return result.rows;
}

// Add an existing user only to an active project
async function addMemberToProject(projectId, userId) {
    const result = await pool.query(
        `INSERT INTO project_members (project_id, user_id)
         SELECT p.id, $2
         FROM projects p
         WHERE p.id = $1
           AND p.deleted_at IS NULL
         RETURNING project_id, user_id`,
        [projectId, userId]
    );

    return result.rows[0] || null;
}

// Update project details without changing its creator
async function updateProjectDetails(projectId, name, description) {
    const result = await pool.query(
        `UPDATE projects
         SET name = $1,
             description = $2,
             updated_at = NOW()
         WHERE id = $3
           AND deleted_at IS NULL
         RETURNING id, name, description, created_by, updated_at`,
        [name, description, projectId]
    );

    return result.rows[0] || null;
}

// Soft-delete a project while preserving its tasks and audit history
async function softDeleteProject(projectId) {
    const result = await pool.query(
        `UPDATE projects
         SET deleted_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
           AND deleted_at IS NULL
         RETURNING id, name, created_by, deleted_at`,
        [projectId]
    );

    return result.rows[0] || null;
}

module.exports = {
    createProject,
    getProjectsForUser,
    findProjectById,
    isProjectMember,
    getMembersForProject,
    addMemberToProject,
    updateProjectDetails,
    softDeleteProject
};
