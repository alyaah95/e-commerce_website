
import EmptyCart from "../components/emptyCart";
import Cart from "../components/cart";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCartItems, setCartItems } from "../store/slices/productCart"; 
import { setCounterValue } from "../store/slices/counter"; 

const ShoppingCart = () => {
  const products = useSelector((state) => state.productCart.products);
  const loading = useSelector((state) => state.productCart.loading);
  const error = useSelector((state) => state.productCart.error);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("ShoppingCart useEffect triggered!");
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Fetching cart items...");
      dispatch(fetchCartItems())
    } else {
      dispatch(setCartItems([])); 
    }
  }, [dispatch]);

  if (loading === "pending") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Cart...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  return <>{products.length === 0 ? <EmptyCart /> : <Cart />}</>;
};

export default ShoppingCart;
