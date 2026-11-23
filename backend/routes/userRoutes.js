const express = require("express");

const {
  authenticateToken,
  requireRole
} = require("../middleware/authMiddleware");

const userController = require("../controllers/userController");

const router = express.Router();

// Every route below requires an authenticated Admin.
router.use(authenticateToken);
router.use(requireRole("ADMIN"));

// List all users
router.get("/", userController.listUsers);

// Create Developer or Project Manager
router.post("/", userController.createUser);

// Update user details, role, or active status
router.patch("/:id", userController.updateUser);
router.put("/:id", userController.updateUser);

module.exports = router;
