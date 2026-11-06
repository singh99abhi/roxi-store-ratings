const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword
} = require('../utils/validators');

async function getDashboardStats(req, res) {
  try {
    const userCountRes = await query('SELECT COUNT(*) as count FROM users');
    const storeCountRes = await query('SELECT COUNT(*) as count FROM stores');
    const ratingCountRes = await query('SELECT COUNT(*) as count FROM ratings');

    const totalUsers = parseInt(userCountRes.rows[0].count, 10) || 0;
    const totalStores = parseInt(storeCountRes.rows[0].count, 10) || 0;
    const totalRatings = parseInt(ratingCountRes.rows[0].count, 10) || 0;

    return res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('[Admin Dashboard Stats Error]', error);
    return res.status(500).json({ message: 'Server error retrieving dashboard metrics.' });
  }
}

async function getUsers(req, res) {
  try {
    const { name, email, address, role, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    let baseSql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.name AS store_name,
        ROUND(AVG(r.rating), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      baseSql += ' AND LOWER(u.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }
    if (email) {
      baseSql += ' AND LOWER(u.email) LIKE ?';
      params.push(`%${email.toLowerCase()}%`);
    }
    if (address) {
      baseSql += ' AND LOWER(u.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }
    if (role) {
      baseSql += ' AND u.role = ?';
      params.push(role);
    }

    baseSql += ' GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.name';

    const allowedSortFields = {
      id: 'u.id',
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
      rating: 'store_rating'
    };
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortColumn = allowedSortFields[sortBy] || 'u.id';

    baseSql += ` ORDER BY ${sortColumn} ${orderDirection}`;

    const result = await query(baseSql, params);
    return res.json({ users: result.rows });
  } catch (error) {
    console.error('[Admin getUsers Error]', error);
    return res.status(500).json({ message: 'Server error retrieving users.' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, address, role = 'USER' } = req.body;

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ message: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ message: addressErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ message: passErr });

    const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified. Must be ADMIN, USER, or STORE_OWNER.' });
    }

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), role]
    );

    const newId = result.lastInsertRowid || (result.rows && result.rows[0]?.id);
    const fetchNew = await query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [newId]);

    return res.status(201).json({
      message: 'User created successfully.',
      user: fetchNew.rows[0]
    });
  } catch (error) {
    console.error('[Admin createUser Error]', error);
    return res.status(500).json({ message: 'Server error creating user.' });
  }
}

async function getStores(req, res) {
  try {
    const { name, email, address, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    let baseSql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      baseSql += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }
    if (email) {
      baseSql += ' AND LOWER(s.email) LIKE ?';
      params.push(`%${email.toLowerCase()}%`);
    }
    if (address) {
      baseSql += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }

    baseSql += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name, u.email';

    const allowedSort = {
      id: 's.id',
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'overall_rating',
      total_ratings: 'total_ratings'
    };
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortCol = allowedSort[sortBy] || 's.id';

    baseSql += ` ORDER BY ${sortCol} ${orderDirection}`;

    const result = await query(baseSql, params);
    return res.json({ stores: result.rows });
  } catch (error) {
    console.error('[Admin getStores Error]', error);
    return res.status(500).json({ message: 'Server error retrieving stores.' });
  }
}

async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Store Name is required.' });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ message: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ message: addressErr });

    let finalOwnerId = null;
    if (ownerId) {
      const ownerCheck = await query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Assigned store owner not found.' });
      }
      finalOwnerId = ownerId;
    }

    const insertRes = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), finalOwnerId]
    );

    const newId = insertRes.lastInsertRowid || (insertRes.rows && insertRes.rows[0]?.id);
    const fetchRes = await query('SELECT * FROM stores WHERE id = ?', [newId]);

    return res.status(201).json({
      message: 'Store created successfully.',
      store: fetchRes.rows[0]
    });
  } catch (error) {
    console.error('[Admin createStore Error]', error);
    return res.status(500).json({ message: 'Server error creating store.' });
  }
}

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getStores,
  createStore
};
