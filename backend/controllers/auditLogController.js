const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");
const auditLogModel = require("../models/auditLogModel");

// Validate IDs before using them in database queries
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number(id) <= 2147483647;
}

// GET /api/projects/:projectId/tasks/:taskId/audit-logs
async function getTaskAuditLogs(req, res) {
    try {
        const { projectId, taskId } = req.params;

        if (!isValidId(projectId) || !isValidId(taskId)) {
            return res.status(400).json({
                message: "Invalid project or task ID"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only admins and project members may view task history
        if (req.user.role !== "ADMIN") {
            const isMember = await projectModel.isProjectMember(
                projectId,
                req.user.id
            );

            if (!isMember) {
                return res.status(403).json({
                    message: "You cannot view this project's audit logs"
                });
            }
        }

        const task = await taskModel.findTaskById(taskId, projectId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found in this project"
            });
        }

        const auditLogs = await auditLogModel.getTaskAuditLogs(taskId);

        return res.status(200).json({ auditLogs });
    } catch (error) {
        console.error("Failed to retrieve task audit logs:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve task audit logs"
        });
    }
}

module.exports = {
    getTaskAuditLogs
};
