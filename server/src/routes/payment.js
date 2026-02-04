const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// Init Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order (and temp DB order)
// @route   POST /api/payment/create
// @access  Private (Student)
router.post('/create', protect, async (req, res) => {
    const { shopId, items, totalPrice } = req.body;

    try {
        // Validate Stock
        const MenuItem = require('../models/MenuItem');
        for (const item of items) {
            const menuItem = await MenuItem.findById(item._id);
            if (!menuItem) throw new Error(`Item ${item.name} not found`);
            if (menuItem.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${menuItem.stock}` });
            }
        }

        // 1. Create Order in Razorpay
        const options = {
            amount: totalPrice * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 2. Create Order in Database (Status: Pending)
        const order = await Order.create({
            studentId: req.user._id,
            shopId,
            items,
            totalPrice,
            paymentStatus: 'pending',
            razorpayOrderId: razorpayOrder.id
        });

        res.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            dbOrderId: order._id,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
});

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private (Student)
router.post('/verify', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update Order Status
        const order = await Order.findById(dbOrderId);
        if (order) {
            order.paymentStatus = 'paid';
            order.razorpayPaymentId = razorpay_payment_id;
            order.createdAt = new Date(); // Reset timestamp to payment time for FIFO
            await order.save();

            // Emit Socket event to Shopkeeper
            const io = req.app.get('socketio');
            io.to(`shop:${order.shopId}`).emit('shopkeeper:new_order', order);

            res.json({ message: "Payment verified", orderId: order.orderId });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } else {
        res.status(400).json({ message: "Payment verification failed" });
    }
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
