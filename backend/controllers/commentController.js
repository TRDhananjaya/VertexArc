const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");
const commentModel = require("../models/commentModel");

// Accept only positive IDs within PostgreSQL's INTEGER range
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number(id) <= 2147483647;
}

// Check project access before exposing task discussions
async function checkTaskAccess(req, res) {
    const { projectId, taskId } = req.params;

    if (!isValidId(projectId) || !isValidId(taskId)) {
        res.status(400).json({
            message: "Invalid project or task ID"
        });
        return false;
    }

    const project = await projectModel.findProjectById(projectId);

    if (!project) {
        res.status(404).json({
            message: "Project not found"
        });
        return false;
    }

    // Admins can access all projects; others must be members
    if (req.user.role !== "ADMIN") {
        const isMember = await projectModel.isProjectMember(
            projectId,
            req.user.id
        );

        if (!isMember) {
            res.status(403).json({
                message: "You cannot access this project's comments"
            });
            return false;
        }
    }

    const task = await taskModel.findTaskById(taskId, projectId);

    if (!task) {
        res.status(404).json({
            message: "Task not found in this project"
        });
        return false;
    }

    return true;
}

// GET /api/projects/:projectId/tasks/:taskId/comments
async function getComments(req, res) {
    try {
        const allowed = await checkTaskAccess(req, res);

        if (!allowed) return;

        const comments = await commentModel.getCommentsForTask(
            req.params.taskId
        );

        return res.status(200).json({ comments });
    } catch (error) {
        console.error("Failed to retrieve comments:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve comments"
        });
    }
}

// POST /api/projects/:projectId/tasks/:taskId/comments
async function addComment(req, res) {
    try {
        const { content } = req.body ?? {};

        if (
            typeof content !== "string" ||
            !content.trim() ||
            content.trim().length > 2000
        ) {
            return res.status(400).json({
                message: "Comment must be between 1 and 2000 characters"
            });
        }

        const allowed = await checkTaskAccess(req, res);

        if (!allowed) return;

        const comment = await commentModel.createComment(
            req.params.taskId,
            req.user.id,
            content.trim()
        );

        return res.status(201).json({
            message: "Comment added successfully",
            comment
        });
    } catch (error) {
        console.error("Failed to add comment:", error.message);

        return res.status(500).json({
            message: "Failed to add comment"
        });
    }
}

module.exports = {
    getComments,
    addComment
};
