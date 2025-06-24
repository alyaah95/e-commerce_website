import { FaShoppingCart, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import "./navbar.css";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useContext } from "react";
import LanguageContext from "../context/context";
import { Dropdown, DropdownButton } from 'react-bootstrap';


const Navbar = () => {
  const counterVal = useSelector((state) => state.counter.counterValue);
  const { language, setLanguage } = useContext(LanguageContext);
  const handleSelect= (eventKey)=>{
    setLanguage(eventKey)
  }
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={"/"}>
            <span className="navbar-logo">Product App</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <div className="navbar-auth">
            <Link to={"/register"} className="navbar-link">
              <FaUserPlus className="link-icon" />
              <span>Register</span>
            </Link>

            <a href="/login" className="navbar-link">
              <FaSignInAlt className="link-icon" />
              <span>Login</span>
            </a>
          </div>

          <div className="navbar-cart">
            <Link to={"/shopping-cart"} style={{ textDecoration: "none" }}>
              <FaShoppingCart className="cart-icon" />
            </Link>
            <span className="cart-count">{counterVal}</span>
          </div>
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
