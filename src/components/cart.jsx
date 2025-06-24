import { useSelector, useDispatch } from "react-redux";
import { removeProduct ,increaseProduct,decreaseProduct } from "../store/slices/productCart";
import { decrementByQuantity  } from "../store/slices/counter";
import { increment, decrement } from "../store/slices/counter";
import {useState } from "react";
const Cart = () => {
  const products = useSelector((state) => state.productCart.products);
  const dispatch = useDispatch();
  const handleRemove = (product) => {
    dispatch(removeProduct(product.id));
    dispatch(decrementByQuantity(product.quantity));
  };

  

  const incrementProductQuantity = (product) => {
    if (product.quantity < product.stock) {
      dispatch(increment());
      // Add this to your productCart slice (I'll show below)
      dispatch(increaseProduct(product.id));
    }
  };

  const decrementProductQuantity = (product) => {
    if (product.quantity > 0) {
      dispatch(decrement());
      dispatch(decreaseProduct(product.id));
    }
   
  };
  
  return (
    <>
      <div className="row" style={{ marginLeft: "6%", marginTop: "7%" }}>
        <div className="col-5">Product</div>
        <div className="col-3">Quantity</div>
        <div className="col-2">remove</div>
        <div className="col-2">Price</div>
      </div>
      <hr />
      {products.map((product) => (
        <div
          className="row"
          key={product.id}
          style={{ marginLeft: "4%", marginTop: "3%" }}
        >
          <div className="col-5">
            <img src={product.image} style={{ width: "25%" }} />{" "}
            <span style={{ fontWeight: "bold", paddingLeft: "5%" }}>
              {product.title}
            </span>
          </div>
          <div
            className="col-3"
            style={{ paddingTop: "4%", paddingLeft: "3.5%" }}
          >
            <div className="quantity-section">
              <div className="quantity-controls">
                <button
                  onClick={() => decrementProductQuantity(product)}
                  className="quantity-btn"
                >
                  -
                </button>

                <span className="quantity-display">{product.quantity}</span>

                <button
                  onClick={() => incrementProductQuantity(product)}
                  disabled={product.quantity >= product.stock}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              <p className="stock-message">
                Remaining stock: {product.stock - product.quantity}
              </p>

              
            </div>
          </div>
          <div className="col-2" style={{ paddingTop: "4%", paddingLeft: "3.5%" }}>
            <button
              className="btn-close"
              aria-label="Close"
              onClick={() => handleRemove(product)}
            ></button>
          </div>
          <div className="col-2 " style={{ paddingTop: "4%", paddingLeft: "3.5%" }}>{`$`+Math.round(product.quantity * product.price)}</div>
        </div>
      ))}
    </>
  );
};
export default Cart;
