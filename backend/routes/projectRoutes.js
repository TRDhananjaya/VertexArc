// Project routes — mounted at /api/projects in app.js.
const express           = require("express");
const taskRoutes        = require("./taskRoutes");
const projectController = require("../controllers/projectController");

const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes require a valid JWT
router.use(authenticateToken);

router.get("/", projectController.getProjects); // List projects visible to the current user

router.post(
    "/",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.createProject          // Create a new project
);

// Edit project details
router.patch(
    "/:projectId",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.updateProject
);

// Soft-delete a project and preserve its related records
router.delete(
    "/:projectId",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.deleteProject
);

router.get(
    "/:projectId/members",
    projectController.getMembers             // List members of a project
);

router.post(
    "/:projectId/members",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.addMember              // Add a user to a project
);

router.patch(
    "/:projectId",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.updateProject
);

// Handle tasks belonging to a project
router.use("/:projectId/tasks", taskRoutes);

module.exports = router;
