const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Farmer = require('../models/Farmer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'agrolink_secret_key_bangladesh_agritech_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, farmName, farmSize, categoryFocus } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
    });

    // If farmer, create farmer profile
    if (role === 'farmer') {
      await Farmer.create({
        user: user._id,
        farmName: farmName || `${name}'s Fresh Farm`,
        farmSize: farmSize || 1.0,
        categoryFocus: categoryFocus || [],
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find User (include password for checking)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.status === 'suspended') {
      res.status(403);
      throw new Error('Your account has been suspended by an Admin');
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;
    
    if (req.body.address) {
      user.address.village = req.body.address.village || user.address.village;
      user.address.upazila = req.body.address.upazila || user.address.upazila;
      user.address.district = req.body.address.district || user.address.district;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer profile details
// @route   GET /api/auth/farmer/:userId
// @access  Public
const getFarmerProfile = async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ user: req.params.userId }).populate('user', 'name email phone avatar address');
    if (!farmer) {
      res.status(404);
      throw new Error('Farmer profile not found');
    }
    res.json({ success: true, farmer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farmer profile
// @route   PUT /api/auth/farmer
// @access  Private (Farmer only)
const updateFarmerProfile = async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) {
      res.status(404);
      throw new Error('Farmer profile not found');
    }

    farmer.farmName = req.body.farmName || farmer.farmName;
    farmer.farmSize = req.body.farmSize !== undefined ? req.body.farmSize : farmer.farmSize;
    farmer.categoryFocus = req.body.categoryFocus || farmer.categoryFocus;
    farmer.description = req.body.description || farmer.description;

    const updatedFarmer = await farmer.save();
    res.json({ success: true, farmer: updatedFarmer });
  } catch (error) {
    next(error);
  }
};

// Admin Routes

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active/suspended)
// @route   PUT /api/auth/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Admin status cannot be modified');
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({ success: true, message: `User account is now ${user.status}`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getFarmerProfile,
  updateFarmerProfile,
  getAllUsers,
  toggleUserStatus,
};
