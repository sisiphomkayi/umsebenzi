const pool = require('../db');

// ─── SEND MESSAGE ─────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { job_request_id, receiver_id, content, message_type } = req.body;

    if (!job_request_id || !receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job request, receiver and message'
      });
    }

    // Verify user is part of this job request
    const jobRequest = await pool.query(
      `SELECT * FROM job_requests WHERE id = $1 
       AND (worker_id = $2 OR client_id = $2)`,
      [job_request_id, req.user.id]
    );

    if (jobRequest.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this job request'
      });
    }

    const message = await pool.query(
      `INSERT INTO messages 
        (job_request_id, sender_id, receiver_id, message_type, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [job_request_id, req.user.id, receiver_id, message_type || 'text', content]
    );

    return res.status(201).json({
      success: true,
      message: message.rows[0]
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET MESSAGES FOR A JOB REQUEST ───────────────────────────
const getMessages = async (req, res) => {
  try {
    const { job_request_id } = req.params;

    // Verify user is part of this job request
    const jobRequest = await pool.query(
      `SELECT * FROM job_requests WHERE id = $1 
       AND (worker_id = $2 OR client_id = $2)`,
      [job_request_id, req.user.id]
    );

    if (jobRequest.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this job request'
      });
    }

    // Mark messages as read
    await pool.query(
      `UPDATE messages SET is_read = true 
       WHERE job_request_id = $1 AND receiver_id = $2`,
      [job_request_id, req.user.id]
    );

    const messages = await pool.query(
      `SELECT m.*, 
              u.first_name as sender_name,
              u.username as sender_username
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.job_request_id = $1
       ORDER BY m.created_at ASC`,
      [job_request_id]
    );

    return res.status(200).json({
      success: true,
      count: messages.rows.length,
      messages: messages.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET UNREAD MESSAGE COUNT ──────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count FROM messages 
       WHERE receiver_id = $1 AND is_read = false`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      unread_count: parseInt(result.rows[0].unread_count)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { sendMessage, getMessages, getUnreadCount };