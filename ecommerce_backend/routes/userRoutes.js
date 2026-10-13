

const express = require('express');
const router = express.Router();
const pool = require('../db/db'); 
const bcrypt = require('bcrypt');
const { protect } = require('../middleware/authMiddleware'); 



router.get('/profile', protect, async (req, res) => {
  const userId = req.user.id; 
  
  try {

      const dbResult = await pool.query( 
          'SELECT id, email, username, created_at FROM users WHERE id = $1',
          [userId]
      );

      if (dbResult.rows.length === 0) {
          return res.status(404).json({ message: 'User profile not found.' });
      }
      
      res.status(200).json({
          message: 'User profile accessed successfully!',
          user: dbResult.rows[0] 
      });
      
  } catch (error) {
      console.error('Database error fetching profile:', error.message);
      res.status(500).json({ message: 'Server error.', details: error.message });
  }
});


router.put('/profile', protect, async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body; 

  try {
      let queryText = 'UPDATE users SET ';
      const queryParams = [];
      let index = 1;
      const updates = [];

      if (username) {
          updates.push(`username = $${index++}`);
          queryParams.push(username);
      }
      if (email) {
          updates.push(`email = $${index++}`);
          queryParams.push(email);
      }

      if (updates.length === 0) {
          return res.status(400).json({ message: 'No fields provided for update.' });
      }
      
      queryText += updates.join(', ');
      queryText += ` WHERE id = $${index} RETURNING id, email, username, created_at`;
      queryParams.push(userId);
      
      const dbResult = await pool.query(queryText, queryParams);

      if (dbResult.rows.length === 0) {
          return res.status(404).json({ message: 'User not found or nothing changed.' });
      }
      
      res.status(200).json({
          message: 'Profile updated successfully!',
          user: dbResult.rows[0]
      });

  } catch (error) {
      if (error.code === '23505') { 
            return res.status(409).json({ message: 'Username or email already in use.' });
      }
      console.error('Database error updating profile:', error);
      res.status(500).json({ message: 'Server error during update.' });
  }
});



router.put('/change-password', protect, async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;