const Cart = require('../models/cart');
const Category = require('../models/category');
const User = require('../models/user');

class SiteController {

    // [GET] /
    async index(req, res, next) {
        try {
            const categories = await Category.find();
            const user = req.session.user || null;  

            let cartItems = req.session.cart || [];

            if (user) {
                const cart = await Cart.findOne({ user: user._id }).populate('items.product');
                cartItems = cart ? cart.items : [];
            }

            res.render('index', { title: 'Welcome to My Website', categories, cartItems, user });
        } catch (error) {
            next(error); 
        }
    }

    // [GET] /about
    about(req, res) {
        res.render('about');
    }
    
    // [POST] /profile
    async editProfile(req, res){
        const { fullName, username, phone, address } = req.body;
    
        // Giả sử bạn có một cách để xác thực người dùng và lấy thông tin user từ session hoặc JWT token
        const userId = req.user ? req.user._id : null;
    
        if (!userId) {
            return res.redirect('/login');
        }
    
        try {
            const user = await User.findById(userId);
    
            if (fullName === "") {
                user.fullName = "";
            } else if (fullName) {
                user.fullName = fullName; 
            }
            if (username) user.username = username;
            if (phone) user.phone = phone; 
            if (address) user.address = address; 
    
            await user.save();  
    
            res.redirect('/profile'); 
        } catch (err) {
            res.status(500).send('Error updating profile.');
        }
    }

    // [GET] /profile
    async profile(req, res){
        const userId = req.user ? req.user._id : null;
        let cartItems = req.session.cart || [];
    
        if (!userId) {
            return res.redirect('/login');
        }
    
        try {
            const user = await User.findById(userId);
            res.render('profile', { user, cartItems });
        } catch (err) {
            console.error("Error fetching user data:", err);
            res.status(500).send('Error occurred.');
        }
    }
}

module.exports = new SiteController;