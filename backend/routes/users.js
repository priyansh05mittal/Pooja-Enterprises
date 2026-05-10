const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/', ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.put('/:id/block', ctrl.toggleBlockUser);

module.exports = router;
