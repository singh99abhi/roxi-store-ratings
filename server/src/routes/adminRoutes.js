const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes are guarded with ADMIN role check
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/stores', adminController.getStores);
router.post('/stores', adminController.createStore);

module.exports = router;
