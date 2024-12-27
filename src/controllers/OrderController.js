const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

class OrderController{

    // [GET] /order
    async viewOrder(req, res, next) {
        try {
            const user = req.user; 
            const userId = req.user._id;

            let cartItems = req.session.cart || [];

            if (user) {
                const cart = await Cart.findOne({ user: user._id }).populate('items.product');
                cartItems = cart ? cart.items : [];
            }

            const orders = await Order.find({ user: userId })
            .populate('items.product') 
            .sort({ createdAt: -1 });

            res.render('order', { orders, user, cartItems });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new OrderController;