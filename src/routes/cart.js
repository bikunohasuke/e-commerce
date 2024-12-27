const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const ensureAuthenticated = require('../middleware/auth');

router.post('/checkout', ensureAuthenticated, cartController.checkout);
router.post('/remove', ensureAuthenticated, cartController.removeFromCart);
router.post('/update', ensureAuthenticated, cartController.updateCart);
router.post('/add', ensureAuthenticated, cartController.addToCart);
router.get('/', ensureAuthenticated, cartController.viewCart);

module.exports = router;