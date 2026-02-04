const express = require('express');
const router = express.Router();
// const Razorpay = require('razorpay'); // DISABLED for Static Deploy
// const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// Init Razorpay - DISABLED
/*
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
*/

// @desc    Create Razorpay Order (and temp DB order) - DISABLED
// @route   POST /api/payment/create
// @access  Private (Student)
router.post('/create', protect, async (req, res) => {
    res.status(503).json({ message: "Online payments disabled. Please use 'Pay at Counter' / Static Payment." });
    /*
    const { shopId, items, totalPrice } = req.body;

    try {
        // ... (Original logic preserved in comments for future restore)
    } catch (error) { ... }
    */
});

// @desc    Verify Payment - DISABLED
// @route   POST /api/payment/verify
// @access  Private (Student)
router.post('/verify', protect, async (req, res) => {
    res.status(503).json({ message: "Online payments disabled." });
});

// @desc    Create Static Order (No Razorpay)
// @route   POST /api/payment/create-static
// @access  Private (Student)
router.post('/create-static', protect, async (req, res) => {
    const { shopId, items, totalPrice } = req.body;

    try {
        const orderId = `ORDER_${Date.now()}`;

        // Validate and Decrement Stock
        const MenuItem = require('../models/MenuItem');

        for (const item of items) {
            const menuItem = await MenuItem.findById(item._id);
            if (!menuItem) throw new Error(`Item ${item.name} not found`);

            if (menuItem.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${menuItem.stock}` });
            }

            menuItem.stock -= item.quantity;
            await menuItem.save();
        }

        // Create Paid Order in Database directly
        const order = await Order.create({
            orderId,
            studentId: req.user._id,
            shopId,
            items,
            totalPrice,
            paymentStatus: 'paid', // Auto-paid
            razorpayOrderId: 'static_demo_id',
            razorpayPaymentId: 'static_demo_payment_id'
        });

        // Emit Socket event to Shopkeeper
        const io = req.app.get('socketio');
        if (io) {
            io.to(`shop:${shopId}`).emit('shopkeeper:new_order', order);
        }

        res.json({
            message: "Order placed successfully",
            orderId: order.orderId,
            dbOrderId: order._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

module.exports = router;
