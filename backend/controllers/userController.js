const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, keyword } = req.query;
  const query = { role: 'user' };
  if (keyword) query.$or = [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }];

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password -otp').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -otp');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

exports.toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin' });

  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, isBlocked: user.isBlocked, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
};