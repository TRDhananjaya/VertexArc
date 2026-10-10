// Database queries for the projects table.
const pool = require("../db");

// Create a project and add the creator as the first member.
// Uses a transaction so both INSERTs succeed or fail together.
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

        // Add the creator as a member of the new project
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
        client.release(); // Always return the connection to the pool
    }
}

// Get projects for a user:
//   - Admins see all projects
//   - Other users only see projects they are a member of
async function getProjectsForUser(userId, isAdmin) {
    let result;

    if (isAdmin) {
        result = await pool.query(`
            SELECT p.id, p.name, p.description, p.created_by,
                   p.created_at, p.updated_at,
                   u.name AS creator_name
            FROM projects p
            JOIN users u ON u.id = p.created_by
            ORDER BY p.created_at DESC
        `);
    } else {
        result = await pool.query(
            `SELECT p.id, p.name, p.description, p.created_by,
                    p.created_at, p.updated_at,
                    u.name AS creator_name
             FROM projects p
             JOIN users u ON u.id = p.created_by
             JOIN project_members pm ON pm.project_id = p.id
             WHERE pm.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );
    }

    return result.rows;
}

module.exports = { createProject, getProjectsForUser };
