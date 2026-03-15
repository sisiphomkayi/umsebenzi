const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── ADMIN LOGIN ──────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }
    const result = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1 OR email = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const token = jwt.sign(
      { id: admin.id, role: admin.role, is_admin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return res.status(200).json({
      success: true,
      message: '✅ Admin login successful!',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── CREATE SUPER ADMIN ───────────────────────────────────────
const createSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    const existing = await pool.query(
      'SELECT id FROM admin_users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Admin already exists' });
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const newAdmin = await pool.query(
      `INSERT INTO admin_users (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role`,
      [username, email, password_hash, full_name, role || 'admin']
    );
    return res.status(201).json({
      success: true,
      message: '✅ Admin created successfully!',
      admin: newAdmin.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET DASHBOARD STATS ──────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [workers, clients, companies, jobs, activeJobs, revenue] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE user_type = 'worker'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE user_type = 'client'`),
      pool.query(`SELECT COUNT(*) FROM companies`),
      pool.query(`SELECT COUNT(*) FROM jobs`),
      pool.query(`SELECT COUNT(*) FROM jobs WHERE status = 'in_progress'`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'commission'`)
    ]);

    const pending = await pool.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    const completedJobs = await pool.query(`SELECT COUNT(*) FROM jobs WHERE status = 'completed'`);

    return res.status(200).json({
      success: true,
      stats: {
        total_workers: parseInt(workers.rows[0].count),
        total_clients: parseInt(clients.rows[0].count),
        total_companies: parseInt(companies.rows[0].count),
        total_jobs: parseInt(jobs.rows[0].count),
        active_jobs: parseInt(activeJobs.rows[0].count),
        completed_jobs: parseInt(completedJobs.rows[0].count),
        pending_approvals: parseInt(pending.rows[0].count),
        total_revenue: `R${parseFloat(revenue.rows[0].total).toFixed(2)}`
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET ALL USERS ────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { user_type, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT id, username, email, phone, user_type, first_name, last_name, status, created_at FROM users WHERE 1=1`;
    const params = [];
    if (user_type) { params.push(user_type); query += ` AND user_type = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const users = await pool.query(query, params);
    const total = await pool.query(`SELECT COUNT(*) FROM users`);
    return res.status(200).json({
      success: true,
      count: users.rows.length,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      users: users.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── APPROVE / SUSPEND USER ───────────────────────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['approved', 'suspended', 'banned', 'fingerprints_required', 'documents_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await pool.query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, status`,
      [status, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      message: `✅ User status updated to ${status}`,
      user: updated.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET PENDING APPROVALS ────────────────────────────────────
const getPendingApprovals = async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT id, username, email, phone, user_type, first_name, last_name, 
              id_number, nationality, status, created_at
       FROM users WHERE status IN ('pending', 'documents_review', 'fingerprints_required')
       ORDER BY created_at ASC`
    );
    return res.status(200).json({
      success: true,
      count: users.rows.length,
      users: users.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET ALL COMPANIES ────────────────────────────────────────
const getAllCompanies = async (req, res) => {
  try {
    const companies = await pool.query(
      `SELECT c.*, u.email, u.phone FROM companies c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    return res.status(200).json({
      success: true,
      count: companies.rows.length,
      companies: companies.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  adminLogin,
  createSuperAdmin,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getPendingApprovals,
  getAllCompanies
};