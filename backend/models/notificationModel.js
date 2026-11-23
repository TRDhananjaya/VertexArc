const pool = require("../db");

async function createNotification({ userId, title, message, link = null, type = "INFO" }) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, link, type, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING id, user_id, title, message, link, type, is_read, created_at`,
      [userId, title, message, link, type]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Failed to insert notification:", err.message);
    return null;
  }
}

async function getNotificationsByUser(userId) {
  const result = await pool.query(
    `SELECT id, user_id, title, message, link, type, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 50`,
    [userId]
  );
  return result.rows;
}

async function getUnreadCountByUser(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS unread
     FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rows[0]?.unread || 0;
}

async function markNotificationAsRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING id, is_read`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function markAllNotificationsAsRead(userId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return true;
}

module.exports = {
  createNotification,
  getNotificationsByUser,
  getUnreadCountByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
