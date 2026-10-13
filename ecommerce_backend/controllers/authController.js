

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); 
const pool = require('../db/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Gmail_USER, 
    pass: process.env.Gmail_SeCRET  
  }
});


const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
      [email, hashedPassword, username || null]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

   
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (email not found).' });
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.password);

    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials (incorrect password).' });
    }

 
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3h' } 
    );

    
    res.status(200).json({
      message: 'Logged in successfully!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error during user login:', error.message);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    const successMessage = { message: 'If the email exists, a password reset code has been sent.' };

    if (!user) {
        return res.status(200).json(successMessage);
    }

    const resetToken = crypto.randomInt(100000, 999999).toString(); 
    const expiry = new Date(Date.now() + 10 * 60000); 

    await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', 
        [resetToken, expiry, user.id]
    );

    const mailOptions = {
      from: 'MyCart Bliss Support',
      to: user.email,
      subject: 'Your Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
          <h2 style="color: #0d6efd; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Please use the verification code below to proceed:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px;">
            <h1 style="letter-spacing: 10px; color: #333; margin: 0;">${resetToken}</h1>
          </div>
          <p style="margin-top: 20px;">This code is valid for <b>10 minutes</b> only.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email or contact support.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to: ${user.email}`);

    res.status(200).json(successMessage);

  } catch (error) {
    console.error('Error in forgot password:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const userResult = await pool.query(
        'SELECT id, reset_token_expiry FROM users WHERE email = $1 AND reset_token = $2', 
        [email, token]
    );
    const user = userResult.rows[0];

    if (!user) {
        return res.status(400).json({ message: 'Invalid token or email.' });
    }

    if (new Date(user.reset_token_expiry) < Date.now()) {
        return res.status(400).json({ message: 'Token has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', 
        [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Error in reset password:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  registerUser,
  loginUser, 
  forgotPassword,
  resetPassword
};