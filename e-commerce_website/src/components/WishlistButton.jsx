import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // تثبيت react-icons

const WishlistButton = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const isFavorite = wishlistItems.some(item => item.id === product.id);

  return (
    <button 
      className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
      onClick={(e) => {
        e.preventDefault(); // منع الانتقال لصفحة التفاصيل عند الضغط على القلب
        dispatch(toggleWishlist(product));
      }}
    >
      {isFavorite ? <FaHeart color="#ff4757" /> : <FaRegHeart />}
    </button>
  );
};
export default WishlistButton;