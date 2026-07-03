import './emptyCart.css';
import { Link } from 'react-router';

const EmptyCart = () => {
    return (
        <div className="ec-page">
            <div className="ec-container">
                <div className="ec-card">
                    {/* The image and its colours are kept exactly as requested */}
                    <img
                        src="https://i.imgur.com/dCdflKN.png"
                        width="130"
                        height="130"
                        className="ec-img"
                        alt="Empty cart"
                    />
                    <h3 className="ec-title">Your Cart is Empty</h3>
                    <p className="ec-subtitle">Add something to make me happy :)</p>
                    <Link to="/">
                        <button className="ec-btn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmptyCart;