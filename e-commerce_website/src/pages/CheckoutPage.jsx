import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch , useSelector} from "react-redux";
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
  

  const entireCartProducts = useSelector((state) => state.productCart.products);
  const { productId, quantity , totalAmount: passedTotalAmount, isEntireCart, isSingleProduct } = location.state || {};
  const totalAmount = isEntireCart 
    ? entireCartProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    : passedTotalAmount; // الإجمالي الممرر لمنتج واحد
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    city: '',
    details: '' // العنوان بالتفصيل
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
    // 🛑 التحقق من وجود بيانات للطلب
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
        if (shippingAddress.details.trim().length > 5) { // إذا كتب المستخدم أكثر من 5 حروف
            setShippingFee(50); // تكلفة توصيل ثابتة مثلاً 50
        } else {
            setShippingFee(0); // إذا مسح العنوان ترجع صفر
        }
    }, [shippingAddress.details]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // 🛑 1. التحقق من الحقول الأساسية
    if (!totalAmount || totalAmount <= 0) {
        alert("Error: Total amount is missing or zero.");
        return;
    }
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert("Please fill in all payment details.");
        return;
    }
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city || !shippingAddress.details) {
        alert("Please fill in all shipping address details.");
        return;
    }
    
    setPaymentProcessing(true);

    // 2. محاكاة نجاح الدفع
    await new Promise((resolve) => setTimeout(resolve, 1500)); 

    // 3. استدعاء API إتمام الطلب (Thunk)
    try {
        // 🛑 إذا كان شراء منتج واحد، نرسل طلب placeOrder خاص به، وإلا نرسل طلب السلة.
        // لتبسيط الـ Backend، سنعتبر أننا في كلتا الحالتين نرسل أمر شراء السلة الحالية
        // ملاحظة: الـ Backend يجب أن يحتوي على منطق التعامل مع شراء منتج واحد منفصل عن السلة إذا أردتِ ذلك
        
        let itemsToOrder;
        // let finalOrderDetails;
        
        if (isSingleProduct) {
            // نستخدم Thunk مخصصة لشراء منتج واحد إذا كان الـ Backend يدعمها، 
            // أو نعتمد على أن المنتج تم وضعه في السلة مسبقًا ويتم التعامل معه كجزء من السلة.
            // 💡 بما أن طلبك هو تسهيل تتبع الطلبات، سأفترض أننا نضع المنتج في سلة مؤقتة ثم نشتريها كلها (الخيار الأسهل)
            // لكن بما أن الـ Backend لا يدعم PlaceOrder لمنتج واحد، سنعالج السلة بالكامل.

            // 💡 هنا يجب أن يكون هناك منطق لضمان أن السلة لا تحتوي إلا على هذا المنتج، أو نعتمد على شراء السلة.
            // لتسريع التطبيق: سنستخدم نفس الـ Thunk placeOrderThunk للتعامل مع كلتا الحالتين.
            itemsToOrder = [{ productId, quantity }];
            // finalOrderDetails = { 
            //     shippingAddress: shippingAddress,
            //     totalAmount: totalAmount,
            //     // سنفترض أن الـ Backend سيتجاهل أي عناصر في السلة غير المنتج المختار إذا كان isSingleProduct
            // };

        } else { // شراء السلة بأكملها
            // if (entireCartProducts.length === 0) throw new Error("Cart is empty.");
            // finalOrderDetails = { 
            //     shippingAddress: shippingAddress,
            //     totalAmount: totalAmount,
            // };
            itemsToOrder = entireCartProducts.map(p => ({
                productId: p.id,
                quantity: p.quantity,
                price: p.price,
                title: p.title
            }));
        }

        const finalOrderDetails = { 
            shippingAddress: shippingAddress,
            totalAmount: totalAmount,
            items: itemsToOrder, // 🛑 إرسال قائمة المنتجات المشتراة
            isSingleProduct: isSingleProduct // 🛑 إرسال مؤشر نوع الطلب
        };

        const result = await dispatch(placeOrderThunk(finalOrderDetails)).unwrap();
        
        // if (isSingleProduct) {
        //   dispatch(decrementByQuantity(quantity)); 
        // }else {
        //     dispatch(resetCounter()); 
        // }

        // 5. ✅ نجاح الطلب: التوجيه لصفحة تتبع الطلب
        alert(`Payment Successful! Your order has been placed.`);
        navigate(`/orders`); 

    } catch (error) {
        console.error("Error during checkout process:", error);
        alert(`Payment failed or an error occurred: ${error.message || 'Server error'}`);
    } finally {
        setPaymentProcessing(false);
    }
  };

  if (isSingleProduct && (!productId || !quantity)) {
    return <div className="checkout-loading">Loading item details...</div>;
  }
  if (isEntireCart && (!entireCartProducts || entireCartProducts.length === 0)) {
    return <div className="checkout-loading">Loading your cart...</div>;
  }
  const handleExpiryDateChange = (e) => {
    let value = e.target.value;
    // 1. Remove any character that is not a digit or a slash
    value = value.replace(/[^0-9/]/g, "");

    // 2. Add a slash after the second digit if not already present and not just a slash
    if (value.length === 2 && !value.includes("/") && value.length < 3) {
      value += "/";
    }

    // 3. Prevent more than 5 characters (MM/YY)
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    setExpiryDate(value);
  };



  if (totalAmount === undefined || totalAmount === null) {
    return <div className="checkout-loading">Calculating total...</div>;
  }
    
    
  const summaryText = isEntireCart 
    ? `You are purchasing **${entireCartProducts.length}** unique item(s).` 
    : `You are purchasing ${quantity} item(s) for Product ID: ${productId}.`;

  return (
    <div className="checkout-container">
      <h2>Complete Your Purchase</h2>
      <p className="product-summary">
        {summaryText} **Total: ${totalAmount.toFixed(2)}**
      </p>
      <form onSubmit={handlePaymentSubmit} className="payment-form">

        <div className="shipping-address-section" style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>shipping address</h3>
          <div className="form-group">
              <label htmlFor="fullName">full name</label>
              <input type="text" id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} required />
          </div>
          {/* ... (باقي حقول العنوان: phone, city, details) ... */}
          <div className="form-group">
              <label htmlFor="phone">phone number</label>
              <input type="tel" id="phone" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} required />
          </div>
          <div className="form-group">
              <label htmlFor="city">city</label>
              <input type="text" id="city" name="city" value={shippingAddress.city} onChange={handleAddressChange} required />
          </div>
          <div className="form-group">
              <label htmlFor="details">the detailed address (street, building, floor)</label>
              <textarea id="details" name="details" value={shippingAddress.details} onChange={handleAddressChange} required rows="3"></textarea>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="cardName">Cardholder Name</label>
          <input
            type="text"
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) =>
              setCardNumber(e.target.value.replace(/\s/g, "").slice(0, 16))
            } // 16 digits
            placeholder="XXXX XXXX XXXX XXXX"
            required
            maxLength="16"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              placeholder="MM/YY"
              required
              maxLength="5" // Set maxLength to 5 to allow "MM/YY"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
              } // 3 digits
              placeholder="XXX"
              required
              maxLength="3"
            />
          </div>
        </div>

        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Items Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="summary-item">
              <span>Shipping Fee:</span>
              <span className={shippingFee > 0 ? "fee-amount" : "fee-placeholder"}>
                {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : "TBD"}
              </span>
            </div>

            {shippingFee > 0 && (
              <div className="summary-item shipping-promo">
                <small>Standard Delivery (Flat Rate)</small>
              </div>
            )}

            <hr className="summary-divider" />

            <div className="summary-item total-row">
              <span>Order Total:</span>
              <span className="final-price">${(totalAmount + shippingFee).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="submit-payment-btn"
            disabled={paymentProcessing || (shippingFee === 0)} // منع الدفع لو مفيش عنوان
          >
            {paymentProcessing ? "Processing..." : `Pay $${(totalAmount + shippingFee).toFixed(2)} Now`}
          </button>
          
          {shippingFee === 0 && (
            <p className="address-hint">* Please enter a valid address to calculate shipping</p>
          )}
        </div>

        {/* <button
          type="submit"
          className="submit-payment-btn"
          disabled={paymentProcessing}
          style={{ marginTop: '20px' }}
        >
          {paymentProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)} Now`}
        </button> */}
      </form>
    </div>
  );
};

export default CheckoutPage;
