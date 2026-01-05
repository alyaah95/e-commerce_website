const pool = require('../db/db');

const getAllOrders = async (req, res) => {
    const userId = req.user.id; 

    try {
        const ordersResult = await pool.query(
            `SELECT id, status, total_amount, created_at 
             FROM orders 
             WHERE user_id = $1 
             ORDER BY created_at DESC`, // الأحدث أولاً
            [userId]
        );

        res.status(200).json(ordersResult.rows);
    } catch (error) {
        console.error('Error fetching all orders:', error.message);
        res.status(500).json({ message: 'Server error fetching orders list.' });
    }
};

const getOrderDetails = async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params; // رقم الطلب من المسار /orders/:orderId

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required.' });
    }

    try {
        // 1. جلب بيانات الطلب الرئيسية (الحالة، العنوان، الإجمالي)
        const orderResult = await pool.query(
            `SELECT id, status, total_amount, shipping_address, created_at 
             FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or does not belong to user.' });
        }
        const order = orderResult.rows[0];

        // 2. جلب العناصر الموجودة داخل هذا الطلب (order_items)
        const itemsResult = await pool.query(
            `SELECT product_id, title, price, quantity 
             FROM order_items 
             WHERE order_id = $1`,
            [orderId]
        );

        // 3. دمج البيانات وإرجاعها
        res.status(200).json({
            ...order,
            items: itemsResult.rows,
        });

    } catch (error) {
        console.error(`Error fetching order ${orderId} details:`, error.message);
        res.status(500).json({ message: 'Server error fetching order details.' });
    }
};

module.exports = {
    getAllOrders,
    getOrderDetails,
};