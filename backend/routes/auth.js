const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], ctrl.register);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/resend-otp', ctrl.resendOTP);
router.post('/login', ctrl.login);
router.post('/google', ctrl.googleLogin);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-reset-otp', ctrl.verifyResetOTP);
router.post('/reset-password', ctrl.resetPassword);
router.post('/logout', ctrl.logout);

router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, ctrl.updateProfile);
router.post('/address', protect, ctrl.addAddress);
router.put('/address/:addressId', protect, ctrl.updateAddress);
router.delete('/address/:addressId', protect, ctrl.deleteAddress);

module.exports = router;