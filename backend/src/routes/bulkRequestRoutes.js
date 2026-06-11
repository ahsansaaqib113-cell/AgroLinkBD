const express = require('express');
const router = express.Router();
const BulkRequest = require('../models/BulkRequest');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleGuard');

// @desc    Create bulk request
// @route   POST /api/bulk
// @access  Private (Business only)
router.post('/', protect, authorize('business'), async (req, res, next) => {
  try {
    const { productName, category, quantityRequired, unit, targetPrice, deliveryDate, description } = req.body;

    const bulk = await BulkRequest.create({
      buyer: req.user._id,
      productName,
      category,
      quantityRequired,
      unit,
      targetPrice,
      deliveryDate,
      description,
    });

    // Notify farmers
    await Notification.create({
      user: req.user._id, // notify log for buyer
      title: 'Bulk Request Created',
      message: `Your request for ${quantityRequired} ${unit} of ${productName} has been published.`,
      type: 'general',
    });

    res.status(201).json({ success: true, bulk });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all active bulk requests
// @route   GET /api/bulk
// @access  Private (Farmers or Business Buyers)
router.get('/', protect, async (req, res, next) => {
  try {
    const bulks = await BulkRequest.find({ status: 'open' })
      .populate('buyer', 'name phone address')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, bulks });
  } catch (error) {
    next(error);
  }
});

// @desc    Get my bulk requests
// @route   GET /api/bulk/my
// @access  Private (Business only)
router.get('/my', protect, authorize('business'), async (req, res, next) => {
  try {
    const bulks = await BulkRequest.find({ buyer: req.user._id })
      .populate('category', 'name')
      .populate('proposals.farmer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bulks });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit farmer proposal
// @route   POST /api/bulk/:id/proposals
// @access  Private (Farmer only)
router.post('/:id/proposals', protect, authorize('farmer'), async (req, res, next) => {
  try {
    const { proposedPrice, message } = req.body;
    const bulk = await BulkRequest.findById(req.params.id);

    if (!bulk) {
      res.status(404);
      throw new Error('Bulk request not found');
    }

    if (bulk.status !== 'open') {
      res.status(400);
      throw new Error('This bulk request is no longer open');
    }

    // Check if farmer already submitted a proposal
    const alreadySubmitted = bulk.proposals.some(p => p.farmer.toString() === req.user._id.toString());
    if (alreadySubmitted) {
      res.status(400);
      throw new Error('You have already submitted a proposal for this request');
    }

    bulk.proposals.push({
      farmer: req.user._id,
      farmName: req.user.name + ' Farm',
      proposedPrice,
      message,
    });

    await bulk.save();

    // Notify Business Buyer
    await Notification.create({
      user: bulk.buyer,
      title: 'New Proposal Received',
      message: `Farmer ${req.user.name} proposed BDT ${proposedPrice} for your request of ${bulk.productName}`,
      type: 'general',
    });

    res.status(201).json({ success: true, message: 'Proposal submitted', bulk });
  } catch (error) {
    next(error);
  }
});

// @desc    Accept proposal
// @route   PUT /api/bulk/:id/proposals/:proposalId/accept
// @access  Private (Business only)
router.put('/:id/proposals/:proposalId/accept', protect, authorize('business'), async (req, res, next) => {
  try {
    const bulk = await BulkRequest.findById(req.params.id);

    if (!bulk) {
      res.status(404);
      throw new Error('Bulk request not found');
    }

    if (bulk.buyer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to accept proposals for this request');
    }

    const proposal = bulk.proposals.id(req.params.proposalId);
    if (!proposal) {
      res.status(404);
      throw new Error('Proposal not found');
    }

    // Accept selected proposal, reject others
    bulk.proposals.forEach(p => {
      if (p._id.toString() === req.params.proposalId.toString()) {
        p.status = 'accepted';
      } else {
        p.status = 'rejected';
      }
    });

    bulk.status = 'accepted';
    await bulk.save();

    // Notify the winning farmer
    await Notification.create({
      user: proposal.farmer,
      title: 'Proposal Accepted!',
      message: `Your proposal for ${bulk.productName} has been accepted by ${req.user.name}. Contact phone: ${req.user.phone}`,
      type: 'order',
    });

    res.json({ success: true, message: 'Proposal accepted', bulk });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
