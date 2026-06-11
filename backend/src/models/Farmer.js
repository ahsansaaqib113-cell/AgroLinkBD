const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  farmName: {
    type: String,
    required: [true, 'Please add a farm name'],
    trim: true,
  },
  farmSize: {
    type: Number, // In Decimals or Acres
    required: [true, 'Please add farm size'],
  },
  categoryFocus: [
    {
      type: String,
      trim: true,
    },
  ],
  description: {
    type: String,
    default: 'A proud Bangladeshi farmer bringing fresh harvests to your table.',
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5.0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  earnings: {
    type: Number,
    default: 0,
  },
  completedOrders: {
    type: Number,
    default: 0,
  },
  certificationImages: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Farmer', FarmerSchema);
