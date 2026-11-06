const { query } = require('../config/db');
const { validateRating } = require('../utils/validators');

async function submitOrUpdateRating(req, res) {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ message: ratingErr });
    }

    // Verify store exists
    const storeRes = await query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (storeRes.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if user already submitted a rating for this store
    const existingRes = await query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let action = 'submitted';
    if (existingRes.rows.length > 0) {
      // Update existing rating
      await query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, existingRes.rows[0].id]
      );
      action = 'modified';
    } else {
      // Insert new rating
      await query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    // Recalculate store stats
    const statsRes = await query(
      'SELECT ROUND(AVG(rating), 1) as overall_rating, COUNT(id) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.json({
      message: `Rating successfully ${action}!`,
      rating: Number(rating),
      storeId,
      overallRating: statsRes.rows[0].overall_rating ? Number(statsRes.rows[0].overall_rating) : rating,
      totalRatings: parseInt(statsRes.rows[0].total_ratings, 10) || 1
    });
  } catch (error) {
    console.error('[submitOrUpdateRating Error]', error);
    return res.status(500).json({ message: 'Server error submitting rating.' });
  }
}

async function getUserRatings(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT 
        r.id, 
        r.rating, 
        r.created_at, 
        r.updated_at,
        s.id AS store_id, 
        s.name AS store_name, 
        s.address AS store_address
      FROM ratings r
      JOIN stores s ON s.id = r.store_id
      WHERE r.user_id = ?
      ORDER BY r.updated_at DESC`,
      [userId]
    );

    return res.json({ ratings: result.rows });
  } catch (error) {
    console.error('[getUserRatings Error]', error);
    return res.status(500).json({ message: 'Server error fetching user ratings.' });
  }
}

module.exports = {
  submitOrUpdateRating,
  getUserRatings
};
