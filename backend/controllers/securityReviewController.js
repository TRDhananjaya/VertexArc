const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");
const securityReviewModel = require("../models/securityReviewModel");

// Check whether an ID fits PostgreSQL's INTEGER range
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number(id) <= 2147483647;
}

// Check whether the user can review tasks in this project
function canReviewProject(user, project) {
    return (
        user.role === "ADMIN" ||
        (
            user.role === "PROJECT_MANAGER" &&
            project.created_by === user.id
        )
    );
}

// GET /api/projects/:projectId/tasks/:taskId/security-review
async function getSecurityReview(req, res) {
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

        // Only project members and admins can view the checklist
        if (req.user.role !== "ADMIN") {
            const isMember = await projectModel.isProjectMember(
                projectId,
                req.user.id
            );

            if (!isMember) {
                return res.status(403).json({
                    message: "You cannot access this project"
                });
            }
        }

        const task = await taskModel.findTaskById(taskId, projectId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (!task.is_security_sensitive) {
            return res.status(400).json({
                message: "This task does not require a security review"
            });
        }

        const review = await securityReviewModel.getSecurityReview(
            taskId
        );

        return res.status(200).json({ review });
    } catch (error) {
        console.error("Failed to retrieve security review:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve security review"
        });
    }
}

// PATCH /api/projects/:projectId/tasks/:taskId/security-review
async function updateSecurityReview(req, res) {
    try {
        const { projectId, taskId } = req.params;

        const {
            codeReviewed,
            securityTestsPassed,
            noUnresolvedVulnerabilities
        } = req.body ?? {};

        if (!isValidId(projectId) || !isValidId(taskId)) {
            return res.status(400).json({
                message: "Invalid project or task ID"
            });
        }

        const checks = {
            codeReviewed,
            securityTestsPassed,
            noUnresolvedVulnerabilities
        };

        if (
            Object.values(checks).some(
                (value) => typeof value !== "boolean"
            )
        ) {
            return res.status(400).json({
                message: "All security checks must be true or false"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!canReviewProject(req.user, project)) {
            return res.status(403).json({
                message: "You cannot review tasks in this project"
            });
        }

        const task = await taskModel.findTaskById(taskId, projectId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (!task.is_security_sensitive) {
            return res.status(400).json({
                message: "This task does not require a security review"
            });
        }

        // The task must be submitted before its security review is updated
        if (task.status !== "IN_REVIEW") {
            return res.status(409).json({
                message: "Task must be IN_REVIEW"
            });
        }

        const review = await securityReviewModel.updateSecurityReview(
            taskId,
            projectId,
            checks,
            req.user.id
        );

        if (!review) {
            return res.status(404).json({
                message: "Security review unavailable. Refresh the task and try again"
            });
        }

        return res.status(200).json({
            message: "Security review updated successfully",
            review
        });
    } catch (error) {
        console.error("Security review update failed:", error.message);

        return res.status(500).json({
            message: "Failed to update security review"
        });
    }
}

module.exports = {
    getSecurityReview,
    updateSecurityReview
};
