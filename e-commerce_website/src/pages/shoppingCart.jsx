import EmptyCart from "../components/emptyCart";
import Cart from "../components/cart";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCartItems, setCartItems } from "../store/slices/productCart";
import "./ShoppingCart.css";


const ShoppingCart = () => {
  const products = useSelector((state) => state.productCart.products);
  const loading = useSelector((state) => state.productCart.loading);
  const error = useSelector((state) => state.productCart.error);
  const dispatch = useDispatch();

  useEffect(() => {
  console.log("ShoppingCart useEffect triggered! Trusting Redux store.");
  const token = localStorage.getItem("token");
  
  if (!token) {
    // لو مش مسجل دخول، السلة لازم تفضى
    dispatch(setCartItems([]));
  }
  // شيلنا الـ fetchCartItems تماماً من هنا لأن App.jsx شايلها بالفعل!
}, [dispatch]);

  if (loading === "pending") {
    return (
      <div className="sc-fullscreen-center">
        <div className="sc-spinner" />
        <p className="sc-loading-text">Loading your cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sc-fullscreen-center">
        <div className="sc-error-card">
          <span className="sc-error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
          <h5>Something went wrong</h5>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return <>{products.length === 0 ? <EmptyCart /> : <Cart />}</>;
};

export default ShoppingCart;