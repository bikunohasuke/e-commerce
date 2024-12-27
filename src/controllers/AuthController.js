const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Cart = require('../models/cart');
const bcrypt = require('bcryptjs');
const Category = require('../models/category');

class AuthController {
    // [POST] /register
    async register(req, res, next) {
        try {
            const { email, username, phone, address, password, confirmPassword } = req.body;

            if (!email || !username || !phone || !address || !password || !confirmPassword) {
                res.locals.errorMessage =  'All fields are required.';
                return res.render('register');
            }

            if (password !== confirmPassword) {
                res.locals.errorMessage =  'Confirmation password does not match';
                return res.render('register');
            }

            const userExists = await User.findOne({ email });
            if (userExists) {
                res.locals.errorMessage =  'Email is already registered.';
                return res.render('register');
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                username,
                email,
                phone,
                address,
                password: hashedPassword
            });

            const cart = new Cart({
                user: user._id,
                items: []  
            });
            console.log('New cart created:', cart); 
            await cart.save();

            console.log('User session:', req.session.user);
            console.log('Cart session:', req.session.cart);
    
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /login
    async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.locals.errorMessage = 'All fields are required.';
                return res.render('login');
            }

            const user = await User.findOne({ username });
            if (!user) {
                res.locals.errorMessage = 'Invalid username or password.';
                return res.render('login');
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                res.locals.errorMessage = 'Invalid username or password.';
                return res.render('login');
            }

            console.log(username);
            console.log(password);
            console.log(isMatch);

            // token JWT
            const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
            req.session.token = token;
            req.session.user = user;

            console.log('Session Token:', req.session.token);
            console.log('Session User:', req.session.user); 

            
            let cartItems = [];
            const cart = await Cart.findOne({ user: user._id }).populate('items.product');
            cartItems = cart ? cart.items : [];
            
            req.session.cart = cartItems;

            console.log('User logged in. Cart session:', req.session.cart);

            const redirectTo = req.session.returnTo || '/'; 
            console.log('Session returnTo before redirect:', req.session.returnTo);
            
            delete req.session.returnTo;

            console.log('Redirecting to:', redirectTo);

            res.redirect(redirectTo);

        } catch (error) {
            next(error);
        }
    }

    // [POST] /logout
    async logout(req, res, next) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        } catch (error) {
            next(error);
        }
    }

    async renderRegister(req, res) {
        let cartItems = req.session.cart || []; 
        let user = req.session.user || null;
        const categories = await Category.find();

        if (!req.session.returnTo && req.originalUrl !== '/auth/register') {
            req.session.returnTo = req.originalUrl; 
            console.log('Saving returnTo before rendering register page:', req.session.returnTo);
        }
        
        res.render('register', { cartItems, user, categories });
    }

    async renderLogin(req, res) {
        let cartItems = req.session.cart || [];
        let user = req.session.user || null;
        const categories = await Category.find();

        if (!req.session.returnTo && req.originalUrl !== '/auth/login') {
            req.session.returnTo = req.originalUrl; 
            console.log('Saving returnTo before rendering login page:', req.session.returnTo);
        }

        res.render('login', { cartItems, user, categories });
    }

}

module.exports = new AuthController;