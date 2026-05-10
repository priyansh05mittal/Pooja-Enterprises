const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');

router.get('/active', ctrl.getActiveBanners);
router.post('/:id/click', ctrl.trackClick);
router.get('/', protect, admin, ctrl.getAllBanners);
router.post('/', protect, admin, ctrl.createBanner);
router.put('/:id', protect, admin, ctrl.updateBanner);
router.delete('/:id', protect, admin, ctrl.deleteBanner);

module.exports = router;
