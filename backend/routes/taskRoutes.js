const express        = require("express");
const taskController = require("../controllers/taskController");

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

// Update a task's workflow status
router.patch(
    "/:taskId/status",
    taskController.updateTaskStatus
);

module.exports = router;
