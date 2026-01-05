

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const cartController = require('../controllers/cartController');


router.post('/add', protect, cartController.addProductToCart);
router.get('/', protect, cartController.getCartItems);
router.put('/update/:productId', protect, cartController.updateCartItemQuantity);
router.delete('/remove/:productId', protect, cartController.removeProductFromCart);
router.post('/place-order', protect, cartController.placeOrder);

module.exports = router;