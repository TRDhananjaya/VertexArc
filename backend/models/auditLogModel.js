const pool = require("../db");

// Retrieve task activity with the name of the user who performed it
async function getTaskAuditLogs(taskId) {
    const result = await pool.query(
        `SELECT log.id, log.task_id, log.action,
                log.old_value, log.new_value, log.created_at,
                log.actor_id, u.name AS actor_name
         FROM task_audit_logs log
         LEFT JOIN users u ON u.id = log.actor_id
         WHERE log.task_id = $1
         ORDER BY log.created_at DESC, log.id DESC
         LIMIT 100`,
        [taskId]
    );

    return result.rows;
}

module.exports = {
    getTaskAuditLogs
};
