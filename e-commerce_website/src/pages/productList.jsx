import { useState, useEffect } from "react";
import ProductCard from "../components/productCard";
import axiosInstance from '../apis/config';
import api from '../apis/axiosConfig';
import { useSelector } from 'react-redux'; 
import { Link } from "react-router"; 
import "./ProductList.css";

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; 
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(1000);

  useEffect(() => {
    axiosInstance.get("/products")
      .then((res) => setAllProducts(res.data.products))
      .catch((err) => console.log(err));
  }, []);

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesPrice = product.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange]);

  return (
    <div className="container py-5 product-list-wrapper">

      {/* ── Page Header ── */}
      <div className="text-center mb-5">
        <h2 className="store-heading fw-bold">Our Store</h2>
        <p className="store-subheading text-muted">
          Discover hand-picked products curated just for you
        </p>
      </div>

      {/* ── Guest Banner ── */}
      {!isAuthenticated && (
        <div className="guest-banner shadow mb-5 p-4 rounded-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold mb-1">🔒 Unlock the Full Experience</h5>
            <p className="mb-0 text-muted small">
              Register or log in to manage your cart, track orders, and enjoy exclusive deals.
            </p>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <Link to="/register" className="btn btn-primary btn-sm px-4 banner-btn">
              Register
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-sm px-4 banner-btn">
              Login
            </Link>
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="filter-bar shadow-sm rounded-4 p-4 mb-5">
        <div className="row g-3 align-items-end">

          {/* Search */}
          <div className="col-12 col-md-4">
            <label className="filter-label mb-1">Search</label>
            <div className="input-group filter-input-group">
              <span className="input-group-text filter-input-icon">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                </svg>
              </span>
              <input
                type="text"
                className="form-control filter-input"
                placeholder="Search products..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="col-12 col-md-4">
            <label className="filter-label mb-1">Category</label>
            <select
              className="form-select filter-input"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {[...new Set(allProducts.map(p => p.category))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="col-12 col-md-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="filter-label">Max Price</label>
              <span className="price-badge">${priceRange}</span>
            </div>
            <input
              type="range"
              className="form-range filter-range"
              min="0" max="2000" step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">$0</small>
              <small className="text-muted">$2000</small>
            </div>
          </div>

        </div>

        {/* Result count pill */}
        <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
          <span className="result-count-badge">{filteredProducts.length}</span>
          <span className="text-muted small">products found</span>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard data={product} />
            </div>
          ))
        ) : (
          <div className="col-12 d-flex justify-content-center align-items-center w-100">
            <div className="empty-state-container w-100">
              <div className="empty-state shadow-sm"> {/* أضفت shadow-sm لمظهر أفضل */}
                <div className="empty-state-icon">🔍</div>
                <h5 className="fw-semibold mb-1 mt-3">No products found</h5>
                <p className="text-muted small mb-0">Try adjusting your search or filters</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-5 d-flex justify-content-center align-items-center gap-3">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(p - 1, 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="btn btn-outline-primary pagination-btn"
          >
            ← Prev
          </button>

          <span className="pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => {
              setCurrentPage(p => Math.min(p + 1, totalPages));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;