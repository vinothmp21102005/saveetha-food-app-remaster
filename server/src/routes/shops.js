const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all active shops
// @route   GET /api/shops
// @access  Public
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find({ isActive: true });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all shops (Admin)
// @route   GET /api/shops/all
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const shops = await Shop.find({});
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a shop
// @route   POST /api/shops
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, description, imageUrl, ownerId } = req.body;

    try {
        const shopExists = await Shop.findOne({ name });
        if (shopExists) {
            return res.status(400).json({ message: 'Shop already exists' });
        }

        const shop = await Shop.create({
            name,
            description,
            imageUrl,
            ownerId
        });

        // Update User with shopId if ownerId is provided
        if (ownerId) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(ownerId, { shopId: shop._id });
        }

        res.status(201).json(shop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a shop
// @route   PUT /api/shops/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, description, imageUrl, ownerId, isActive } = req.body;

    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            shop.name = name || shop.name;
            shop.description = description || shop.description;
            shop.imageUrl = imageUrl || shop.imageUrl;
            shop.ownerId = ownerId || shop.ownerId;
            shop.isActive = isActive !== undefined ? isActive : shop.isActive;

            const updatedShop = await shop.save();

            // Update new owner's shopId if ownerId changed/present
            if (ownerId) {
                const User = require('../models/User');
                // Optional: Remove shopId from old owner if tracking history
                await User.findByIdAndUpdate(ownerId, { shopId: updatedShop._id });
            }

            res.json(updatedShop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete (Soft) a shop
// @route   DELETE /api/shops/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (shop) {
            shop.isActive = false;
            await shop.save();
            res.json({ message: 'Shop removed (soft delete)' });
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
