const express = require('express');
const router = express.Router();
const shopController = require('../controllers/ShopController');

router.delete('/delete/:id', shopController.deleteProduct);
router.post('/store', shopController.createProduct);
router.put('/update', shopController.updateProduct);
router.delete('/orders/:id/delete', shopController.deleteOrder)
router.put('/orders/:id/update-status', shopController.updateOrder);
router.get('/orders', shopController.viewOrders);
router.get('/', shopController.product);

module.exports = router;