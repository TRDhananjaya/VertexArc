const adminAuditModel = require("../models/adminAuditModel");

// GET /api/admin/audit-logs/projects
async function getProjectAuditLogs(req, res) {
    try {
        const auditLogs = await adminAuditModel.getProjectAuditLogs();

        return res.status(200).json({ auditLogs });
    } catch (error) {
        console.error("Failed to retrieve project audit logs:", error);

        return res.status(500).json({
            message: "Failed to retrieve project audit logs"
        });
    }
}

// GET /api/admin/audit-logs/tasks
async function getTaskAuditLogs(req, res) {
    try {
        const auditLogs = await adminAuditModel.getTaskAuditLogs();

        return res.status(200).json({ auditLogs });
    } catch (error) {
        console.error("Failed to retrieve task audit logs:", error);

        return res.status(500).json({
            message: "Failed to retrieve task audit logs"
        });
    }
}

module.exports = {
    getProjectAuditLogs,
    getTaskAuditLogs
};