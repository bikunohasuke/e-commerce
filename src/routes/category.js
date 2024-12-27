const express = require('express');
const router = express.Router();
const shopController = require('../controllers/ShopController');

router.get('/:slug', shopController.showProductsByCategory);

module.exports = router;