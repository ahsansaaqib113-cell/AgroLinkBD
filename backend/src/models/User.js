const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  phone: {
    type: String,
    required: [true, 'Please add a Bangladeshi phone number'],
    match: [/^(?:\+88|88)?(01[3-9]\d{8})$/, 'Please add a valid Bangladeshi phone number'],
  },
  role: {
    type: String,
    enum: ['customer', 'farmer', 'business', 'admin'],
    default: 'customer',
  },
  avatar: {
    type: String,
    default: '',
  },
  address: {
    village: { type: String, default: '' },
    upazila: { type: String, default: '' },
    district: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in database
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
