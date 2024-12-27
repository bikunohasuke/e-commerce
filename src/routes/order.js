const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const ensureAuthenticated = require('../middleware/auth');

router.get('/', ensureAuthenticated, orderController.viewOrder);

module.exports = router;