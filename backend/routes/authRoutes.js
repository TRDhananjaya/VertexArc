// Auth routes — mounted at /api/auth in app.js.
const express        = require("express");
const authController = require("../controllers/authController");
const {loginLimiter, registerLimiter} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", registerLimiter, authController.register); // Create a new user account
router.post("/login", loginLimiter, authController.login);    // Authenticate and return a JWT

module.exports = router;