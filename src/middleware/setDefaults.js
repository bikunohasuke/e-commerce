const Category = require('../models/category');

async function setDefaults(req, res, next) {
    try {
        const categories = await Category.find();

        const cartItems = req.session && req.session.cart ? req.session.cart : [];

        const user = req.session && req.session.user ? req.session.user : null;

        res.locals.categories = categories;
        res.locals.cartItems = cartItems;
        res.locals.user = user;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = setDefaults;