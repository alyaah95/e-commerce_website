

const express = require('express');
const pool = require('../db/db'); 
const router = express.Router();

router.get('/create-users-table', async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    res.status(200).send('Users table created or already exists successfully!');
  } catch (err) {
    console.error('Error creating users table:', err.message);
    res.status(500).send('Error creating users table.');
  }
});

module.exports = router;