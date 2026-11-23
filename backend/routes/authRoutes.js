const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public login is allowed for existing accounts.
router.post("/login", loginLimiter, authController.login);

// Password Reset Flow (Public)
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Profile Management (Authenticated user only)
router.get("/profile", authenticateToken, authController.getProfile);
router.patch("/profile", authenticateToken, authController.updateProfile);

module.exports = router;
