const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products (with search & filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, farmer, status } = req.query;

    const query = {};

    // Filter by approval status - default only approved unless requested otherwise by admin/farmer
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    // Search by keyword in name or description
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by Category Slug or ID
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.category = cat._id;
      } else if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      }
    }

    // Filter by Farmer (User ID)
    if (farmer) {
      query.farmer = farmer;
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('farmer', 'name phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('farmer', 'name phone address');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Farmer only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, wholesalePrice, minWholesaleQty, unit, stock, images } = req.body;

    const catExists = await Category.findById(category);
    if (!catExists) {
      res.status(400);
      throw new Error('Invalid Category');
    }

    const product = await Product.create({
      name,
      description,
      category,
      farmer: req.user._id,
      price,
      wholesalePrice,
      minWholesaleQty: minWholesaleQty || 20,
      unit: unit || 'kg',
      stock,
      images: images || ['/images/placeholder.jpg'],
      status: 'approved', // Auto-approved in sandbox for convenience
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Farmer only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this product');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Farmer/Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Verify ownership or admin role
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate product status (approve/reject)
// @route   PUT /api/products/:id/moderate
// @access  Private (Admin only)
const moderateProduct = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.status = status;
    await product.save();

    res.json({ success: true, message: `Product is now ${status}`, product });
  } catch (error) {
    next(error);
  }
};

// Categories

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/products/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, image, description } = req.body;

    const catExists = await Category.findOne({ name });
    if (catExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, image, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  moderateProduct,
  getCategories,
  createCategory,
};
