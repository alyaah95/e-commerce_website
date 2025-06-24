import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axiosInstance from "../apis/config";
import {useSelector, useDispatch} from 'react-redux';
import {increment, decrement} from '../store/slices/counter'
import {addProductToCart, decreaseProduct, increaseProduct} from '../store/slices/productCart';
import "./productDetails.css";
const ProductDetails = () => {
  const [product, setProduct] = useState();
  const [showCategory, setShowCategory] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
 

  const dispatch = useDispatch();
  const productsFromStore = useSelector((state) => state.productCart.products)
  const productFromStore = productsFromStore.find((p) => p.id === product?.id)
  

  
  
  const params = useParams();
  useEffect(() => {
    axiosInstance
      .get(`/products/${params.id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [params.id]);
  console.log(product?.title);
  console.log("brand:" + product?.brand);

  
  const incrementProductQuantity = () => {
    const currentQuantity = productFromStore?.quantity || 0;
    if (currentQuantity < product.stock) {
      dispatch(increment())
        dispatch(addProductToCart({
          
          id:product.id,
          title:product.title,
          image:product.images[0],
          quantity:currentQuantity + 1,
          price:product.price,
          stock:product.stock
        }))
 
    }
        
        
        
  }
  
  const decrementProductQuantity = () => {
    if (productFromStore.quantity > 0) {
      dispatch(decrement());
      dispatch(decreaseProduct(product.id));
    } else {
      dispatch(removeProduct(product.id));
      dispatch(decrement());
    }

   
    
}

  


  return (
    <div className="product-details-container">
      <div className="product-grid">
        {/* Image Section */}
        <div className="product-images">
          {/* Main Image */}
          {product?.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product?.title || "Product image"}
              className="product-main-image"
            />
          )}

          {/* Thumbnails */}
          {product?.images?.length > 1 && (
            <div className="thumbnail-container">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product?.title || "Product"} thumbnail ${index + 1}`}
                  className="product-thumbnail"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="product-info">
          <h1 className="product-title">{product?.title}</h1>
          <p className="product-description">{product?.description}</p>

          <div className="product-divider"></div>

          <div className="product-price-section">
            <h3 className="product-price"> ${product?.price}</h3>
            <p className="price-note">Competitive pricing guaranteed</p>
          </div>

          <div className="product-divider"></div>

          <div className="stock-status">
            {product?.stock <= 0 ? (
              <span className="badge out-of-stock">Out of Stock</span>
            ) : (
              <span className="badge in-stock">
                In Stock
              </span>
            )}
          </div>

          <div className="additional-info">
            <h5 className="info-heading">More Information</h5>
            <div className="info-buttons">
              <button
                className="info-btn"
                onClick={() => setShowCategory(!showCategory)}
              >
                Category
              </button>
              {showCategory && (
                <div className="info-content">{product?.category}</div>
              )}

              
              
            </div>
          </div>

          <div className="product-divider"></div>

          <div className="quantity-section">
            <div className="quantity-controls">
              <button
                onClick={() => decrementProductQuantity()}
                disabled={!productFromStore || productFromStore.quantity <= 0}
                className="quantity-btn"
              >
                -
              </button>

              <span className="quantity-display">{isNaN(productFromStore?.quantity)? 0 : productFromStore?.quantity} </span>

              <button
                onClick={() => incrementProductQuantity()}
                disabled={productFromStore?.quantity >= productFromStore?.stock}
                className="quantity-btn"
              >
                +
              </button>
            </div>

            <p className="stock-message">
              Remaining stock: {isNaN(productFromStore?.quantity)? product?.stock : productFromStore?.stock - productFromStore?.quantity} 
            </p>

            <div className="action-buttons">
              <button className="buy-now-btn">Buy Now</button>
              <button className="add-to-cart-btn" onClick={() => incrementProductQuantity()} disabled={productFromStore?.quantity>= productFromStore?.stock}>Add to Cart</button>
            </div>
          </div>..
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
