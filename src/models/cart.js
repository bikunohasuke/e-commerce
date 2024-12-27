const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
});

module.exports = mongoose.model('Cart', Cart);