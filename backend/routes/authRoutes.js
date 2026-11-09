const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Public login is allowed for existing accounts.
router.post("/login", loginLimiter, authController.login);

// Public registration is intentionally disabled.
// Admins create accounts through POST /api/users.

module.exports = router;
