const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, shopkeeper } = require('../middleware/auth');

// @desc    Get inventory for a shop
// @route   GET /api/inventory/:shopId
// @access  Private/Shopkeeper
router.get('/:shopId', protect, shopkeeper, async (req, res) => {
    // Verify this shopkeeper owns this shop
    if (req.user.shopId.toString() !== req.params.shopId) {
        return res.status(403).json({ message: "Access denied. Not your shop." });
    }

    try {
        const items = await MenuItem.find({ shopId: req.params.shopId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update stock for a single item
// @route   PUT /api/inventory/:itemId
// @access  Private/Shopkeeper
router.put('/:itemId', protect, shopkeeper, async (req, res) => {
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ message: "Stock must be a non-negative number" });
    }

    try {
        const item = await MenuItem.findById(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Only the shopkeeper assigned to this shop can manage its stock
        if (item.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({ message: "Access denied. Not your shop." });
        }

        item.stock = stock;
        await item.save();

        const io = req.app.get('socketio');
        // Broadcast stock update to all connected clients
        io.emit("stock:updated", { menuItemId: item._id, shopId: item.shopId, newStock: stock });

        // If stock just hit zero, also emit the out-of-stock event
        if (stock === 0) {
            io.emit("stock:out", { menuItemId: item._id, shopId: item.shopId });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
