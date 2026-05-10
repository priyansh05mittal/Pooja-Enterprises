const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.post('/', ctrl.createOrder);
router.post('/verify-payment', ctrl.verifyPayment);
router.get('/my', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrderById);
router.get('/', admin, ctrl.getAllOrders);
router.put('/:id/status', admin, ctrl.updateOrderStatus);

module.exports = router;
