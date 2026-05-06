const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// ─── REGISTER USER ────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      user_type,
      first_name,
      last_name,
      id_number,
      gender,
      nationality,
    } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !password || !user_type ||
        !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate user type
    if (!['worker', 'client', 'company'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 OR phone = $3',
      [email, username, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email, username or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users 
        (username, email, phone, password_hash, user_type, 
         first_name, last_name, id_number, gender, nationality, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, username, email, phone, user_type, 
                 first_name, last_name, status, created_at`,
      [
        username, email, phone, password_hash, user_type,
        first_name, last_name, id_number || null,
        gender || null, nationality || null,
        'pending'
      ]
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: '🎉 Registration successful! Your account is under review.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// ─── LOGIN USER ───────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password'
      });
    }

    // Find user by username or email
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE username = $1 OR email = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Contact support.'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: '✅ Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        wallet_balance: user.wallet_balance,
        performance_score: user.performance_score,
        average_rating: user.average_rating,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, phone, user_type, first_name, 
              last_name, status, wallet_balance, performance_score,
              average_rating, rating_count, address, is_available,
              created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { registerUser, loginUser, getMe };