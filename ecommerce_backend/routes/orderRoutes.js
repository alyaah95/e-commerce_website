const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllOrders, getOrderDetails } = require('../controllers/orderController');


router.get('/', protect, getAllOrders);
router.get('/:orderId', protect, getOrderDetails);

module.exports = router;