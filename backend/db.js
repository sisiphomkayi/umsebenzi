const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'umsebenzi',
  host: 'localhost',
  database: 'umsebenzi_db',
  password: 'umsebenzi2026',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to umsebenzi_db database!');
  }
});

module.exports = pool;