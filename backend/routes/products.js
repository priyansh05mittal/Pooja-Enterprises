const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', ctrl.getProducts);
router.get('/admin', protect, admin, ctrl.getAdminProducts);
router.get('/:slug', ctrl.getProduct);
router.get('/id/:id', protect, admin, ctrl.getProductById);
router.post('/', protect, admin, ctrl.createProduct);
router.put('/:id', protect, admin, ctrl.updateProduct);
router.delete('/:id', protect, admin, ctrl.deleteProduct);
router.post('/:id/review', protect, ctrl.addReview);

module.exports = router;
