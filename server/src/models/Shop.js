const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    imageUrl: String,
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
