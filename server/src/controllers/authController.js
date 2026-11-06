const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword
} = require('../utils/validators');

async function register(req, res) {
  try {
    const { name, email, password, address } = req.body;

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ message: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ message: addressErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ message: passErr });

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?) RETURNING id, name, email, address, role, created_at',
      [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), 'USER']
    );

    let newUser;
    if (result.rows && result.rows.length > 0) {
      newUser = result.rows[0];
    } else {
      const fetchNew = await query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
      newUser = fetchNew.rows[0];
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at
    };

    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
}

async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      return res.status(400).json({ message: passErr });
    }

    const userResult = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, userId]);

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[UpdatePassword Error]', error);
    return res.status(500).json({ message: 'Server error updating password.' });
  }
}

async function getMe(req, res) {
  try {
    const result = await query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({ message: 'Server error fetching user profile.' });
  }
}

module.exports = {
  register,
  login,
  updatePassword,
  getMe
};
