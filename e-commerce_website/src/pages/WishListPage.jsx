import React from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import { addProductToCartBackend } from '../store/slices/productCart';
import "./WishlistPage.css";

const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    const productData = {
        id: product.id,
        title: product.title,
        image: product.images[0],
        price: product.price,
        quantity: 1,
        stock: product.stock
    };

    dispatch(addProductToCartBackend(productData))
        .unwrap()
        .then(() => {
            dispatch(removeFromWishlist(product.id));
        })
        .catch((err) => {
            console.error("Failed to add to cart:", err);
        });
  };

  return (
    <div className="wl-page">
      <div className="wl-container">

        {/* ── Page Header ── */}
        <div className="wl-header">
          <div className="wl-header-text">
            <h1 className="wl-title">My Wishlist</h1>
            <p className="wl-subtitle">
              Items you love, saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="wl-header-stat">
              <span className="wl-stat-value">{wishlistItems.length}</span>
              <span className="wl-stat-label">items saved</span>
            </div>
          )}
        </div>

        {/* ── Empty State ── */}
        {wishlistItems.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-icon">
              {/* Heart SVG */}
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <h4>Your wishlist is empty</h4>
            <p>Browse our store and save the items you love.</p>
            <button className="wl-shop-btn" onClick={() => navigate('/')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Continue Shopping
            </button>
          </div>
        ) : (

          /* ── Product Grid ── */
          <div className="wl-grid">
            {wishlistItems.map(product => (
              <div key={product.id} className="wl-card">

                {/* Image area */}
                <div className="wl-card-img-wrap">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="wl-card-img"
                  />

                  {/* Quick-remove pill (top-right) */}
                  <button
                    className="wl-remove-pill"
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                    aria-label="Remove from wishlist"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Card body */}
                <div className="wl-card-body">
                  <h5 className="wl-card-title">{product.title}</h5>

                  <div className="wl-card-footer">
                    <span className="wl-card-price">${product.price}</span>

                    <div className="wl-card-actions">
                      <button
                        className= {`btn btn-sm wl-cart-btn ${!isAuthenticated || product.stock <= 0  ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleAddToCart(product)}
                      >
                        
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67l1.62-9.33H6"/>
                        </svg>
                        {!isAuthenticated
                          ? '🔒 Login to Add'
                          : isOutOfStock
                          ? 'Out of Stock'
                          : '+ Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;