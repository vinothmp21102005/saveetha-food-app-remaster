const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Shop = require('../models/Shop'); // May need validation
const { protect, admin, shopkeeper } = require('../middleware/auth');

// @desc    Get all menu items for a shop
// @route   GET /api/menu/:shopId
// @access  Public
router.get('/:shopId', async (req, res) => {
    try {
        // Build query
        let query = { shopId: req.params.shopId };

        // Determine role (handle unauthenticated users as students)
        let role = 'student';
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const User = require('../models/User'); // delayed import to avoid circular dependency issues if any
                const user = await User.findById(decoded.id);
                if (user) role = user.role;
            } catch (err) {
                // Invalid token, treat as student/guest
            }
        }

        // Filter for students/guests: Only Available (Stock check handled in UI)
        if (role !== 'admin' && role !== 'shopkeeper') {
            query.isAvailable = true;
            // query.stock = { $gt: 0 }; // DISABLED: Show out of stock items too
        }

        const menuItems = await MenuItem.find(query);
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add menu item
// @route   POST /api/menu
// @access  Private/Admin/Shopkeeper
router.post('/', protect, shopkeeper, async (req, res) => {
    const { shopId, name, description, price, category, imageUrl } = req.body;

    // Validate shop ownership if shopkeeper? (Simplified: assuming admin/shopkeeper role check covers enough for now, but ideal to check if user owns shop)

    try {
        const menuItem = await MenuItem.create({
            shopId,
            name,
            description,
            price,
            category,
            imageUrl
        });
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin/Shopkeeper
router.put('/:id', protect, shopkeeper, async (req, res) => {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (menuItem) {
            menuItem.name = name || menuItem.name;
            menuItem.description = description || menuItem.description;
            menuItem.price = price || menuItem.price;
            menuItem.category = category || menuItem.category;
            menuItem.imageUrl = imageUrl || menuItem.imageUrl;
            menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;

            const updatedMenuItem = await menuItem.save();
            res.json(updatedMenuItem);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin/Shopkeeper
router.delete('/:id', protect, shopkeeper, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (menuItem) {
            await menuItem.deleteOne();
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
