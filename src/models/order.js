const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
        },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] },
    paymentMethod: { type: String, enum: ['Cash On Delivery'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', Order);