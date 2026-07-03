// ProductCard.jsx  —  FIXED
// Changes:
//   FIX 3: product id compared as Number so Redux lookup never returns undefined
//          when the store holds numeric ids and the prop is a string (or vice
//          versa).
//   FIX 4: "Add to Cart" always sends quantity: 1 — it is an incremental add,
//          not a setter.  The backend accumulates (quantity + 1) correctly.
//          No local counter is needed here because the card only has one CTA.

import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { addProductToCartBackend } from '../store/slices/productCart';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import WishlistButton from './WishlistButton';
import './productCard.css';
import './wishlistButton.css';

const ProductCard = ({ data }) => {
  const productsFromStore = useSelector((state) => state.productCart.products);
  // FIX 3: compare as Number so the lookup is never broken by a type mismatch
  const productFromStore = productsFromStore.find(
    (p) => p.id === Number(data?.id)
  );
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    const currentQuantity = productFromStore?.quantity ?? 0;
    if (currentQuantity >= data.stock) {
      alert('Cannot add more than available stock!');
      return;
    }

    // FIX 4: always add 1; the backend does quantity + 1 on its own
    dispatch(
      addProductToCartBackend({
        id: data.id,
        title: data.title,
        image: data.images[0],
        quantity: 1,
        price: data.price,
        stock: data.stock,
      })
    );
    dispatch(removeFromWishlist(data.id));
  };

  const handleViewDetails = () => navigate(`/product-details/${data.id}`);

  const isOutOfStock         = data.stock <= 0;
  const alreadyAtStockLimit  =
    productFromStore && productFromStore.quantity >= data.stock;

  return (
    <div className="product-card card h-100 border-0 shadow-sm">

      {/* Image area */}
      <div className="product-card__image-wrap position-relative">
        <span className={`product-card__badge badge ${isOutOfStock ? 'bg-danger' : 'bg-success'}`}>
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>
        <div className="product-card__wishlist">
          <WishlistButton product={data} />
        </div>
        <img
          src={data.images[0]}
          className="product-card__img card-img-top"
          style={{ objectFit: 'contain', height: '200px' }}
          alt={data.title}
        />
      </div>

      {/* Body */}
      <div className="card-body d-flex flex-column px-3 pt-3 pb-3">
        <h6 className="product-card__title card-title mb-1 fw-semibold">
          {data.title}
        </h6>
        <p
          className="product-card__desc card-text text-muted flex-grow-1 mb-3"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {data.description}
        </p>

        <div className="product-card__footer mt-auto">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="product-card__price fw-bold">${data.price}</span>
            <button
              className="btn btn-outline-secondary btn-sm product-card__details-btn"
              onClick={handleViewDetails}
            >
              Details
            </button>
          </div>

          {/* Quantity badge: shows how many are already in cart */}
          {productFromStore && productFromStore.quantity > 0 && (
            <p className="product-card__in-cart-note text-muted mb-1" style={{ fontSize: '12px' }}>
              {productFromStore.quantity} in cart
            </p>
          )}

          <button
            className={`btn btn-sm w-100 product-card__cart-btn ${
              isOutOfStock || !isAuthenticated || alreadyAtStockLimit
                ? 'btn-secondary'
                : 'btn-primary'
            }`}
            onClick={handleAddToCart}
            disabled={!isAuthenticated || isOutOfStock || alreadyAtStockLimit}
          >
            {!isAuthenticated
              ? '🔒 Login to Add'
              : isOutOfStock || alreadyAtStockLimit
              ? 'Max stock reached'
              : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;