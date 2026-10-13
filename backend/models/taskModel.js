const pool = require("../db");

// Create a task and initialize its security review if needed
async function createTask({
    projectId,
    title,
    description,
    priority,
    userId,
    isSecuritySensitive,
    riskLevel
}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO tasks (
                project_id, title, description, priority,
                created_by, is_security_sensitive, risk_level
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                projectId,
                title,
                description,
                priority,
                userId,
                isSecuritySensitive,
                riskLevel
            ]
        );

        const task = result.rows[0];

        // Only security-sensitive tasks need a checklist
        if (isSecuritySensitive) {
            await client.query(
                `INSERT INTO task_security_reviews (task_id)
                 VALUES ($1)`,
                [task.id]
            );
        }

        await client.query("COMMIT");

        return task;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
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

// Find a task with its workflow and security details
async function findTaskById(taskId, projectId) {
    const result = await pool.query(
        `SELECT id, project_id, title, status, assigned_to,
                is_security_sensitive, risk_level
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


// Change task status, reset stale approvals, and record the action together
async function updateTaskStatus(
    taskId,
    projectId,
    currentStatus,
    newStatus,
    actorId,
    isReviewer
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the task so concurrent workflow updates cannot interfere
        const taskResult = await client.query(
            `SELECT id, status, assigned_to, is_security_sensitive
             FROM tasks
             WHERE id = $1 AND project_id = $2
             FOR UPDATE`,
            [taskId, projectId]
        );

        const task = taskResult.rows[0];

        if (!task || task.status !== currentStatus) {
            await client.query("ROLLBACK");
            return null;
        }

        // Recheck permission using the locked task's current assignment
        const isAssignee = task.assigned_to === actorId;

        const developerAllowed =
            isAssignee &&
            (
                (task.status === "TODO" && newStatus === "IN_PROGRESS") ||
                (task.status === "IN_PROGRESS" && newStatus === "IN_REVIEW")
            );

        const reviewerAllowed =
            isReviewer &&
            task.status === "IN_REVIEW" &&
            ["DONE", "IN_PROGRESS"].includes(newStatus);

        if (!developerAllowed && !reviewerAllowed) {
            await client.query("ROLLBACK");
            return null;
        }

        // Security-sensitive tasks need all checks before completion
        if (task.is_security_sensitive && newStatus === "DONE") {
            const reviewResult = await client.query(
                `SELECT code_reviewed, security_tests_passed,
                        no_unresolved_vulnerabilities
                 FROM task_security_reviews
                 WHERE task_id = $1
                 FOR UPDATE`,
                [taskId]
            );

            const review = reviewResult.rows[0];

            if (
                !review?.code_reviewed ||
                !review?.security_tests_passed ||
                !review?.no_unresolved_vulnerabilities
            ) {
                await client.query("ROLLBACK");
                return null;
            }
        }

        // Reset previous approvals when work is resubmitted or rejected
        const shouldReset =
            task.is_security_sensitive &&
            (
                (task.status === "IN_PROGRESS" && newStatus === "IN_REVIEW") ||
                (task.status === "IN_REVIEW" && newStatus === "IN_PROGRESS")
            );

        if (shouldReset) {
            const resetResult = await client.query(
                `UPDATE task_security_reviews
                 SET code_reviewed = FALSE,
                     security_tests_passed = FALSE,
                     no_unresolved_vulnerabilities = FALSE,
                     reviewed_by = NULL,
                     reviewed_at = NULL,
                     updated_at = NOW()
                 WHERE task_id = $1
                 RETURNING task_id`,
                [taskId]
            );

            if (resetResult.rowCount !== 1) {
                throw new Error("Security checklist is missing");
            }

            await client.query(
                `INSERT INTO task_audit_logs
                    (task_id, actor_id, action, old_value, new_value)
                 VALUES ($1, $2, 'SECURITY_REVIEW_RESET', $3::jsonb, $4::jsonb)`,
                [
                    taskId,
                    actorId,
                    JSON.stringify({ reason: "Previous review invalidated" }),
                    JSON.stringify({
                        codeReviewed: false,
                        securityTestsPassed: false,
                        noUnresolvedVulnerabilities: false
                    })
                ]
            );
        }

        const result = await client.query(
            `UPDATE tasks
             SET status = $1, updated_at = NOW()
             WHERE id = $2 AND project_id = $3
             RETURNING id, project_id, title, status,
                       assigned_to, updated_at`,
            [newStatus, taskId, projectId]
        );

        // Preserve the previous and new status for the audit trail
        await client.query(
            `INSERT INTO task_audit_logs
                (task_id, actor_id, action, old_value, new_value)
             VALUES ($1, $2, 'STATUS_CHANGED', $3::jsonb, $4::jsonb)`,
            [
                taskId,
                actorId,
                JSON.stringify({ status: task.status }),
                JSON.stringify({ status: newStatus })
            ]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Update editable task details without changing its workflow status
async function updateTaskDetails(taskId, projectId, title, description, priority) {
    const result = await pool.query(
        `UPDATE tasks
                 SET title = $1,
                     description = $2,
                     priority = $3,
                     updated_at = NOW()
                 WHERE id = $4 AND project_id = $5
                 RETURNING id, project_id, title, description,
                           priority, status, assigned_to, updated_at`,
                [title, description, priority, taskId, projectId]
            );

            return result.rows[0] || null;
}

module.exports = {
    createTask,
    getTasksForProject,
    findTaskById,
    assignTask,
    updateTaskStatus,
    updateTaskDetails
};
