// categories.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', ctrl.getCategories);
router.get('/all', protect, admin, ctrl.getAllCategories);
router.post('/', protect, admin, ctrl.createCategory);
router.put('/:id', protect, admin, ctrl.updateCategory);
router.delete('/:id', protect, admin, ctrl.deleteCategory);

module.exports = router;
