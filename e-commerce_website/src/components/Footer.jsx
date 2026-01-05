import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt} from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          {/* القسم الأول: اسم البراند */}
          <div className="footer-col">
            <h4 className="footer-logo">MyCart Bliss</h4>
            <p>Your one-stop shop for all your needs. Quality and speed guaranteed.</p>
          </div>

          {/* القسم الثاني: روابط سريعة */}
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/shopping-cart">Cart</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>

          {/* القسم الثالث: التواصل معنا (Contact Us) الجديد */}
          <div className="footer-col">
            <h5>Contact Us</h5>
            <ul className="contact-info">
              <li>
                <FaPhoneAlt className="contact-icon" /> 
                <span> +20 123 456 789</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" /> 
                <span> support@mycartbliss.com</span>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" /> 
                <span> Alexandria, Egypt</span>
              </li>
            </ul>
          </div>

          {/* القسم الثالث: السوشيال ميديا */}
          <div className="footer-col">
            <h5>Follow Us</h5>
            <div className="social-links">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedin /></a>
            </div>
          </div>
        </div>
        
        <hr className="footer-divider" />
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MyCart Bliss. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;