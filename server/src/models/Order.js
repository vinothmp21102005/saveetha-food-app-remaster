const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const generateOrderId = () => uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        default: generateOrderId
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["received", "preparing", "ready", "picked_up"],
        default: "received"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
