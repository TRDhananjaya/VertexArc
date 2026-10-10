// Auth routes — mounted at /api/auth in app.js.
const express        = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register); // Create a new user account
router.post("/login",    authController.login);    // Authenticate and return a JWT

module.exports = router;