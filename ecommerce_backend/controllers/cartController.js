

const pool = require('../db/db');


const addProductToCart = async (req, res) => {

  const userId = req.user.id;
  const { productId, title, imageUrl, price, quantity } = req.body;

 
  if (!productId || !title || !imageUrl || !price || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Please provide all required product details and a valid quantity.' });
  }

  try {
   
    const existingCartItem = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingCartItem.rows.length > 0) {
      
      const updatedItem = await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, userId, productId]
      );
      return res.status(200).json({
        message: 'Product quantity updated in cart!',
        item: updatedItem.rows[0]
      });
    } else {
      
      const newItem = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, title, image_url, price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, productId, title, imageUrl, price, quantity]
      );
      return res.status(201).json({
        message: 'Product added to cart!',
        item: newItem.rows[0]
      });
    }
  } catch (error) {
    console.error('Error adding/updating product in cart:', error.message);
    res.status(500).json({ message: 'Server error adding/updating product in cart.', error: error.message });
  }
};


const getCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartItems = await pool.query(
      `SELECT * FROM cart_items WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '1 hour' ORDER BY created_at DESC`,
      [userId]
    );
    res.status(200).json(cartItems.rows);
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ message: 'Server error fetching cart items.', error: error.message });
  }
};


const updateCartItemQuantity = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number.' });
  }

  try {
    const updatedItem = await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, userId, productId]
    );

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    res.status(200).json({
      message: 'Cart item quantity updated!',
      item: updatedItem.rows[0]
    });
  } catch (error) {
    console.error('Error updating cart item quantity:', error.message);
    res.status(500).json({ message: 'Server error updating cart item quantity.', error: error.message });
  }
};


const removeProductFromCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const deletedItem = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );

    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    res.status(200).json({ message: 'Product removed from cart!', item: deletedItem.rows[0] });
  } catch (error) {
    console.error('Error removing product from cart:', error.message);
    res.status(500).json({ message: 'Server error removing product from cart.', error: error.message });
  }
};


const placeOrder = async (req, res) => {
    // 🛑 يجب التأكد من وجود req.user.id هنا (Middleware المصادقة)
    const userId = req.user.id; 
    
    console.log('User ID Check before DB use:', userId);
    // نستقبل العنوان والإجمالي من الواجهة
    const { shippingAddress, totalAmount, items, isSingleProduct } = req.body; 

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items provided for the order.' });
    } 
    if (!shippingAddress || !totalAmount || totalAmount <= 0) {
        return res.status(400).json({ message: 'Missing address or total amount for order.' });
    }

    const productIdsToProcess = items.map(item => item.productId);
    const placeholder = productIdsToProcess.map((_, i) => `$${i + 2}`).join(','); // $2, $3, $4...

    const client = await pool.connect(); 

    try {
        await client.query('BEGIN'); // 1. بدء المعاملة
        console.log('Query 1: Running SELECT cart_items. Params:', [userId]);

        // 2. جلب العناصر من سلة التسوق (سواء كانت لمنتج واحد أو سلة كاملة)
        const cartItemsResult = await client.query(
            `SELECT product_id, title, image_url, price, quantity FROM cart_items WHERE user_id = $1 AND product_id IN (${placeholder})`,
            [userId, ...productIdsToProcess]
        );
        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            throw new Error('Cart is empty. Cannot place order.');
        }

        // 3. إنشاء الطلب في جدول orders (الحالة الافتراضية 'Processing')
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, status, total_amount, shipping_address) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, 'Processing', totalAmount, shippingAddress]
        );
        console.log('Query 2: Running INSERT orders. Params:', [userId, 'Processing', totalAmount, shippingAddress]);
        const orderId = orderResult.rows[0].id;

        // 4. نقل العناصر إلى جدول order_items
        const orderItemQueries = cartItems.map(item => {
            console.log('Query 3 item params:', [orderId, item.product_id, item.title, item.price, item.quantity])
            return client.query(
                'INSERT INTO order_items (order_id, product_id, title, price, quantity) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.product_id, item.title, item.price, item.quantity]
            )
    });
        await Promise.all(orderItemQueries);
        

        // 5. مسح العناصر من سلة التسوق
        await client.query(
            `DELETE FROM cart_items WHERE user_id = $1 AND product_id IN (${placeholder})`,
            [userId, ...productIdsToProcess]
        );

        await client.query('COMMIT'); // 6. تأكيد المعاملة

        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: orderId,
            trackingNumber: orderId 
        });
 

        
        setTimeout(async () => {
            try {
                await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['Out for Delivery', orderId]);
                console.log(`Order ${orderId} is Out for Delivery`);
            } catch (err) { console.error("Sim error:", err); }
        }, 100000);

        
        setTimeout(async () => {
            try {
                await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['Delivered', orderId]);
                console.log(`Order ${orderId} is Delivered`);
            } catch (err) { console.error("Sim error:", err); }
        }, 1100000);

    } catch (error) {
        await client.query('ROLLBACK'); // ❌ التراجع عن أي تغيير في حال حدوث خطأ
        console.error('Error placing order:', error.message);
        res.status(500).json({ message: error.message || 'Server error placing order.' });
    } finally {
        client.release();
    }
};

module.exports = {
  addProductToCart,
  getCartItems,
  updateCartItemQuantity,
  removeProductFromCart,
  placeOrder,
};