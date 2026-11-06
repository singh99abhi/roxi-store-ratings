const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, storeController.getAllStores);
router.get('/owner/dashboard', authenticateToken, authorizeRoles('STORE_OWNER'), storeController.getOwnerStoreDashboard);

module.exports = router;
