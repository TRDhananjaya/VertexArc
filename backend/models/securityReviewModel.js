const pool = require("../db");

// Get the security checklist for a task
async function getSecurityReview(taskId) {
    const result = await pool.query(
        `SELECT task_id, code_reviewed,
                security_tests_passed,
                no_unresolved_vulnerabilities,
                reviewed_by, reviewed_at, updated_at
         FROM task_security_reviews
         WHERE task_id = $1`,
        [taskId]
    );

    return result.rows[0] || null;
}

// Update the checklist and audit it in one transaction
async function updateSecurityReview(taskId, projectId, checks, reviewerId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the task before modifying its security review
        const taskResult = await client.query(
            `SELECT id, status, is_security_sensitive
             FROM tasks
             WHERE id = $1 AND project_id = $2
             FOR UPDATE`,
            [taskId, projectId]
        );

        const task = taskResult.rows[0];

        if (
            !task ||
            !task.is_security_sensitive ||
            task.status !== "IN_REVIEW"
        ) {
            await client.query("ROLLBACK");
            return null;
        }

        const previousResult = await client.query(
            `SELECT code_reviewed, security_tests_passed,
                    no_unresolved_vulnerabilities
             FROM task_security_reviews
             WHERE task_id = $1
             FOR UPDATE`,
            [taskId]
        );

        const previous = previousResult.rows[0];

        if (!previous) {
            throw new Error("Security checklist is missing");
        }

        const result = await client.query(
            `UPDATE task_security_reviews
             SET code_reviewed = $1,
                 security_tests_passed = $2,
                 no_unresolved_vulnerabilities = $3,
                 reviewed_by = $4,
                 reviewed_at = NOW(),
                 updated_at = NOW()
             WHERE task_id = $5
             RETURNING *`,
            [
                checks.codeReviewed,
                checks.securityTestsPassed,
                checks.noUnresolvedVulnerabilities,
                reviewerId,
                taskId
            ]
        );

        await client.query(
            `INSERT INTO task_audit_logs
                (task_id, actor_id, action, old_value, new_value)
             VALUES ($1, $2, 'SECURITY_REVIEW_UPDATED', $3::jsonb, $4::jsonb)`,
            [
                taskId,
                reviewerId,
                JSON.stringify(previous),
                JSON.stringify({
                    code_reviewed: checks.codeReviewed,
                    security_tests_passed: checks.securityTestsPassed,
                    no_unresolved_vulnerabilities:
                        checks.noUnresolvedVulnerabilities
                })
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

module.exports = {
    getSecurityReview,
    updateSecurityReview
};
