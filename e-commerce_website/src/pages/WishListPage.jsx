import React from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import { addProductToCartBackend } from '../store/slices/productCart'; // افترضت اسم الثانك عندك
import "./WishlistPage.css";

const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAddToCart = (product) => {
    // 1. التأكد من إرسال كل التفاصيل المطلوبة للـ Backend
    const productData = {
        id: product.id,
        title: product.title,
        image: product.images[0],
        price: product.price,
        quantity: 1, 
        stock: product.stock 
    };

    // 2. إضافة للسلة (Backend + Redux)
    dispatch(addProductToCartBackend(productData))
        .unwrap() // ننتظر التأكيد من السيرفر قبل الحذف من المفضلة
        .then(() => {
            // 3. حذف من المفضلة فقط إذا تمت الإضافة بنجاح
            dispatch(removeFromWishlist(product.id));
        })
        .catch((err) => {
            console.error("Failed to add to cart:", err);
            alert("Could not add to cart. Please try again.");
        });
    };

  return (
    <div className="wishlist-container">
      <h2>My Wishlist ({wishlistItems.length} items)</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is currently empty.</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(product => (
            <div key={product.id} className="wishlist-item">
              <img src={product.images[0]} alt={product.title} />
              <div className="item-info">
                <h4>{product.title}</h4>
                <p className="price">${product.price}</p>
                
                <div className="actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;