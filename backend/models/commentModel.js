const pool = require("../db");

// Retrieve comments with the name of each author
async function getCommentsForTask(taskId) {
    const result = await pool.query(
        `SELECT c.id, c.task_id, c.user_id,
                u.name AS author_name,
                c.content, c.created_at
         FROM task_comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.task_id = $1
         ORDER BY c.created_at ASC, c.id ASC
         LIMIT 100`,
        [taskId]
    );

    return result.rows;
}

// Add a comment and return it with author information
async function createComment(taskId, userId, content) {
    const result = await pool.query(
        `WITH inserted AS (
            INSERT INTO task_comments (task_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, task_id, user_id, content, created_at
         )
         SELECT i.id, i.task_id, i.user_id,
                u.name AS author_name,
                i.content, i.created_at
         FROM inserted i
         JOIN users u ON u.id = i.user_id`,
        [taskId, userId, content]
    );

    return result.rows[0];
}

module.exports = {
    getCommentsForTask,
    createComment
};
