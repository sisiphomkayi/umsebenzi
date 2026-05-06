const pool = require('../db');

// ─── GET WALLET BALANCE ───────────────────────────────────────
const getWalletBalance = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wallet_balance FROM users WHERE id = $1`,
      [req.user.id]
    );
    return res.status(200).json({
      success: true,
      wallet_balance: result.rows[0].wallet_balance
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET TRANSACTION HISTORY ──────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const transactions = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({
      success: true,
      count: transactions.rows.length,
      transactions: transactions.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── COMPLETE JOB & RELEASE PAYMENT ──────────────────────────
const completeJobAndPay = async (req, res) => {
  try {
    const { job_request_id } = req.params;

    const jobRequest = await pool.query(
      `SELECT jr.*, j.pay_amount, j.title FROM job_requests jr
       JOIN jobs j ON jr.job_id = j.id
       WHERE jr.id = $1 AND jr.client_id = $2`,
      [job_request_id, req.user.id]
    );

    if (jobRequest.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job request not found' });
    }

    const job = jobRequest.rows[0];
    const totalAmount = parseFloat(job.pay_amount);
    const transportCost = parseFloat(job.transport_cost) || 0;
    const commission = parseFloat((totalAmount * 0.08).toFixed(2));
    const workerPayout = parseFloat((totalAmount - transportCost - commission).toFixed(2));

    // Update job request
    await pool.query(
      `UPDATE job_requests SET status = 'completed', payment_status = 'released',
       total_amount = $1, platform_commission = $2, worker_payout = $3,
       client_confirmed_end = true, end_time = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [totalAmount, commission, workerPayout, job_request_id]
    );

    // Update job status
    await pool.query(
      `UPDATE jobs SET status = 'completed' WHERE id = $1`,
      [job.job_id]
    );

    // Credit worker wallet
    await pool.query(
      `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
      [workerPayout, job.worker_id]
    );

    // Record transactions
    await pool.query(
      `INSERT INTO transactions (job_request_id, user_id, type, amount, description, status)
       VALUES ($1, $2, 'release', $3, $4, 'completed')`,
      [job_request_id, job.worker_id, workerPayout, `Payment for: ${job.title}`]
    );

    await pool.query(
      `INSERT INTO transactions (job_request_id, user_id, type, amount, description, status)
       VALUES ($1, $2, 'commission', $3, $4, 'completed')`,
      [job_request_id, job.worker_id, commission, `Platform commission for: ${job.title}`]
    );

    return res.status(200).json({
      success: true,
      message: '✅ Job completed and payment released!',
      payment_summary: {
        total_amount: `R${totalAmount}`,
        transport_deduction: `R${transportCost}`,
        platform_commission: `R${commission} (8%)`,
        worker_receives: `R${workerPayout}`
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── RATE AFTER JOB ───────────────────────────────────────────
const rateUser = async (req, res) => {
  try {
    const { job_request_id, rated_user_id, rating, review } = req.body;

    if (!job_request_id || !rated_user_id || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide all rating details' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check already rated
    const existing = await pool.query(
      `SELECT id FROM ratings WHERE job_request_id = $1 AND rated_by = $2`,
      [job_request_id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already rated this job' });
    }

    // Insert rating
    await pool.query(
      `INSERT INTO ratings (job_request_id, rated_by, rated_user, rating, review)
       VALUES ($1, $2, $3, $4, $5)`,
      [job_request_id, req.user.id, rated_user_id, rating, review || null]
    );

    // Update user average rating
    await pool.query(
      `UPDATE users SET 
       average_rating = (SELECT AVG(rating) FROM ratings WHERE rated_user = $1),
       rating_count = (SELECT COUNT(*) FROM ratings WHERE rated_user = $1)
       WHERE id = $1`,
      [rated_user_id]
    );

    return res.status(201).json({
      success: true,
      message: '⭐ Rating submitted successfully!'
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getWalletBalance, getTransactions, completeJobAndPay, rateUser };