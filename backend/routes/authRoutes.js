const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter, passwordResetLimiter } = require("../middleware/rateLimitMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public login is allowed for existing accounts.
router.post("/login", loginLimiter, authController.login);

// Password Reset Flow (Public, rate-limited, disabled until email delivery is configured)
router.post("/forgot-password", passwordResetLimiter, authController.forgotPassword);
router.post("/reset-password", passwordResetLimiter, authController.resetPassword);

// Profile Management (Authenticated user only)
router.get("/profile", authenticateToken, authController.getProfile);
router.patch("/profile", authenticateToken, authController.updateProfile);

module.exports = router;
