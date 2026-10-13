const express        = require("express");
const taskController = require("../controllers/taskController");
const securityReviewController = require("../controllers/securityReviewController");
const auditLogController = require("../controllers/auditLogController");
const commentController = require("../controllers/commentController");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

// All task routes require authentication
router.use(authenticateToken);

router.get("/", taskController.getTasks);

router.post(
    "/",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    taskController.createTask
);

// Assign a task to a project member
router.patch(
    "/:taskId/assign",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    taskController.assignTask
);

// Edit task title, description, and priority
router.patch(
    "/:taskId",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    taskController.updateTaskDetails
);

// Delete a task without erasing its audit history
router.delete(
    "/:taskId",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    taskController.deleteTask
);

// Update a task's workflow status
router.patch(
    "/:taskId/status",
    taskController.updateTaskStatus
);

// View a task's security checklist
router.get(
    "/:taskId/security-review",
    securityReviewController.getSecurityReview
);

// Update the checklist as an authorized reviewer
router.patch(
    "/:taskId/security-review",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    securityReviewController.updateSecurityReview
);

// View the recorded history of a task
router.get(
    "/:taskId/audit-logs",
    auditLogController.getTaskAuditLogs
);

// View discussions for a task
router.get(
    "/:taskId/comments",
    commentController.getComments
);

// Add a discussion comment
router.post(
    "/:taskId/comments",
    commentController.addComment
);

module.exports = router;
