const pool = require("../db");

// Get notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         n.id,
         n.type,
         n.entity_id,
         n.message,
         n.is_read,
         n.created_at,
         n.actor_id,
         u.username AS actor_username
       FROM notifications n
       LEFT JOIN users u ON u.id = n.actor_id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId],
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notifications
       WHERE recipient_id = $1 AND is_read = FALSE`,
      [userId],
    );

    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error("Get unread notifications count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.notificationId);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND recipient_id = $2
       RETURNING id`,
      [notificationId, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE recipient_id = $1 AND is_read = FALSE`,
      [req.user.id],
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res
      .status(500)
      .json({ message: "Failed to mark all notifications as read" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
