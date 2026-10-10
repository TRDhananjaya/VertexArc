// Project routes — mounted at /api/projects in app.js.
const express           = require("express");
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

router.get(
    "/:projectId/members",
    projectController.getMembers             // List members of a project
);

router.post(
    "/:projectId/members",
    requireRole("ADMIN", "PROJECT_MANAGER"),
    projectController.addMember              // Add a user to a project
);

module.exports = router;
