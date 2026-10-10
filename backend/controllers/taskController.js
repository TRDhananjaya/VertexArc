const taskModel     = require("../models/taskModel");
const projectModel  = require("../models/projectModel");
const userModel     = require("../models/userModel");

// Check whether an ID fits PostgreSQL's positive INTEGER range
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number(id) <= 2147483647;
}

// POST /api/projects/:projectId/tasks — create a task
async function createTask(req, res) {
    try {
        const { projectId } = req.params;
        const {
            title,
            description = "",
            priority = "MEDIUM"
        } = req.body ?? {};

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Task title must be between 1 and 150 characters"
            });
        }

        if (
            typeof description !== "string" ||
            description.length > 5000
        ) {
            return res.status(400).json({
                message: "Description must not exceed 5000 characters"
            });
        }

        if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
            return res.status(400).json({
                message: "Priority must be LOW, MEDIUM, or HIGH"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Admins can create tasks anywhere; managers only in projects they created
        if (
            req.user.role !== "ADMIN" &&
            (
                req.user.role !== "PROJECT_MANAGER" ||
                project.created_by !== req.user.id
            )
        ) {
            return res.status(403).json({
                message: "You cannot create tasks in this project"
            });
        }

        const task = await taskModel.createTask({
            projectId,
            title: title.trim(),
            description: description.trim(),
            priority,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        console.error("Task creation failed:", error.message);

        return res.status(500).json({
            message: "Failed to create task"
        });
    }
}

// GET /api/projects/:projectId/tasks — view project tasks
async function getTasks(req, res) {
    try {
        const { projectId } = req.params;

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Project members can view tasks; admins can view any project
        if (req.user.role !== "ADMIN") {
            const isMember = await projectModel.isProjectMember(
                projectId,
                req.user.id
            );

            if (!isMember) {
                return res.status(403).json({
                    message: "You cannot view tasks in this project"
                });
            }
        }

        const tasks = await taskModel.getTasksForProject(projectId);

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error("Failed to retrieve tasks:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve tasks"
        });
    }
}

// PATCH /api/projects/:projectId/tasks/:taskId/assign
async function assignTask(req, res) {
    try {
        const { projectId, taskId } = req.params;
        const { userId } = req.body ?? {};

        if (
            !isValidId(projectId) ||
            !isValidId(taskId) ||
            !isValidId(userId)
        ) {
            return res.status(400).json({
                message: "Valid project, task, and user IDs are required"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Admins can assign tasks anywhere; managers only in their own projects
        if (
            req.user.role !== "ADMIN" &&
            (
                req.user.role !== "PROJECT_MANAGER" ||
                project.created_by !== req.user.id
            )
        ) {
            return res.status(403).json({
                message: "You cannot assign tasks in this project"
            });
        }

        const task = await taskModel.findTaskById(taskId, projectId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found in this project"
            });
        }
        const user = await userModel.findUserById(userId);

        if (!user || !user.is_active) {
            return res.status(404).json({
                message: "Active user not found"
            });
        }

        // A task can only be assigned to a member of its project
        const isMember = await projectModel.isProjectMember(
            projectId,
            userId
        );

        if (!isMember) {
            return res.status(400).json({
                message: "User is not a member of this project"
            });
        }

        const updatedTask = await taskModel.assignTask(
            taskId,
            projectId,
            userId
        );

        return res.status(200).json({
            message: "Task assigned successfully",
            task: updatedTask
        });
    } catch (error) {
        console.error("Task assignment failed:", error.message);

        return res.status(500).json({
            message: "Failed to assign task"
        });
    }
}

// PATCH /api/projects/:projectId/tasks/:taskId/status
async function updateTaskStatus(req, res) {
    try {
        const { projectId, taskId } = req.params;
        const { status } = req.body ?? {};

        if (!isValidId(projectId) || !isValidId(taskId)) {
            return res.status(400).json({
                message: "Invalid project or task ID"
            });
        }

        const allowedStatuses = [
            "TODO",
            "IN_PROGRESS",
            "IN_REVIEW",
            "DONE"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const task = await taskModel.findTaskById(taskId, projectId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found in this project"
            });
        }

        const isReviewer =
            req.user.role === "ADMIN" ||
            (
                req.user.role === "PROJECT_MANAGER" &&
                project.created_by === req.user.id
            );

        const isAssignee = task.assigned_to === req.user.id;

        // Only the assigned user can start work or submit it for review
        const developerTransitions = {
            TODO: "IN_PROGRESS",
            IN_PROGRESS: "IN_REVIEW"
        };

        // Only authorized reviewers can approve or request changes
        const reviewerTransitions = {
            IN_REVIEW: ["DONE", "IN_PROGRESS"]
        };

        let allowed = false;

        if (
            isAssignee &&
            developerTransitions[task.status] === status
        ) {
            allowed = true;
        }

        if (
            isReviewer &&
            reviewerTransitions[task.status]?.includes(status)
        ) {
            allowed = true;
        }

        if (!allowed) {
            return res.status(403).json({
                message: "You cannot make this status change"
            });
        }

        const updatedTask = await taskModel.updateTaskStatus(
            taskId,
            projectId,
            task.status,
            status
        );

        if (!updatedTask) {
            return res.status(409).json({
                message: "Task status changed. Please refresh and try again"
            });
        }

        return res.status(200).json({
            message: "Task status updated successfully",
            task: updatedTask
        });
    } catch (error) {
        console.error("Task status update failed:", error.message);

        return res.status(500).json({
            message: "Failed to update task status"
        });
    }
}

module.exports = {
    createTask,
    getTasks,
    assignTask,
    updateTaskStatus,
};
