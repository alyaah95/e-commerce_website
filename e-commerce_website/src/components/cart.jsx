// Cart.jsx  —  FIXED
// Changes:
//   FIX 4 (UX / race conditions):
//     - Each cart item has its own local quantity counter in a Map stored in
//       React state (localQuantities).  The "+" and "−" buttons ONLY update
//       this local map — zero network calls.
//     - A new "Update" button appears on a row when localQty differs from the
//       committed quantity.  Clicking it is the single action that dispatches
//       updateProductQuantityBackend.
//     - handleRemove is unchanged — it still calls the backend immediately
//       because removing an item is unambiguous and needs no staging.
//     - "Buy Now" uses the local quantity so the checkout total is accurate.
//     - localQuantities is seeded from Redux on first render and whenever
//       products change (e.g. after a fetch).

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  removeProductFromCartBackend,
  updateProductQuantityBackend,
} from '../store/slices/productCart';
import { useNavigate } from 'react-router';
import './cart.css';

const Cart = () => {
  const products = useSelector((state) => state.productCart.products);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // FIX 4: local quantity map keyed by product.id
  // Seeded from Redux so it always starts in sync with the server state.
  const [localQuantities, setLocalQuantities] = useState({});

  useEffect(() => {
    setLocalQuantities(
      Object.fromEntries(products.map((p) => [p.id, p.quantity]))
    );
  }, [products]);

  // Helpers to read/write the local map
  const getLocal = (id) =>
    localQuantities[id] !== undefined ? localQuantities[id] : 0;

  const setLocal = (id, qty) =>
    setLocalQuantities((prev) => ({ ...prev, [id]: qty }));

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRemove = async (product) => {
    await dispatch(removeProductFromCartBackend(product.id));
  };

  // FIX 4: + only updates local state
  const handleIncrement = (product) => {
    const current = getLocal(product.id);
    if (current >= product.stock) {
      alert('Cannot add more than available stock!');
      return;
    }
    setLocal(product.id, current + 1);
  };

  // FIX 4: − only updates local state (removes item if it would hit 0)
  const handleDecrement = (product) => {
    const current = getLocal(product.id);
    if (current <= 1) {
      // Dropping to 0 means remove — this IS a backend action
      handleRemove(product);
    } else {
      setLocal(product.id, current - 1);
    }
  };

  // FIX 4: single backend submit for quantity changes
  const handleUpdate = async (product) => {
    const newQty = getLocal(product.id);
    if (newQty === product.quantity) return; // nothing changed
    await dispatch(
      updateProductQuantityBackend({ productId: product.id, quantity: newQty })
    );
  };

  const handleBuyNow = (product) => {
    const qty = getLocal(product.id);
    navigate('/checkout', {
      state: {
        isSingleProduct: true,
        productId: product.id,
        quantity: qty,
        totalAmount: qty * product.price,
      },
    });
  };

  const handleBuyEntireCart = () => {
    if (products.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Use localQuantities for the total so any pending changes are reflected
    const totalAmount = products.reduce(
      (acc, p) => acc + getLocal(p.id) * p.price,
      0
    );
    navigate('/checkout', {
      state: { isEntireCart: true, totalAmount },
    });
  };

  // Use localQuantities for the displayed total
  const cartTotalAmount = products.reduce(
    (acc, p) => acc + getLocal(p.id) * p.price,
    0
  );
  const cartIsValid = products.every(
    (p) => getLocal(p.id) > 0 && getLocal(p.id) <= (p.stock ?? Infinity)
  );

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* Page Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Shopping Cart</h1>
            <p className="cart-subtitle">
              {products.length} item{products.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <div className="cart-header-stat">
            <span className="cart-stat-value">{products.length}</span>
            <span className="cart-stat-label">items</span>
          </div>
        </div>

        {/* Reservation Banner */}
        <div className="cart-banner">
          <div className="cart-banner-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p>
            Items in your cart are reserved for <strong>24 hours</strong>.
            Complete your purchase to secure them!
          </p>
        </div>

        {/* Main layout */}
        <div className="cart-layout">

          {/* Items panel */}
          <div className="cart-items-panel">

            <div className="cart-col-header">
              <span className="cart-col-product">Product</span>
              <span className="cart-col-qty">Quantity</span>
              <span className="cart-col-price">Price</span>
              <span className="cart-col-actions">Actions</span>
            </div>

            {products.map((product) => {
              const localQty  = getLocal(product.id);
              const isDirty   = localQty !== product.quantity; // unsaved local change
              const lineTotal = Math.round(localQty * product.price);
              const remaining = product.stock != null
                ? product.stock - localQty
                : null;
              const atStockLimit  = product.stock != null && localQty >= product.stock;
              const isRowInvalid  = localQty <= 0 || atStockLimit;

              return (
                <div
                  key={product.id}
                  className={`cart-item-row ${isRowInvalid ? 'cart-item-row--invalid' : ''}`}
                >
                  {/* Product col */}
                  <div className="cart-item-product">
                    <div className="cart-item-img-wrap">
                      <img src={product.image} alt={product.title} className="cart-item-img" />
                    </div>
                    <span className="cart-item-title">{product.title}</span>
                  </div>

                  {/* Quantity col — FIX 4: local only */}
                  <div className="cart-item-qty-col">
                    <div className="qty-controls">
                      {/* − : local only */}
                      <button
                        className="qty-btn"
                        onClick={() => handleDecrement(product)}
                        aria-label="Decrease quantity"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>

                      <span className="qty-value">{localQty}</span>

                      {/* + : local only */}
                      <button
                        className="qty-btn"
                        onClick={() => handleIncrement(product)}
                        disabled={atStockLimit}
                        aria-label="Increase quantity"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>

                    <span className={`qty-stock-msg ${remaining === 0 ? 'qty-stock-msg--warn' : ''}`}>
                      {remaining !== null
                        ? remaining === 0
                          ? 'Max stock reached'
                          : `${remaining} left in stock`
                        : 'Stock: N/A'}
                    </span>

                    {/* FIX 4: Update button — only visible when there's a pending local change */}
                    {isDirty && (
                      <button
                        className="qty-update-btn"
                        onClick={() => handleUpdate(product)}
                        aria-label="Save quantity change"
                      >
                        Update
                      </button>
                    )}
                  </div>

                  {/* Price col */}
                  <div className="cart-item-price-col">
                    <span className="cart-item-line-total">${lineTotal}</span>
                    <span className="cart-item-unit-price">${product.price} each</span>
                  </div>

                  {/* Actions col */}
                  <div className="cart-item-actions-col">
                    <button
                      className="cart-action-btn cart-action-btn--buy"
                      onClick={() => handleBuyNow(product)}
                      disabled={localQty <= 0 || atStockLimit}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      Buy Now
                    </button>
                    <button
                      className="cart-action-btn cart-action-btn--remove"
                      onClick={() => handleRemove(product)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Remove
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Order summary sidebar */}
          <div className="cart-summary-panel">
            <p className="cart-summary-eyebrow">Order Summary</p>

            <div className="cart-summary-rows">
              {products.map((p) => (
                <div key={p.id} className="cart-summary-row">
                  <span className="cart-summary-row-name">{p.title}</span>
                  <span className="cart-summary-row-price">
                    ${Math.round(getLocal(p.id) * p.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total-row">
              <span>Total</span>
              <span className="cart-summary-total-value">
                ${Math.round(cartTotalAmount)}
              </span>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={handleBuyEntireCart}
              disabled={!cartIsValid}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Checkout ({products.length} item{products.length !== 1 ? 's' : ''})
            </button>

            <p className="cart-summary-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Secure checkout · Reserved for 24 hrs
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;