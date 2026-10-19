const express = require("express");
const adminAuditController = require("../controllers/adminAuditController");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication and ADMIN role for every route
router.use(authenticateToken);
router.use(requireRole("ADMIN"));

// Retrieve project audit history
router.get(
    "/projects",
    adminAuditController.getProjectAuditLogs
);

// Retrieve task audit history
router.get(
    "/tasks",
    adminAuditController.getTaskAuditLogs
);

module.exports = router;
