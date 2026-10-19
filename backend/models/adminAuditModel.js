const pool = require("../db");

// Retrieve recent project changes, including deleted projects
async function getProjectAuditLogs() {
    const result = await pool.query(
        `SELECT
            log.id,
            log.project_id,
            p.name AS project_name,
            log.actor_id,
            u.name AS actor_name,
            u.email AS actor_email,
            log.action,
            log.old_value,
            log.new_value,
            log.created_at
         FROM project_audit_logs log
         JOIN projects p ON p.id = log.project_id
         LEFT JOIN users u ON u.id = log.actor_id
         ORDER BY log.created_at DESC, log.id DESC
         LIMIT 100`
    );

    return result.rows;
}

// Retrieve recent task changes, including deleted tasks
async function getTaskAuditLogs() {
    const result = await pool.query(
        `SELECT
            log.id,
            log.task_id,
            t.title AS task_title,
            t.project_id,
            log.actor_id,
            u.name AS actor_name,
            u.email AS actor_email,
            log.action,
            log.old_value,
            log.new_value,
            log.created_at
         FROM task_audit_logs log
         JOIN tasks t ON t.id = log.task_id
         LEFT JOIN users u ON u.id = log.actor_id
         ORDER BY log.created_at DESC, log.id DESC
         LIMIT 100`
    );

    return result.rows;
}

module.exports = {
    getProjectAuditLogs,
    getTaskAuditLogs
};
