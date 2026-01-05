

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosInstance from "../apis/config"; 
import api from "../apis/axiosConfig";
import { useSelector, useDispatch } from 'react-redux';
import {
  addProductToCartBackend,
  updateProductQuantityBackend,
  removeProductFromCartBackend,
  fetchCartItems 
} from '../store/slices/productCart';
import { removeFromWishlist } from "../store/slices/wishlistSlice";
import { increment, decrement } from '../store/slices/counter'; 
import "./productDetails.css"; 
import "../components/wishlistButton.css"
import WishlistButton from '../components/WishlistButton';

const ProductDetails = () => {
  const [productDetails, setProductDetails] = useState(null); 
  const [showCategory, setShowCategory] = useState(false);
  const [showBrand, setShowBrand] = useState(false); 
  const [showDimensions, setShowDimensions] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const dispatch = useDispatch();
  const params = useParams(); 
  const navigate = useNavigate(); 

  
  const productsInCart = useSelector((state) => state.productCart.products);

  const productInCart = productsInCart.find((p) => String(p.id) === String(params.id));

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);


  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axiosInstance.get(`/products/${params.id}`);
        setProductDetails(res.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setProductDetails(null); 
      }
    };

    fetchProductDetails();
   
  }, [params.id]);

 
  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);


  
  const availableStock = productDetails ? productDetails.stock : 0;
  const quantityInCart = productInCart ? productInCart.quantity : 0;
  const remainingStock = availableStock - quantityInCart;

   
   const handleBuyNow = () => {
    if (!isAuthenticated) { 
      alert("Please log in to proceed to checkout.");
      navigate('/login');
      return;
    }
    if (!productDetails) {
      alert("Product details not loaded yet. Please try again.");
      return;
    }

  
    const quantityToBuy = 1 || quantityInCart;

    if (quantityToBuy > remainingStock) {
      alert(`Cannot buy ${quantityToBuy} items. Only ${remainingStock} available.`);
      return;
    }

    
    navigate('/checkout', {
        state: {
            isSingleProduct: true,
            productId: productDetails.id,
            quantity: quantityToBuy,
            totalAmount: quantityToBuy * productDetails.price,
           
        }
    });
  }; 

  const handleAddToCart = async () => {
    if (!isAuthenticated) { // 🚀 التحقق من المصادقة
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }

    if (!productDetails) return; 

    
    if (quantityInCart >= availableStock) {
      alert(`Cannot add more. Only ${availableStock} items available in stock.`);
      return;
    }

    
    await dispatch(addProductToCartBackend({
      id: productDetails.id,
      title: productDetails.title,
      image: productDetails.images[0],
      price: productDetails.price,
      quantity: 1, 
      stock: productDetails.stock 
    }));
    dispatch(removeFromWishlist(productDetails.id));

    
    
  };

  const handleDecrementQuantity = async () => {
    if (!isAuthenticated) { // 🚀 التحقق من المصادقة
      alert("Please log in to manage cart items."); // رسالة للمستخدم
      navigate('/login');
      return;
    }

    if (!productInCart || productInCart.quantity <= 0) return;

    if (productInCart.quantity === 1) {
      
      await dispatch(removeProductFromCartBackend(productInCart.id));
    } else {
     
      await dispatch(updateProductQuantityBackend({
        productId: productInCart.id,
        quantity: productInCart.quantity - 1
      }));
    }
    
    
  };


  if (!productDetails) {
    return <div className="loading-message">Loading product details...</div>;
  }

  const isBuyNowDisabled = !isAuthenticated || remainingStock <= 0; // 🚀 حالة تعطيل زر الشراء
  const isAddToCartDisabled = !isAuthenticated || remainingStock <= 0; // 🚀 حالة تعطيل زر الإضافة

  return (
    <div className="product-details-container">
      <div className="product-grid">
        
        <div className="product-images">
          {productDetails?.images?.[0] && (
            <img
              src={productDetails.images[0]}
              alt={productDetails?.title || "Product image"}
              className="product-main-image"
            />
          )}

          
          {productDetails?.images?.length > 1 && (
            <div className="thumbnail-container">
              {productDetails.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${productDetails?.title || "Product"} thumbnail ${index + 1}`}
                  className="product-thumbnail"
                />
              ))}
            </div>
          )}
        </div>

       
        <div className="product-info">
          <div className="product-title-container">
            <h1 className="product-title">{productDetails?.title}</h1>
            <WishlistButton product={productDetails} />
          </div>
          <p className="product-description">{productDetails?.description}</p>

          <div className="product-divider"></div>

          <div className="product-price-section">
            <h3 className="product-price"> ${productDetails?.price}</h3>
            <p className="price-note">Competitive pricing guaranteed</p>
          </div>

          <div className="product-divider"></div>

          <div className="stock-status">
            {remainingStock <= 0 ? (
              <span className="badge out-of-stock">Out of Stock</span>
            ) : (
              <span className="badge in-stock">
                In Stock ({remainingStock} remaining)
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
                <div className="info-content">{productDetails?.category}</div>
              )}
              <button
                className="info-btn"
                onClick={() => setShowBrand(!showBrand)}
              >
                Brand
              </button>
              {showBrand && (
                <div className="info-content">{productDetails?.brand}</div>
              )}
              {/* يمكن إضافتها مع Category و Brand */}
              <button className="info-btn" onClick={() => setShowDimensions(!showDimensions)}>
                Dimensions
              </button>
              {showDimensions && (
                <div className="info-content">
                  W: {productDetails.dimensions.width} x H: {productDetails.dimensions.height} x D: {productDetails.dimensions.depth}
                </div>
              )}
            </div>
          </div>

          <div className="product-divider"></div>

          <div className="quantity-section">
            <div className="quantity-controls">
              <button
                onClick={handleDecrementQuantity}
                disabled={!productInCart || productInCart.quantity <= 0}
                className="quantity-btn"
              >
                -
              </button>

              <span className="quantity-display">{quantityInCart} </span>

              <button
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="quantity-btn"
              >
                +
              </button>
            </div>

            <p className="stock-message">
              Available Stock: {remainingStock}
            </p>

            <div className="action-buttons">
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={isBuyNowDisabled}
              >
                Buy Now
              </button>
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
              >
                Add to Cart
              </button>
            </div>
            {/* --- قسم الضمان والشحن والاسترجاع --- */}
            <div className="product-trust-badges mt-4">
              <div className="row g-2">
                {/* الضمان */}
                <div className="col-6 col-md-4">
                  <div className="badge-item">
                    <i className="bi bi-shield-check text-primary fs-4"></i>
                    <div>
                      <h6>Warranty</h6>
                      <p>{productDetails.warrantyInformation}</p>
                    </div>
                  </div>
                </div>

                {/* الاسترجاع */}
                <div className="col-6 col-md-4">
                  <div className="badge-item">
                    <i className="bi bi-arrow-left-right text-primary fs-4"></i>
                    <div>
                      <h6>Returns</h6>
                      <p>{productDetails.returnPolicy}</p>
                    </div>
                  </div>
                </div>

                {/* الشحن */}
                <div className="col-12 col-md-4">
                  <div className="badge-item">
                    <i className="bi bi-truck text-primary fs-4"></i>
                    <div>
                      <h6>Shipping</h6>
                      <p>{productDetails.shippingInformation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      {/* --- قسم ملخص التقييمات والتحكم بالعرض --- */}
        <div className="product-reviews-wrapper mt-5">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                    <h3 className="mb-0 fw-bold">Ratings & Reviews</h3>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <div className="text-warning">
                            {/* عرض النجوم بناءً على التقييم العام للمنتج */}
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`bi ${i < Math.floor(productDetails.rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                            ))}
                        </div>
                        <span className="fw-bold">{productDetails.rating}</span>
                        <span className="text-muted">({productDetails.reviews?.length} reviews)</span>
                    </div>
                </div>
                
                {/* زر إظهار/إخفاء التقييمات */}
                <button 
                    className={`btn ${showReviews ? 'btn-outline-secondary' : 'btn-primary'} shadow-sm`}
                    onClick={() => setShowReviews(!showReviews)}
                >
                    {showReviews ? 'Hide Reviews' : 'Show Customer Reviews'}
                </button>
            </div>

            {/* --- عرض قائمة التقييمات عند الطلب فقط --- */}
            {showReviews && (
                <div className="reviews-list-animation">
                    <div className="row g-4">
                        {productDetails.reviews && productDetails.reviews.length > 0 ? (
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
                                                    <small className="text-muted" style={{fontSize: '11px'}}>
                                                        {new Date(review.date).toLocaleDateString('en-GB')}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="badge bg-light text-warning border">
                                                {review.rating} <i className="bi bi-star-fill"></i>
                                            </div>
                                        </div>
                                        <p className="review-text text-secondary mb-0">
                                            <i className="bi bi-quote text-primary opacity-25 fs-4"></i>
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
  );
};

export default ProductDetails;