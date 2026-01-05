import { FaShoppingCart, FaUserPlus, FaSignInAlt, FaUserCircle, FaSignOutAlt} from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import { FaHeart } from 'react-icons/fa';
import "./navbar.css";
import { useSelector , useDispatch} from "react-redux";
import { Link , useNavigate} from "react-router";
import { useContext } from "react";
import LanguageContext from "../context/context";
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { logoutUser } from '../store/slices/authSlice';
// import { reset as resetCounter } from '../store/slices/counter'; 


const Navbar = () => {
  // const counterVal = useSelector((state) => state.counter.counterValue);
  const products = useSelector((state) => state.productCart.products);
  const totalItems = products.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = useSelector(state => state.wishlist.items.length);
  const { language, setLanguage } = useContext(LanguageContext);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const iconStyle = { 
    fontSize: '1.5em', 
    verticalAlign: 'middle',
    marginLeft: '10px',
    marginRight: '5px' 
  };
  const handleSelect= (eventKey)=>{
    setLanguage(eventKey)
  }
  const navigate = useNavigate()

  const handleLogout = async () => {
   
    await dispatch(logoutUser());
    dispatch(resetCounter()); 
    
    
    navigate('/login'); 


  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={"/"}>
            <span className="navbar-logo">MyCart Bliss</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <div className="navbar-auth">
          {isAuthenticated ? (
              <>
                {/* 1. ✅ رابط صفحة البروفايل */}
                <li className="nav-item profile-link" style={{ listStyle: 'none' }}>
                    <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaUserCircle style={iconStyle} />
                        <span>{user?.username}</span>
                    </Link>
                </li>
                
                {/* 2. ✅ زر تسجيل الخروج */}
                <li className="nav-item" style={{ listStyle: 'none' }}>
                    <button
                        className="nav-link btn btn-link" 
                        onClick={handleLogout}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }} 
                    >
                        <FaSignOutAlt style={{...iconStyle, marginLeft: '0'}} /> {/* أيقونة تسجيل الخروج */}
                        Logout
                    </button>
                </li>
              </>
            ) : (
             
              <>
                <li className="nav-item">
                    <Link className="nav-link" to="/login" style={{ display: 'flex', alignItems: 'center' }}>
                        <FaSignInAlt style={iconStyle} /> 
                        Login
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/register" style={{ display: 'flex', alignItems: 'center' }}>
                        <FaUserPlus style={iconStyle} />
                        Register
                    </Link>
                </li>
              </>
            )}
          </div>

          <div className="navbar-cart">
            <Link to={"/shopping-cart"} style={{ textDecoration: "none" }}>
              <FaShoppingCart className="cart-icon" />
            </Link>
            <span className="cart-count">{totalItems}</span>
          </div>
          <div className="navbar-wishlist">
            <Link to="/wishlist" className="nav-link position-relative" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaHeart style={{ color: '#ff4757', fontSize: '1.2rem' }} />
              {/* <span className="d-none d-md-inline">Wishlist</span> */}
              
              {wishlistCount > 0 && (
                  <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-10px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                  }}>
                      {wishlistCount}
                  </span>
              )}
          </Link>
          </div>
          <Link to="/orders" className="orders-pill-btn">
              <BsBoxSeamFill size={18} className="order-icon" />
              <span className="order-text">Orders</span>
          </Link>
          <div>
            <DropdownButton id="dropdown-basic-button" title={language || "language"} variant="secondary" size="sm" onSelect={handleSelect}>
              <Dropdown.Item eventKey="English">English</Dropdown.Item>
              <Dropdown.Item eventKey="Arabic">Arabic</Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
