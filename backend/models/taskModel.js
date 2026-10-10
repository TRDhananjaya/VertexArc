const pool = require("../db");

// Create a task inside a project
async function createTask({ projectId, title, description, priority, userId }) {
    const result = await pool.query(
        `INSERT INTO tasks (
            project_id, title, description, priority, created_by
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, project_id, title, description, status,
                   priority, created_by, created_at, updated_at`,
        [projectId, title, description, priority, userId]
    );

    return result.rows[0];
}

// Get all tasks in a project with creator and assignee details
async function getTasksForProject(projectId) {
    const result = await pool.query(
        `SELECT t.id, t.project_id, t.title, t.description,
                t.status, t.priority, t.created_by,
                t.assigned_to, t.created_at, t.updated_at,
                creator.name AS creator_name,
                assignee.name AS assignee_name
         FROM tasks t
         JOIN users creator ON creator.id = t.created_by
         LEFT JOIN users assignee ON assignee.id = t.assigned_to
         WHERE t.project_id = $1
         ORDER BY t.created_at DESC, t.id DESC`,
        [projectId]
    );

    return result.rows;
}

// Find a task and its current workflow details
async function findTaskById(taskId, projectId) {
    const result = await pool.query(
        `SELECT id, project_id, title, status, assigned_to
         FROM tasks
         WHERE id = $1 AND project_id = $2`,
        [taskId, projectId]
    );

    return result.rows[0] || null;
}

// Assign a task to a user
async function assignTask(taskId, projectId, userId) {
    const result = await pool.query(
        `UPDATE tasks
         SET assigned_to = $1,
             updated_at = NOW()
         WHERE id = $2 AND project_id = $3
         RETURNING id, project_id, title, assigned_to, updated_at`,
        [userId, taskId, projectId]
    );

    return result.rows[0] || null;
}

// Update a task's status only if it still has the expected status
async function updateTaskStatus(taskId, projectId, currentStatus, newStatus) {
    const result = await pool.query(
        `UPDATE tasks
         SET status = $1,
             updated_at = NOW()
         WHERE id = $2
           AND project_id = $3
           AND status = $4
         RETURNING id, project_id, title, status,
                   assigned_to, updated_at`,
        [newStatus, taskId, projectId, currentStatus]
    );

    return result.rows[0] || null;
}

module.exports = {
    createTask,
    getTasksForProject,
    findTaskById,
    assignTask,
    updateTaskStatus,
};
