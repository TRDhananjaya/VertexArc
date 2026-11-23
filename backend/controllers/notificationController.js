const notificationModel = require("../models/notificationModel");

// GET /api/notifications — Retrieve notifications for current user
async function getNotifications(req, res) {
  try {
    const notifications = await notificationModel.getNotificationsByUser(req.user.id);
    const unreadCount = await notificationModel.getUnreadCountByUser(req.user.id);

    return res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Failed to retrieve notifications:", error.message);
    return res.status(500).json({ message: "Failed to retrieve notifications" });
  }
}

// PATCH /api/notifications/:id/read — Mark single notification as read
async function markAsRead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const updated = await notificationModel.markNotificationAsRead(id, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({ message: "Notification marked as read", notification: updated });
  } catch (error) {
    console.error("Failed to mark notification as read:", error.message);
    return res.status(500).json({ message: "Failed to update notification" });
  }
}

// POST /api/notifications/mark-all-read — Mark all notifications as read
async function markAllAsRead(req, res) {
  try {
    await notificationModel.markAllNotificationsAsRead(req.user.id);
    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error.message);
    return res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
