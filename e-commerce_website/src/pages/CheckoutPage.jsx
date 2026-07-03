import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  removeProductFromCartBackend,
  fetchCartItems,
  placeOrderThunk,
} from "../store/slices/productCart";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  /* ── All state & logic — completely untouched ── */
  const entireCartProducts = useSelector((state) => state.productCart.products);
  const { productId, quantity, totalAmount: passedTotalAmount, isEntireCart, isSingleProduct } = location.state || {};
  const totalAmount = isEntireCart
    ? entireCartProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    : passedTotalAmount;

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    city: "",
    details: "",
  });
  const [shippingFee, setShippingFee] = useState(0);
  const totalAmountPlusFee = totalAmount + shippingFee;
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (paymentProcessing) return;
    const isValidSingleProduct = isSingleProduct && productId && quantity && totalAmount;
    const isValidEntireCart = isEntireCart && entireCartProducts.length > 0 && totalAmount;
    if (!isValidSingleProduct && !isValidEntireCart) {
      const timer = setTimeout(() => {
        if (!paymentProcessing) {
          alert("No valid products selected.");
          navigate("/");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSingleProduct, isEntireCart, productId, quantity, totalAmount, entireCartProducts.length, navigate]);

  useEffect(() => {
    if (shippingAddress.details.trim().length > 5) {
      setShippingFee(50);
    } else {
      setShippingFee(0);
    }
  }, [shippingAddress.details]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!totalAmount || totalAmount <= 0) { alert("Error: Total amount is missing or zero."); return; }
    if (!cardName || !cardNumber || !expiryDate || !cvv) { alert("Please fill in all payment details."); return; }
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city || !shippingAddress.details) {
      alert("Please fill in all shipping address details."); return;
    }
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      let itemsToOrder;
      if (isSingleProduct) {
        itemsToOrder = [{ productId, quantity }];
      } else {
        itemsToOrder = entireCartProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
          price: p.price,
          title: p.title,
        }));
      }
      const finalOrderDetails = {
        shippingAddress: shippingAddress,
        totalAmount: totalAmount,
        items: itemsToOrder,
        isSingleProduct: isSingleProduct,
      };
      const result = await dispatch(placeOrderThunk(finalOrderDetails)).unwrap();
      alert(`Payment Successful! Your order has been placed.`);
      navigate(`/orders`);
    } catch (error) {
      console.error("Error during checkout process:", error);
      alert(`Payment failed or an error occurred: ${error.message || "Server error"}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9/]/g, "");
    if (value.length === 2 && !value.includes("/") && value.length < 3) {
      value += "/";
    }
    if (value.length > 5) { value = value.slice(0, 5); }
    setExpiryDate(value);
  };

  /* ── Loading / guard states ── */
  if (isSingleProduct && (!productId || !quantity)) {
    return (
      <div className="chk-fullscreen-center">
        <div className="chk-spinner" />
        <p className="chk-loading-text">Loading item details…</p>
      </div>
    );
  }
  if (isEntireCart && (!entireCartProducts || entireCartProducts.length === 0)) {
    return (
      <div className="chk-fullscreen-center">
        <div className="chk-spinner" />
        <p className="chk-loading-text">Loading your cart…</p>
      </div>
    );
  }
  if (totalAmount === undefined || totalAmount === null) {
    return (
      <div className="chk-fullscreen-center">
        <div className="chk-spinner" />
        <p className="chk-loading-text">Calculating total…</p>
      </div>
    );
  }

  /* ── Derived display values ── */
  const itemCount = isEntireCart ? entireCartProducts.length : quantity;
  const summaryItems = isEntireCart
    ? entireCartProducts
    : [{ title: `Product #${productId}`, quantity, price: totalAmount / quantity }];

  return (
    <div className="chk-page">
      <div className="chk-container">

        {/* ── Page Header ── */}
        <div className="chk-page-header">
          <h1 className="chk-page-title">Checkout</h1>
          <p className="chk-page-sub">
            {isEntireCart
              ? `${entireCartProducts.length} item${entireCartProducts.length !== 1 ? "s" : ""} from your cart`
              : `${quantity} item${quantity !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <form onSubmit={handlePaymentSubmit} className="chk-layout">

          {/* ════════════════════════════
              LEFT — Form panels
          ════════════════════════════ */}
          <div className="chk-form-col">

            {/* ── Shipping address ── */}
            <div className="chk-panel">
              <div className="chk-panel-header">
                <div className="chk-panel-icon chk-panel-icon--ship">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h2 className="chk-panel-title">Shipping Address</h2>
              </div>

              <div className="chk-fields">
                <div className="chk-field-row">
                  <div className="chk-field">
                    <label className="chk-label" htmlFor="fullName">Full Name</label>
                    <input
                      className="chk-input"
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="chk-field">
                    <label className="chk-label" htmlFor="phone">Phone Number</label>
                    <input
                      className="chk-input"
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="+1 555 000 0000"
                      required
                    />
                  </div>
                </div>

                <div className="chk-field">
                  <label className="chk-label" htmlFor="city">City</label>
                  <input
                    className="chk-input"
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="Cairo"
                    required
                  />
                </div>

                <div className="chk-field">
                  <label className="chk-label" htmlFor="details">
                    Street Address
                    <span className="chk-label-hint"> (street, building, floor)</span>
                  </label>
                  <textarea
                    className="chk-input chk-textarea"
                    id="details"
                    name="details"
                    value={shippingAddress.details}
                    onChange={handleAddressChange}
                    placeholder="123 Main St, Building 4, Floor 2"
                    required
                    rows="3"
                  />
                  {shippingFee > 0 && (
                    <span className="chk-field-success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Address saved — $50 flat shipping applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Payment details ── */}
            <div className="chk-panel">
              <div className="chk-panel-header">
                <div className="chk-panel-icon chk-panel-icon--pay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <h2 className="chk-panel-title">Payment Details</h2>
              </div>

              <div className="chk-fields">
                <div className="chk-field">
                  <label className="chk-label" htmlFor="cardName">Cardholder Name</label>
                  <input
                    className="chk-input"
                    type="text"
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="chk-field">
                  <label className="chk-label" htmlFor="cardNumber">Card Number</label>
                  <div className="chk-input-icon-wrap">
                    <svg className="chk-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <input
                      className="chk-input chk-input--icon"
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\s/g, "").slice(0, 16))
                      }
                      placeholder="XXXX XXXX XXXX XXXX"
                      required
                      maxLength="16"
                    />
                  </div>
                </div>

                <div className="chk-field-row">
                  <div className="chk-field">
                    <label className="chk-label" htmlFor="expiryDate">Expiry Date</label>
                    <input
                      className="chk-input"
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      required
                      maxLength="5"
                    />
                  </div>
                  <div className="chk-field">
                    <label className="chk-label" htmlFor="cvv">
                      CVV
                      <span className="chk-label-hint"> (3 digits)</span>
                    </label>
                    <input
                      className="chk-input"
                      type="text"
                      id="cvv"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
                      }
                      placeholder="XXX"
                      required
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>{/* end chk-form-col */}

          {/* ════════════════════════════
              RIGHT — Sticky order summary
          ════════════════════════════ */}
          <div className="chk-summary-col">
            <div className="chk-summary-panel">

              <p className="chk-summary-eyebrow">Order Summary</p>

              {/* Item list */}
              <div className="chk-summary-items">
                {summaryItems.map((item, i) => (
                  <div key={i} className="chk-summary-item">
                    <span className="chk-summary-item-name">
                      {item.title}
                      {item.quantity > 1 && (
                        <span className="chk-summary-item-qty"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="chk-summary-item-price">
                      ${Math.round(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="chk-summary-divider" />

              {/* Subtotal */}
              <div className="chk-summary-row">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className={`chk-summary-row ${shippingFee > 0 ? "chk-summary-row--ship" : ""}`}>
                <span>Shipping</span>
                {shippingFee > 0 ? (
                  <span>${shippingFee.toFixed(2)}</span>
                ) : (
                  <span className="chk-summary-tbd">Enter address</span>
                )}
              </div>

              <div className="chk-summary-divider chk-summary-divider--bold" />

              {/* Total */}
              <div className="chk-summary-total">
                <span>Total</span>
                <span className="chk-summary-total-value">
                  ${(totalAmount + shippingFee).toFixed(2)}
                </span>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                className="chk-pay-btn"
                disabled={paymentProcessing || shippingFee === 0}
              >
                {paymentProcessing ? (
                  <>
                    <div className="chk-btn-spinner" />
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pay ${(totalAmount + shippingFee).toFixed(2)}
                  </>
                )}
              </button>

              {shippingFee === 0 && (
                <p className="chk-address-hint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Enter a valid address to enable payment
                </p>
              )}

              {/* Security note */}
              <p className="chk-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Secured · Encrypted · 256-bit SSL
              </p>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;