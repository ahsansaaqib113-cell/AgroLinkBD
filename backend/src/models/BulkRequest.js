const mongoose = require('mongoose');

const BulkRequestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: [true, 'Please specify the product required'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  quantityRequired: {
    type: Number,
    required: [true, 'Please specify quantity required'],
  },
  unit: {
    type: String,
    enum: ['kg', 'maund', 'piece', 'sack'],
    default: 'kg',
  },
  targetPrice: {
    type: Number, // Target price per unit
    required: [true, 'Please add target price'],
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Please specify delivery deadline'],
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'completed', 'cancelled'],
    default: 'open',
  },
  proposals: [
    {
      farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      farmName: String,
      proposedPrice: Number,
      message: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BulkRequest', BulkRequestSchema);
