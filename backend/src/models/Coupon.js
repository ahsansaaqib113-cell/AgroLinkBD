const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add a discount value'],
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add an expiry date'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', CouponSchema);
