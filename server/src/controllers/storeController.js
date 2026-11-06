const { query } = require('../config/db');

async function getAllStores(req, res) {
  try {
    const { search, name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings,
        ur.rating AS user_submitted_rating,
        ur.id AS user_rating_id
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [currentUserId];

    if (search) {
      sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (name) {
      sql += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }
    if (address) {
      sql += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }

    sql += ' GROUP BY s.id, s.name, s.email, s.address, ur.rating, ur.id';

    const allowedSort = {
      id: 's.id',
      name: 's.name',
      address: 's.address',
      email: 's.email',
      rating: 'overall_rating',
      userRating: 'user_submitted_rating'
    };
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortCol = allowedSort[sortBy] || 's.name';

    sql += ` ORDER BY ${sortCol} ${orderDirection}`;

    const result = await query(sql, params);
    return res.json({ stores: result.rows });
  } catch (error) {
    console.error('[getAllStores Error]', error);
    return res.status(500).json({ message: 'Server error retrieving stores catalog.' });
  }
}

async function getOwnerStoreDashboard(req, res) {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    // Find the store belonging to this owner
    const storeRes = await query(
      `SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        ROUND(AVG(r.rating), 1) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id, s.name, s.email, s.address`,
      [ownerId]
    );

    if (storeRes.rows.length === 0) {
      return res.status(404).json({
        message: 'No store is currently associated with your Store Owner account. Please contact an administrator to register your store.'
      });
    }

    const store = storeRes.rows[0];

    // Get list of users who submitted ratings for this store
    let ratersSql = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
    `;

    const allowedSort = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at'
    };
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortCol = allowedSort[sortBy] || 'r.created_at';

    ratersSql += ` ORDER BY ${sortCol} ${orderDirection}`;

    const ratersRes = await query(ratersSql, [store.id]);

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.average_rating ? Number(store.average_rating) : 0,
        totalRatings: parseInt(store.total_ratings, 10) || 0
      },
      raters: ratersRes.rows
    });
  } catch (error) {
    console.error('[getOwnerStoreDashboard Error]', error);
    return res.status(500).json({ message: 'Server error retrieving owner dashboard.' });
  }
}

module.exports = {
  getAllStores,
  getOwnerStoreDashboard
};
