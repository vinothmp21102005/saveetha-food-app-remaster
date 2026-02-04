const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, shopkeeper } = require('../middleware/auth');

// @desc    Get active orders (FIFO)
// @route   GET /api/orders/shop/:shopId
// @access  Private/Shopkeeper
router.get('/shop/:shopId', protect, shopkeeper, async (req, res) => {
    try {
        const orders = await Order.find({
            shopId: req.params.shopId,
            paymentStatus: { $in: ["paid", "pending"] }, // Include pending for dev testing if razorpay skipped, else strictly "paid"
            orderStatus: { $in: ["received", "preparing", "ready"] }
        })
            .sort({ createdAt: 1 }) // FIFO: Oldest first
            .populate('studentId', 'name email');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get order history
// @route   GET /api/orders/shop/:shopId/history
// @access  Private/Shopkeeper
router.get('/shop/:shopId/history', protect, shopkeeper, async (req, res) => {
    try {
        const orders = await Order.find({
            shopId: req.params.shopId,
            paymentStatus: "paid",
            orderStatus: { $in: ["picked_up", "cancelled"] }
        })
            .sort({ createdAt: -1 }) // Newest first for history
            .populate('studentId', 'name email');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Shopkeeper
router.put('/:id/status', protect, shopkeeper, async (req, res) => {
    const { status } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = status;
            const updatedOrder = await order.save();

            // Emit socket event
            // Emit socket event to Student
            const io = req.app.get('socketio');
            io.to(`student:${order.studentId.toString()}`).emit('order:status_update', {
                orderId: order._id,
                status: updatedOrder.orderStatus
            });

            // Emit socket event to Shopkeeper
            io.to(`shop:${order.shopId.toString()}`).emit('order:status_update', {
                orderId: order._id,
                status: updatedOrder.orderStatus
            });

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get student orders
// @route   GET /api/orders/myorders
// @access  Private/Student
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('shopId', 'name imageUrl');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all active orders (Admin)
// @route   GET /api/orders/admin/active
// @access  Private/Admin
router.get('/admin/active', protect, async (req, res) => {
    // Check if user is admin (simple check, or use middleware)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const orders = await Order.find({
            paymentStatus: { $in: ["paid", "pending"] },
            orderStatus: { $in: ["received", "preparing", "ready"] }
        })
            .sort({ createdAt: 1 })
            .populate('shopId', 'name')
            .populate('studentId', 'name');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
