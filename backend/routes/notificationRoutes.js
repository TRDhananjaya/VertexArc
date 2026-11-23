const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.post("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;
