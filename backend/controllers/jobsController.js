const pool = require('../db');

const createJob = async (req, res) => {
  try {
    const { title, description, skill_category, job_type, duration_type, pay_amount, location, latitude, longitude, is_noticeboard, deadline } = req.body;
    if (!title || !description || !skill_category || !pay_amount) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }
    const newJob = await pool.query(
      `INSERT INTO jobs (posted_by, title, description, skill_category, job_type, duration_type, pay_amount, location, latitude, longitude, posted_by_type, is_noticeboard, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [req.user.id, title, description, skill_category, job_type || 'instant', duration_type || 'hourly', pay_amount, location || null, latitude || null, longitude || null, req.user.user_type === 'company' ? 'company' : 'admin', is_noticeboard || false, deadline || null]
    );
    return res.status(201).json({ success: true, message: '✅ Job posted successfully!', job: newJob.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getNoticeboardJobs = async (req, res) => {
  try {
    const jobs = await pool.query(
      `SELECT j.*, u.first_name, u.last_name, u.username FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.is_noticeboard = true AND j.status = 'open'
       AND (j.deadline IS NULL OR j.deadline > NOW())
       ORDER BY j.created_at DESC`
    );
    return res.status(200).json({ success: true, count: jobs.rows.length, jobs: jobs.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getJobsBySkill = async (req, res) => {
  try {
    const { skill_category } = req.params;
    const jobs = await pool.query(
      `SELECT j.*, u.first_name, u.last_name FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.skill_category = $1 AND j.status = 'open'
       AND (j.deadline IS NULL OR j.deadline > NOW())
       ORDER BY j.created_at DESC`,
      [skill_category]
    );
    return res.status(200).json({ success: true, count: jobs.rows.length, jobs: jobs.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await pool.query(
      `SELECT j.*, u.first_name, u.last_name, u.username FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id WHERE j.id = $1`,
      [id]
    );
    if (job.rows.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.status(200).json({ success: true, job: job.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getNearbyWorkers = async (req, res) => {
  try {
    const { skill_category } = req.query;
    let query = `SELECT id, username, first_name, last_name, address, latitude, longitude, performance_score, average_rating, rating_count, is_available FROM users WHERE user_type = 'worker' AND status = 'approved' AND is_available = true`;
    const params = [];
    if (skill_category) {
      query += ` AND id IN (SELECT user_id FROM worker_skills WHERE skill_category = $1)`;
      params.push(skill_category);
    }
    query += ' ORDER BY performance_score DESC LIMIT 20';
    const workers = await pool.query(query, params);
    return res.status(200).json({ success: true, count: workers.rows.length, workers: workers.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const requestWorker = async (req, res) => {
  try {
    const { worker_id, title, description, skill_category, pay_amount, location, latitude, longitude } = req.body;
    if (!worker_id || !title || !pay_amount) {
      return res.status(400).json({ success: false, message: 'Please provide worker, job title and pay amount' });
    }
    const worker = await pool.query(
      `SELECT id, first_name, last_name, status FROM users WHERE id = $1 AND user_type = 'worker'`,
      [worker_id]
    );
    if (worker.rows.length === 0) return res.status(404).json({ success: false, message: 'Worker not found' });
    if (worker.rows[0].status !== 'approved') return res.status(400).json({ success: false, message: 'This worker is not yet approved' });
    const newJob = await pool.query(
      `INSERT INTO jobs (posted_by, title, description, skill_category, job_type, pay_amount, location, latitude, longitude, posted_by_type, is_noticeboard, status)
       VALUES ($1,$2,$3,$4,'instant',$5,$6,$7,$8,'admin',false,'assigned') RETURNING *`,
      [req.user.id, title, description, skill_category || 'General', pay_amount, location || null, latitude || null, longitude || null]
    );
    const jobRequest = await pool.query(
      `INSERT INTO job_requests (job_id, worker_id, client_id, status, payment_status) VALUES ($1,$2,$3,'pending','pending') RETURNING *`,
      [newJob.rows[0].id, worker_id, req.user.id]
    );
    return res.status(201).json({ success: true, message: `✅ Job request sent to ${worker.rows[0].first_name}!`, job: newJob.rows[0], request: jobRequest.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const respondToJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, needs_transport } = req.body;
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ success: false, message: 'Action must be accept or decline' });
    const request = await pool.query('SELECT * FROM job_requests WHERE id = $1 AND worker_id = $2', [id, req.user.id]);
    if (request.rows.length === 0) return res.status(404).json({ success: false, message: 'Job request not found' });
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const updated = await pool.query(
      `UPDATE job_requests SET status = $1, needs_transport = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [newStatus, needs_transport || false, id]
    );
    return res.status(200).json({ success: true, message: action === 'accept' ? '✅ Job accepted! Chat is now open.' : '❌ Job declined.', request: updated.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMyJobRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    let query;
    if (userType === 'worker') {
      query = `SELECT jr.*, j.title, j.description, j.pay_amount, j.location, u.first_name as client_name, u.phone as client_phone FROM job_requests jr JOIN jobs j ON jr.job_id = j.id JOIN users u ON jr.client_id = u.id WHERE jr.worker_id = $1 ORDER BY jr.created_at DESC`;
    } else {
      query = `SELECT jr.*, j.title, j.description, j.pay_amount, j.location, u.first_name as worker_name, u.phone as worker_phone, u.average_rating as worker_rating FROM job_requests jr JOIN jobs j ON jr.job_id = j.id JOIN users u ON jr.worker_id = u.id WHERE jr.client_id = $1 ORDER BY jr.created_at DESC`;
    }
    const requests = await pool.query(query, [userId]);
    return res.status(200).json({ success: true, count: requests.rows.length, requests: requests.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { createJob, getNoticeboardJobs, getJobsBySkill, getJobById, getNearbyWorkers, requestWorker, respondToJobRequest, getMyJobRequests };