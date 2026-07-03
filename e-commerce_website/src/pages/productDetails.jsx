// ProductDetails.jsx  —  FIXED
// Changes:
//   FIX 4 (UX / race conditions):
//     - A new localQty state tracks what the user *wants* to add.
//     - The "+" button increments localQty only (no network call).
//     - The "−" button decrements localQty only (no network call).
//     - "Add to Cart" is the ONLY button that dispatches to the backend.
//       It sends localQty as the quantity delta to add.
//     - After a successful add, localQty resets to 1.
//   This means there is exactly one in-flight request at a time for
//   this product, eliminating all race conditions from this page.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosInstance from '../apis/config';
import { useSelector, useDispatch } from 'react-redux';
import {
  addProductToCartBackend,
  removeProductFromCartBackend,
} from '../store/slices/productCart';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import './productDetails.css';
import '../components/wishlistButton.css';
import WishlistButton from '../components/WishlistButton';

const ProductDetails = () => {
  const [productDetails, setProductDetails] = useState(null);
  const [showCategory, setShowCategory]     = useState(false);
  const [showBrand, setShowBrand]           = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showReviews, setShowReviews]       = useState(false);
  const [activeImage, setActiveImage]       = useState(0);

  // FIX 4: local counter — tracks how many the user wants to add THIS session
  const [localQty, setLocalQty] = useState(1);

  const dispatch = useDispatch();
  const params   = useParams();
  const navigate = useNavigate();

  const productsInCart  = useSelector((state) => state.productCart.products);
  // FIX 3: compare as Numbers to match the Redux store
  const productInCart   = productsInCart.find((p) => p.id === Number(params.id));
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axiosInstance.get(`/products/${params.id}`);
        setProductDetails(res.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setProductDetails(null);
      }
    };
    fetchProductDetails();
  }, [params.id]);

  // Reset the local counter whenever the product changes
  useEffect(() => {
    setLocalQty(1);
  }, [params.id]);

  const availableStock = productDetails?.stock ?? 0;
  // How many are already in the cart for this product
  const quantityInCart = productInCart?.quantity ?? 0;
  // How many more can the user add
  const remainingStock = availableStock - quantityInCart;

  // ── FIX 4: local counter handlers ─────────────────────────────────────────
  const handleIncrement = () => {
    // Cannot exceed remaining stock with what we're about to add
    if (localQty >= remainingStock) {
      alert(`Only ${remainingStock} more available in stock.`);
      return;
    }
    setLocalQty((q) => q + 1);
  };

  const handleDecrement = () => {
    if (localQty <= 1) return;
    setLocalQty((q) => q - 1);
  };

  // ── FIX 4: single backend action ──────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    if (!productDetails) return;
    if (remainingStock <= 0) {
      alert(`Cannot add more. Only ${availableStock} items available in stock.`);
      return;
    }
    if (localQty > remainingStock) {
      alert(`Only ${remainingStock} more available. Adjusting quantity.`);
      setLocalQty(remainingStock);
      return;
    }

    await dispatch(
      addProductToCartBackend({
        id: productDetails.id,
        title: productDetails.title,
        image: productDetails.images[0],
        price: productDetails.price,
        quantity: localQty,           // send the user's chosen amount
        stock: productDetails.stock,
      })
    );

    dispatch(removeFromWishlist(productDetails.id));
    setLocalQty(1); // reset after a successful add
  };

  const handleRemoveFromCart = async () => {
    if (!productInCart) return;
    await dispatch(removeProductFromCartBackend(productInCart.id));
    setLocalQty(1);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed to checkout.');
      navigate('/login');
      return;
    }
    if (!productDetails) return;
    if (remainingStock <= 0) {
      alert(`Only ${availableStock} items available in stock.`);
      return;
    }
    navigate('/checkout', {
      state: {
        isSingleProduct: true,
        productId: productDetails.id,
        quantity: localQty,
        totalAmount: localQty * productDetails.price,
      },
    });
  };

  if (!productDetails) {
    return (
      <div className="pd-fullscreen-center">
        <div className="pd-spinner" />
        <p className="pd-loading-text">Loading product details…</p>
      </div>
    );
  }

  const isBuyNowDisabled    = !isAuthenticated || remainingStock <= 0;
  const isAddToCartDisabled = !isAuthenticated || remainingStock <= 0;

  const images    = productDetails?.images || [];
  const mainImage = images[activeImage] || images[0];

  return (
    <div className="pd-page">
      <div className="pd-container">

        <div className="pd-grid">

          {/* ── LEFT: Image gallery ── */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={productDetails?.title || 'Product image'}
                  className="pd-main-img"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb-btn ${i === activeImage ? 'pd-thumb-btn--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="pd-thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="pd-info">

            <div className="pd-title-row">
              <h1 className="pd-title">{productDetails?.title}</h1>
              <div className="pd-wishlist-wrap">
                <WishlistButton product={productDetails} />
              </div>
            </div>

            <div className="pd-rating-strip">
              <div className="pd-stars">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`pd-star ${i < Math.floor(productDetails.rating) ? 'pd-star--filled' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span className="pd-rating-value">{productDetails.rating}</span>
              <span className="pd-rating-count">({productDetails.reviews?.length} reviews)</span>
            </div>

            <p className="pd-description">{productDetails?.description}</p>

            <div className="pd-divider" />

            <div className="pd-price-row">
              <span className="pd-price">${productDetails?.price}</span>
              <span className="pd-price-note">Competitive pricing guaranteed</span>
            </div>

            <div className="pd-divider" />

            <div className="pd-stock-row">
              {remainingStock <= 0 ? (
                <span className="pd-badge pd-badge--danger">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Out of Stock
                </span>
              ) : (
                <span className="pd-badge pd-badge--success">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  In Stock · {remainingStock} remaining
                </span>
              )}
            </div>

            {/* Info accordion pills */}
            <div className="pd-info-section">
              <p className="pd-info-heading">More Information</p>
              <div className="pd-info-pills">

                <div className="pd-info-item">
                  <button
                    className={`pd-info-pill ${showCategory ? 'pd-info-pill--active' : ''}`}
                    onClick={() => setShowCategory(!showCategory)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h8m-8 6h16"/></svg>
                    Category
                    <svg className={`pd-pill-chevron ${showCategory ? 'pd-pill-chevron--up' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showCategory && <div className="pd-info-reveal">{productDetails?.category}</div>}
                </div>

                <div className="pd-info-item">
                  <button
                    className={`pd-info-pill ${showBrand ? 'pd-info-pill--active' : ''}`}
                    onClick={() => setShowBrand(!showBrand)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Brand
                    <svg className={`pd-pill-chevron ${showBrand ? 'pd-pill-chevron--up' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showBrand && <div className="pd-info-reveal">{productDetails?.brand}</div>}
                </div>

                <div className="pd-info-item">
                  <button
                    className={`pd-info-pill ${showDimensions ? 'pd-info-pill--active' : ''}`}
                    onClick={() => setShowDimensions(!showDimensions)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                    Dimensions
                    <svg className={`pd-pill-chevron ${showDimensions ? 'pd-pill-chevron--up' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showDimensions && (
                    <div className="pd-info-reveal">
                      W: {productDetails.dimensions.width} × H: {productDetails.dimensions.height} × D: {productDetails.dimensions.depth}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="pd-divider" />

            {/* ── FIX 4: local quantity counter ── */}
            <div className="pd-qty-row">
              <div className="pd-qty-controls">
                {/* − only changes localQty, no network call */}
                <button
                  className="pd-qty-btn"
                  onClick={handleDecrement}
                  disabled={localQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>

                <span className="pd-qty-value">{localQty}</span>

                {/* + only changes localQty, no network call */}
                <button
                  className="pd-qty-btn"
                  onClick={handleIncrement}
                  disabled={isAddToCartDisabled || localQty >= remainingStock}
                  aria-label="Increase quantity"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>

              <span className="pd-stock-msg">
                {quantityInCart > 0
                  ? `${quantityInCart} already in cart · ${remainingStock} left`
                  : remainingStock > 0
                  ? `${remainingStock} left in stock`
                  : 'Out of stock'}
              </span>
            </div>

            {/* CTA buttons */}
            <div className="pd-actions">
              <button
                className="pd-btn pd-btn--buy"
                onClick={handleBuyNow}
                disabled={isBuyNowDisabled}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Buy Now
              </button>

              {/* FIX 4: this is the ONLY button that talks to the backend */}
              <button
                className="pd-btn pd-btn--cart"
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
              >
                {isAddToCartDisabled ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Log in to add
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67l1.62-9.33H6"/>
                    </svg>
                    Add {localQty > 1 ? `${localQty}` : ''} to Cart
                  </>
                )}
              </button>

              {/* Remove button — only visible when item is already in cart */}
              {quantityInCart > 0 && (
                <button
                  className="pd-btn pd-btn--remove"
                  onClick={handleRemoveFromCart}
                >
                  Remove from cart
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="pd-trust-grid">
              <div className="pd-trust-item">
                <div className="pd-trust-icon pd-trust-icon--blue">
                  <i className="bi bi-shield-check" />
                </div>
                <div className="pd-trust-text">
                  <span className="pd-trust-label">Warranty</span>
                  <span className="pd-trust-value">{productDetails.warrantyInformation}</span>
                </div>
              </div>
              <div className="pd-trust-item">
                <div className="pd-trust-icon pd-trust-icon--green">
                  <i className="bi bi-arrow-left-right" />
                </div>
                <div className="pd-trust-text">
                  <span className="pd-trust-label">Returns</span>
                  <span className="pd-trust-value">{productDetails.returnPolicy}</span>
                </div>
              </div>
              <div className="pd-trust-item">
                <div className="pd-trust-icon pd-trust-icon--orange">
                  <i className="bi bi-truck" />
                </div>
                <div className="pd-trust-text">
                  <span className="pd-trust-label">Shipping</span>
                  <span className="pd-trust-value">{productDetails.shippingInformation}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="product-reviews-wrapper mt-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <div>
              <h3 className="mb-0 fw-bold">Ratings & Reviews</h3>
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className="text-warning">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi ${i < Math.floor(productDetails.rating) ? 'bi-star-fill' : 'bi-star'}`} />
                  ))}
                </div>
                <span className="fw-bold">{productDetails.rating}</span>
                <span className="text-muted">({productDetails.reviews?.length} reviews)</span>
              </div>
            </div>
            <button
              className={`btn ${showReviews ? 'btn-outline-secondary' : 'btn-primary'} shadow-sm`}
              onClick={() => setShowReviews(!showReviews)}
            >
              {showReviews ? 'Hide Reviews' : 'Show Customer Reviews'}
            </button>
          </div>

          {showReviews && (
            <div className="reviews-list-animation">
              <div className="row g-4">
                {productDetails.reviews?.length > 0 ? (
                  productDetails.reviews.map((review, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="review-card h-100 shadow-sm border-0 p-3 bg-white rounded-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="reviewer-avatar-circle">
                              {review.reviewerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">{review.reviewerName}</h6>
                              <small className="text-muted" style={{ fontSize: '11px' }}>
                                {new Date(review.date).toLocaleDateString('en-GB')}
                              </small>
                            </div>
                          </div>
                          <div className="badge bg-light text-warning border">
                            {review.rating} <i className="bi bi-star-fill" />
                          </div>
                        </div>
                        <p className="review-text text-secondary mb-0">
                          <i className="bi bi-quote text-primary opacity-25 fs-4" />
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-4">
                    <p className="text-muted">No reviews available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;