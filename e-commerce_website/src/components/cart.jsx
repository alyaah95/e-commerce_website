
import { useSelector, useDispatch } from "react-redux";

import { removeProductFromCartBackend, updateProductQuantityBackend } from "../store/slices/productCart";



// import { increment, decrement, decrementByQuantity } from "../store/slices/counter";
import { useNavigate } from "react-router";
const Cart = () => {
  const products = useSelector((state) => state.productCart.products);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const handleRemove = async (product) => {
    
    await dispatch(removeProductFromCartBackend(product.id));
    
    // dispatch(decrementByQuantity(product.quantity)); 
  };

  const incrementProductQuantity = async (product) => {
    
    const productOriginalStock = product?.stock; 

    if (product.quantity >= productOriginalStock) {
      alert("Cannot add more than available stock!");
      return;
    }

   
    await dispatch(updateProductQuantityBackend({
      productId: product.id,
      quantity: product.quantity + 1
    }));
   
    // dispatch(increment());
  };

  const decrementProductQuantity = async (product) => {
    if (product.quantity <= 1) {
     
      await handleRemove(product);
    } else {
     
      await dispatch(updateProductQuantityBackend({
        productId: product.id,
        quantity: product.quantity - 1
      }));
      
      // dispatch(decrement());
    }
  };

 
  const handleBuyNow = (product) => {
    
    navigate('/checkout', {
      state: {
        isSingleProduct: true,
        productId: product.id,
        quantity: product.quantity, 
        totalAmount: product.quantity * product.price,
      }
    });
  };

  const handleBuyEntireCart = () => {
    if (products.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // حساب الإجمالي الكلي
    const totalAmount = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);

    navigate('/checkout', {
        state: {
            isEntireCart: true, // مؤشر بأن الشراء للسلة بأكملها
            totalAmount: totalAmount,
        }
    });
  };

  const cartTotalAmount = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);

  return (
    <>
      {products.length > 0 && (
        <div className="alert alert-info text-center" style={{ margin: "20px 6%", borderRadius: "8px" }}>
          <i className="bi bi-clock-history" style={{ marginRight: "10px" }}></i>
          Items in your cart are reserved for <b>24 hours</b>. Complete your purchase now to secure your items!
        </div>
      )}
      <div className="row" style={{ marginLeft: "6%", marginTop: "7%" }}>
        <div className="col-5">Product</div>
        <div className="col-3">Quantity</div>
        <div className="col-2">Actions</div>
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
            <img src={product.image} style={{ width: "25%" }} alt={product.title} />{" "}
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
                  disabled={product.quantity >= product?.stock} 
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

             
              <p className="stock-message">
                Remaining stock: {product.stock ? (product.stock - product.quantity) : 'N/A'}
              </p>

            </div>
          </div>
         
          <div className="col-2" style={{ paddingTop: "4%", paddingLeft: "3.5%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              className="btn btn-sm btn-danger" 
              onClick={() => handleRemove(product)}
            >
              Remove
            </button>
            <button
              className="btn btn-sm btn-success" 
              onClick={() => handleBuyNow(product)}
              disabled={product.quantity <= 0 || (product.stock !== undefined && product.quantity > product.stock)} 
            >
              Buy Now
            </button>
          </div>
          <div className="col-2 " style={{ paddingTop: "4%", paddingLeft: "3.5%" }}>{`$` + Math.round(product.quantity * product.price)}</div>
        </div>
      ))}

      {products.length > 0 && (
        <div style={{ marginLeft: "4%", marginTop: "30px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
            <div className="row">
                <div className="col-5"></div>
                <div className="col-3"></div>
                <div className="col-2" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    Total:
                </div>
                <div className="col-2" style={{ fontWeight: 'bold' }}>
                    {`$` + Math.round(cartTotalAmount)}
                </div>
            </div>
            <div className="row" style={{ marginTop: '20px' }}>
                <div className="col-10"></div>
                <div className="col-2">
                    <button
                        className="btn btn-lg btn-primary"
                        onClick={handleBuyEntireCart} // 🛑 استدعاء دالة شراء السلة
                        disabled={products.some(p => p.quantity <= 0 || (p.stock !== undefined && p.quantity > p.stock))}
                        style={{ width: '100%' }}
                    >
                        Buy Entire Cart
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
export default Cart;