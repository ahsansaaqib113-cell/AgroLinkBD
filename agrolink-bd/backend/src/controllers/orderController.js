const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');

// @desc    Create new orders (splits multi-farmer orders)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items found');
    }

    // Resolve products and group items by farmer
    const groupedItems = {}; // { farmerId: [items] }
    let discountPercent = 0;
    let discountFlat = 0;

    // Verify Coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date()) {
        if (coupon.discountType === 'percentage') {
          discountPercent = coupon.discountValue;
        } else {
          discountFlat = coupon.discountValue;
        }
      }
    }

    // Validate products and stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const farmerId = product.farmer.toString();
      if (!groupedItems[farmerId]) {
        groupedItems[farmerId] = [];
      }

      // Determine price: retail vs wholesale
      const isWholesale = item.quantity >= product.minWholesaleQty;
      const unitPrice = isWholesale ? product.wholesalePrice : product.price;

      groupedItems[farmerId].push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: unitPrice,
        purchaseType: isWholesale ? 'wholesale' : 'retail',
        unit: product.unit,
      });

      // Deduct Stock
      product.stock -= item.quantity;
      await product.save();
    }

    const createdOrders = [];

    // Create an order per farmer
    for (const farmerId in groupedItems) {
      const farmerItems = groupedItems[farmerId];
      let orderSubtotal = farmerItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

      // Apply coupon discount proportionally or simple flat division
      let discountAmount = 0;
      if (discountPercent > 0) {
        discountAmount = parseFloat(((orderSubtotal * discountPercent) / 100).toFixed(2));
      } else if (discountFlat > 0) {
        // Flat discount is shared proportionally or given to the first order
        discountAmount = Math.min(discountFlat, orderSubtotal);
        discountFlat -= discountAmount; // Subtract applied discount
      }

      const totalAmount = parseFloat((orderSubtotal - discountAmount).toFixed(2));

      const order = await Order.create({
        buyer: req.user._id,
        farmer: farmerId,
        items: farmerItems,
        totalAmount,
        discountAmount,
        couponCode: couponCode || '',
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        shippingStatus: 'pending',
      });

      // Send notification to farmer
      await Notification.create({
        user: farmerId,
        title: 'New Order Received',
        message: `You received a new order (${order.trackingNumber}) worth BDT ${order.totalAmount}`,
        type: 'order',
      });

      createdOrders.push(order);
    }

    // Send notification to buyer
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully',
      message: `Your order(s) have been placed. Tracking reference: ${createdOrders.map(o => o.trackingNumber).join(', ')}`,
      type: 'order',
    });

    res.status(201).json({
      success: true,
      message: 'Orders created successfully',
      orders: createdOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('farmer', 'name phone address')
      .populate('items.product', 'images name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer orders
// @route   GET /api/orders/farmer
// @access  Private (Farmer only)
const getFarmerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('buyer', 'name phone address')
      .populate('items.product', 'images name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name phone address')
      .populate('items.product', 'images name description');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorization: User, Farmer, or Admin
    if (
      order.buyer._id.toString() !== req.user._id.toString() &&
      order.farmer._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order payment status (Mock Payment Gateway integration)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderPaymentStatus = async (req, res, next) => {
  try {
    const { status, paymentDetails } = req.body; // mock payment details (txnId, cardInfo, etc.)
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (status === 'paid') {
      order.paymentStatus = 'paid';
      order.invoiceUrl = `/invoices/${order.trackingNumber}.pdf`; // Simulated invoice path
      await order.save();

      // Notify Farmer
      await Notification.create({
        user: order.farmer,
        title: 'Payment Confirmed',
        message: `Payment of BDT ${order.totalAmount} for order ${order.trackingNumber} has been received.`,
        type: 'order',
      });

      // Notify Buyer
      await Notification.create({
        user: order.buyer,
        title: 'Payment Received',
        message: `Your payment for order ${order.trackingNumber} is successful. Invoice is ready.`,
        type: 'order',
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
    }

    res.json({ success: true, message: 'Payment status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order shipping status
// @route   PUT /api/orders/:id/shipping
// @access  Private (Farmer/Admin only)
const updateOrderShippingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // pending, processing, shipped, delivered, cancelled
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify ownership
    if (order.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update shipment status');
    }

    order.shippingStatus = status;

    // If order is delivered, update farmer earnings & order count
    if (status === 'delivered') {
      const farmerProfile = await Farmer.findOne({ user: order.farmer });
      if (farmerProfile) {
        farmerProfile.earnings += order.totalAmount;
        farmerProfile.completedOrders += 1;
        await farmerProfile.save();
      }
    }

    // Refund stock if cancelled
    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    // Notify Buyer
    await Notification.create({
      user: order.buyer,
      title: 'Order Status Update',
      message: `Your order ${order.trackingNumber} has been updated to: ${status}`,
      type: 'order',
    });

    res.json({ success: true, message: `Shipping status updated to ${status}`, order });
  } catch (error) {
    next(error);
  }
};

// Coupon Management

// @desc    Validate a Coupon
// @route   POST /api/orders/coupons/validate
// @access  Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      res.status(404);
      throw new Error('Invalid coupon code');
    }

    if (coupon.expiryDate < new Date()) {
      res.status(400);
      throw new Error('Coupon code has expired');
    }

    if (amount < coupon.minOrderAmount) {
      res.status(400);
      throw new Error(`Minimum purchase amount for this coupon is BDT ${coupon.minOrderAmount}`);
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/orders/coupons
// @access  Private (Admin only)
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Coupon
// @route   POST /api/orders/coupons
// @access  Private (Admin only)
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      expiryDate,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  validateCoupon,
  getCoupons,
  createCoupon,
};
