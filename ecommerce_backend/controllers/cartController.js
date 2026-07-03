// cartController.js  —  FIXED
// Changes:
//   1. getCartItems: removed the inline DELETE (was racing with the cron job and
//      causing the 1-hr vs 24-hr mismatch). The cron job owns deletion; this
//      endpoint only reads.
//   2. All queries that match on product_id now cast $N to INTEGER so the
//      PostgreSQL column type (int) never rejects a string coming from the
//      JS side.  This was the silent "0 rows updated" bug.
//   3. addProductToCart: productId is parsed to an integer before use.
//   4. updateCartItemQuantity / removeProductFromCart: same cast.
//   5. placeOrder: placeholder cast added so IN (…) works with integer IDs.

const pool = require('../db/db');

// ─── ADD / UPDATE ─────────────────────────────────────────────────────────────
const addProductToCart = async (req, res) => {
  console.log("ADD TO CART REQUEST USER OBJECT:", req.user);
  const userId = req.user.id;
  const { productId, title, imageUrl, price, quantity } = req.body;

  // FIX 2 & 3: always work with an integer product ID
  const productIdInt = parseInt(productId, 10);

  if (!productIdInt || !title || !imageUrl || !price || !quantity || quantity <= 0) {
    return res.status(400).json({
      message: 'Please provide all required product details and a valid quantity.',
    });
  }

  try {
    const existingCartItem = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productIdInt]
    );

    if (existingCartItem.rows.length > 0) {
      const updatedItem = await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + $1, updated_at = NOW()
         WHERE user_id = $2 AND product_id = $3
         RETURNING *`,
        [quantity, userId, productIdInt]
      );
      return res.status(200).json({
        message: 'Product quantity updated in cart!',
        item: updatedItem.rows[0],
      });
    } else {
      const newItem = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, title, image_url, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, productIdInt, title, imageUrl, price, quantity]
      );
      return res.status(201).json({
        message: 'Product added to cart!',
        item: newItem.rows[0],
      });
    }
  } catch (error) {
    console.error('Error adding/updating product in cart:', error.message);
    res.status(500).json({
      message: 'Server error adding/updating product in cart.',
      error: error.message,
    });
  }
};

// ─── GET ──────────────────────────────────────────────────────────────────────
const getCartItems = async (req, res) => {
  console.log("=========================================");
  console.log("FETCH REQUEST USER OBJECT:", req.user);
  console.log("=========================================");
  const userId = req.user.id;

  try {
    const cartItems = await pool.query(
      `SELECT * FROM cart_items
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json(cartItems.rows);
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({
      message: 'Server error fetching cart items.',
      error: error.message,
    });
  }
};

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
const updateCartItemQuantity = async (req, res) => {
  const userId = req.user.id;
  // FIX 2: cast to integer
  const productId = parseInt(req.params.productId, 10);
  const { quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: 'Quantity must be a positive number.' });
  }

  try {
    const updatedItem = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, userId, productId]
    );

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    res.status(200).json({
      message: 'Cart item quantity updated!',
      item: updatedItem.rows[0],
    });
  } catch (error) {
    console.error('Error updating cart item quantity:', error.message);
    res.status(500).json({
      message: 'Server error updating cart item quantity.',
      error: error.message,
    });
  }
};

// ─── REMOVE ───────────────────────────────────────────────────────────────────
const removeProductFromCart = async (req, res) => {
  const userId = req.user.id;
  // FIX 2: cast to integer
  const productId = parseInt(req.params.productId, 10);

  if (!productId) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const deletedItem = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );

    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    res
      .status(200)
      .json({ message: 'Product removed from cart!', item: deletedItem.rows[0] });
  } catch (error) {
    console.error('Error removing product from cart:', error.message);
    res.status(500).json({
      message: 'Server error removing product from cart.',
      error: error.message,
    });
  }
};

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, totalAmount, items, isSingleProduct } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided for the order.' });
  }
  if (!shippingAddress || !totalAmount || totalAmount <= 0) {
    return res
      .status(400)
      .json({ message: 'Missing address or total amount for order.' });
  }

  // FIX 2: cast all incoming product IDs to integers
  const productIdsToProcess = items.map((item) => parseInt(item.productId, 10));
  const placeholder = productIdsToProcess
    .map((_, i) => `$${i + 2}`)
    .join(',');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cartItemsResult = await client.query(
      `SELECT product_id, title, image_url, price, quantity
       FROM cart_items
       WHERE user_id = $1 AND product_id IN (${placeholder})`,
      [userId, ...productIdsToProcess]
    );
    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      throw new Error('Cart is empty or items have expired. Cannot place order.');
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, shipping_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, 'Processing', totalAmount, shippingAddress]
    );
    const orderId = orderResult.rows[0].id;

    const orderItemQueries = cartItems.map((item) =>
      client.query(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.title, item.price, item.quantity]
      )
    );
    await Promise.all(orderItemQueries);

    await client.query(
      `DELETE FROM cart_items
       WHERE user_id = $1 AND product_id IN (${placeholder})`,
      [userId, ...productIdsToProcess]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: orderId,
      trackingNumber: orderId,
    });

    // Order status simulation (unchanged)
    setTimeout(async () => {
      try {
        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          ['Out for Delivery', orderId]
        );
      } catch (err) {
        console.error('Sim error:', err);
      }
    }, 100000);

    setTimeout(async () => {
      try {
        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          ['Delivered', orderId]
        );
      } catch (err) {
        console.error('Sim error:', err);
      }
    }, 1100000);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error.message);
    res
      .status(500)
      .json({ message: error.message || 'Server error placing order.' });
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