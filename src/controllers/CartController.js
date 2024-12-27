const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

class CartController {
    async checkout(req, res, next) {
        try {
            const userId = req.user._id; 
            const { fullName, address, phone, paymentMethod, totalPrice } = req.body; 

            const cart = await Cart.findOne({ user: userId });

            if (!cart || cart.items.length === 0) {
                return res.status(400).send('Cart is empty, please add products to cart');
            }

            const newOrder = new Order({
                user: userId,
                fullName: fullName,
                address: address,
                phone: phone,
                paymentMethod: paymentMethod,
                items: cart.items,
                totalPrice: totalPrice,
                status: 'Pending',
                createdAt: new Date(),
            });

            await newOrder.save();

            const user = await User.findById(userId);
            if (user) {
                user.fullName = fullName;
                user.address = address;
                user.phone = phone;
                await user.save();
            }

            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();

            res.redirect(`/orders`);
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/remove
    async removeFromCart(req, res, next) {
        const { itemId } = req.body;  
    
        if (!itemId) {
            return res.status(400).json({ message: 'Invalid item ID' });
        }
    
        try {
            const cart = await Cart.findOne({ user: req.user._id });
    
            if (!cart) {
                return res.status(400).json({ message: 'Cart not found' });
            }
    
            const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1); 
                await cart.save();
                console.log('Item removed from cart:', itemId);
                res.redirect('/cart');  
            } else {
                res.status(400).json({ message: 'Item not found in cart' });
            }
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/update
    async updateCart(req, res, next) {
        const { itemId, newQuantity } = req.body;

        if (!newQuantity || newQuantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        try {
            const cart = await Cart.findOne({ user: req.user._id });

            if (!cart) {
                return res.status(400).json({ message: 'Cart not found' });
            }

            const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = newQuantity;
                await cart.save();
                res.redirect('/cart');
            } else {
                res.status(400).json({ message: 'Item not found in cart' });
            }
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/add
    async addToCart(req, res, next) {
        const { productId, quantity } = req.body;

        const quantityToAdd = quantity ? quantity : 1;

        if (!productId || quantityToAdd <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        try {
            let cart = await Cart.findOne({ user: req.user._id });

            if (!cart) {
                cart = new Cart({ user: req.user._id, items: [] });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;  
            } else {
                cart.items.push({ product: productId, quantity: quantityToAdd });
            }

            await cart.save();

            const redirectTo = req.get('referer') || '/cart';
            res.redirect(redirectTo);
        } catch (error) {
            next(error);
        }
    }

    // [GET] /cart
    async viewCart(req, res, next) {
        try {
            const user = req.user; 

            let cartItems = req.session.cart || [];

            let totalPrice = 0;

            if (user) {
                const cart = await Cart.findOne({ user: user._id }).populate('items.product');
                cartItems = cart ? cart.items : [];
            }

            cartItems.forEach(item => {
                totalPrice += item.product.price * item.quantity;
            })

            res.render('cart', { cartItems, user, totalPrice });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController;