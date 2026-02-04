const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

// @desc    Get Admin Analytics (Total Business per Shop)
// @route   GET /api/orders/analytics/admin
// @access  Private/Admin
router.get('/analytics/admin', protect, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

    try {
        const analytics = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } }, // Only count paid orders
            {
                $group: {
                    _id: "$shopId",
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "shop"
                }
            },
            { $unwind: "$shop" },
            {
                $project: {
                    shopName: "$shop.name",
                    totalOrders: 1,
                    totalRevenue: 1
                }
            }
        ]);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Shop Analytics (Personal Business)
// @route   GET /api/orders/analytics/shop/:shopId
// @access  Private/Shopkeeper
router.get('/analytics/shop/:shopId', protect, shopkeeper, async (req, res) => {
    try {
        const shopId = new mongoose.Types.ObjectId(req.params.shopId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const stats = await Order.aggregate([
            { $match: { shopId: shopId, paymentStatus: 'paid' } },
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: "$totalPrice" },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ],
                    todayStats: [
                        { $match: { createdAt: { $gte: todayStart } } },
                        {
                            $group: {
                                _id: null,
                                todayRevenue: { $sum: "$totalPrice" },
                                todayOrders: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            totalRevenue: stats[0].totalStats[0]?.totalRevenue || 0,
            totalOrders: stats[0].totalStats[0]?.totalOrders || 0,
            todayRevenue: stats[0].todayStats[0]?.todayRevenue || 0,
            todayOrders: stats[0].todayStats[0]?.todayOrders || 0
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
