const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References User with role 'farmer'
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a retail price per unit'],
  },
  wholesalePrice: {
    type: Number,
    required: [true, 'Please add a wholesale price per unit'],
  },
  minWholesaleQty: {
    type: Number,
    default: 20, // Minimum units to unlock wholesale rate
  },
  unit: {
    type: String,
    enum: ['kg', 'maund', 'piece', 'sack'],
    default: 'kg',
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock availability'],
    min: [0, 'Stock cannot be negative'],
  },
  images: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0.0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // Auto-approved in seed / sandbox, but customizable
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
