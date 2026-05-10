const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

router.get('/dashboard', protect, admin, ctrl.getDashboardStats);

module.exports = router;
