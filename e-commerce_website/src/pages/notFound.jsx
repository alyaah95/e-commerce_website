import { Link } from "react-router";
import "./notFound.css";
const NotFound = () => {
  return (
    <div className="error-container">
      <div className="lottie-animation"></div>
      <div className="error-content">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
        <button className="btn btn-primary">Go to Product App</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
