const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getWishlist);
router.post('/toggle', ctrl.toggleWishlist);

module.exports = router;
