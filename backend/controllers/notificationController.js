const pool = require('../db');

// ─── CREATE NOTIFICATION (Internal use) ───────────────────────
const createNotification = async (user_id, title, body, type, data = null) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, type, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, title, body, type, data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// ─── GET MY NOTIFICATIONS ─────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: notifications.rows.length,
      notifications: notifications.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── MARK NOTIFICATION AS READ ────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications SET is_read = true 
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: '✅ Notification marked as read'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: '✅ All notifications marked as read'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET UNREAD COUNT ─────────────────────────────────────────
const getUnreadNotificationCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      unread: parseInt(result.rows[0].unread)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount
};