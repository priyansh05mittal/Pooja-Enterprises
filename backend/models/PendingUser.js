const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    otp: { type: String },
    otpExpire: { type: Date },
  },
  { timestamps: true }
);

pendingUserSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  return otp;
};

module.exports = mongoose.model('PendingUser', pendingUserSchema);
