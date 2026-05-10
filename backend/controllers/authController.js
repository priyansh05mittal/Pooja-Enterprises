const crypto = require('crypto');
const { validationResult } = require('express-validator');
const axios = require('axios');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const { sendToken } = require('../middleware/auth');
const { sendEmail, otpEmailTemplate } = require('../utils/email');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  await PendingUser.deleteMany({ email });

  const pendingUser = await PendingUser.create({ name, email, password, phone });
  const otp = pendingUser.generateOTP();
  await pendingUser.save();

  await sendEmail({ email, subject: 'Verify your email - Pooja Enterprises', html: otpEmailTemplate(otp, 'verify') });

  res.status(201).json({ success: true, message: 'OTP sent to email', userId: pendingUser._id });
};

exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const pendingUser = await PendingUser.findOne({ _id: userId, otp: hashedOtp, otpExpire: { $gt: Date.now() } });
  if (!pendingUser) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  const user = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    phone: pendingUser.phone,
    isVerified: true
  });

  await PendingUser.findByIdAndDelete(userId);

  res.status(200).json({ success: true, message: 'Account created successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (!user.isVerified) return res.status(403).json({ success: false, message: 'Please verify your email first', userId: user._id });
  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account has been blocked' });

  sendToken(user, 200, res);
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  const { data } = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${credential}` },
  });

  const { sub: googleId, email, name, picture } = data;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId, avatar: picture, isVerified: true });
  }

  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });

  sendToken(user, 200, res);
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

  const otp = user.generateOTP();
  await user.save();

  await sendEmail({ email: user.email, subject: 'Password Reset OTP - Pooja Enterprises', html: otpEmailTemplate(otp, 'reset') });

  res.json({ success: true, message: 'OTP sent to email', userId: user._id });
};

exports.verifyResetOTP = async (req, res) => {
  const { userId, otp } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({ _id: userId, otp: hashedOtp, otpExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  res.status(200).json({ success: true, message: 'OTP verified' });
};

exports.resetPassword = async (req, res) => {
  const { userId, otp, password } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({ _id: userId, otp: hashedOtp, otpExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  user.password = password;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful' });
};

exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
  res.json({ success: true, user });
};

exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.addresses.length >= 5) return res.status(400).json({ success: false, message: 'Max 5 addresses allowed' });

  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
};

exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
};

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};

exports.resendOTP = async (req, res) => {
  let user = await User.findById(req.body.userId);
  let isPending = false;

  if (!user) {
    user = await PendingUser.findById(req.body.userId);
    isPending = true;
  }

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const otp = user.generateOTP();
  await user.save();

  await sendEmail({ email: user.email, subject: 'OTP - Pooja Enterprises', html: otpEmailTemplate(otp, isPending ? 'verify' : 'reset') });
  res.json({ success: true, message: 'OTP resent' });
};
