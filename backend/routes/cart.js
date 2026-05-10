const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getCart);
router.post('/add', ctrl.addToCart);
router.put('/item/:itemId', ctrl.updateCartItem);
router.delete('/item/:itemId', ctrl.removeFromCart);
router.delete('/clear', ctrl.clearCart);

router.get('/wishlist', ctrl.getWishlist);
router.post('/wishlist/toggle', ctrl.toggleWishlist);

module.exports = router;
