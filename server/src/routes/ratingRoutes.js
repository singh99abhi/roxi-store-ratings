const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, ratingController.submitOrUpdateRating);
router.get('/my', authenticateToken, ratingController.getUserRatings);

module.exports = router;
