import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import { addProductToCartBackend } from '../store/slices/productCart';
// import { increment } from '../store/slices/counter';
import WishlistButton from './WishlistButton';
import "./productCard.css";
import "./wishlistButton.css"

const ProductCard = (props) => {
  const { data } = props;
  console.log(data);

  const productsFromStore = useSelector((state) => state.productCart.products);
  const productFromStore = productsFromStore.find((p) => p.id === data?.id);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }

    const currentQuantity = productFromStore?.quantity || 0;
    if (currentQuantity < data.stock) {
      // dispatch(increment());
      dispatch(
        addProductToCartBackend({
          id: data.id,
          title: data.title,
          image: data.images[0],
          quantity: currentQuantity + 1,
          price: data.price,
          stock: data.stock,
        })
      );
      dispatch(removeFromWishlist(data.id));
    } else {
        alert("Cannot add more than available stock!");
    }
  };

  const handleViewDetails = () => {
    navigate(`/product-details/${data.id}`);
  };

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="position-relative">
        {data.stock <= 0 ? (
          <span className="badge bg-danger">out of stock</span>
        ) : (
          <span className="badge bg-success">in stock</span>
        )}
        <WishlistButton product={data} />
        
          <img
            src={data.images[0]}
            className="card-img-top p-3"
            style={{ objectFit: "contain", height: "200px" }}
            alt={data.title}
          />
        
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{ whiteSpace: "normal" }}>
          {data.title}
        </h5>
        <p className="card-text text-muted flex-grow-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {data.description}
        </p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold">{data.price} $</span>
          <button
            className="btn btn-outline-info btn-sm" 
            onClick={handleViewDetails}
          >
            View Details
          </button>

          <div className="d-flex justify-content-end mt-2"> 
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={!isAuthenticated || data.stock <= 0}
          >
            {!isAuthenticated ? "Login to Add" : (data.stock <= 0 ? "Out of Stock" : "Add to Cart")}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;