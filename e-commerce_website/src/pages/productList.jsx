import { useState, useEffect } from "react";
import ProductCard from "../components/productCard";
import axiosInstance from '../apis/config';
import api from '../apis/axiosConfig';
import { useSelector } from 'react-redux'; 
import { Link } from "react-router"; 


const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; 
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(1000); // أقصى سعر مثلاً

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
    <div className="container py-4">
      <h3 className="mb-4 text-center">Welcome to our amazing store!</h3>
      {!isAuthenticated && ( // 🚀 إضافة شرط عرض الرسالة لو المستخدم غير مسجل دخول
        <div className="alert alert-info text-center" role="alert">
          <h4 className="alert-heading">Unlock a World of Shopping!</h4>
          <p>
            Dive into exclusive deals, manage your cart effortlessly, and enjoy a seamless checkout experience.
            **Register** or **Login** now to make the most of your visit!
          </p>
          <hr />
          <p className="mb-0">
            It only takes a moment to join our community. Your next favorite product is just a click away!
          </p>
          <div className="mt-3">
            <Link to="/register" className="btn btn-success me-2">Register Now</Link>
            <Link to="/login" className="btn btn-outline-primary">Login Here</Link>
          </div>
        </div>
      )}

      {/* قسم البحث والفلترة */}
      <div className="row mb-4 g-3 bg-light p-3 rounded shadow-sm">
        <div className="col-md-4">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search products..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {[...new Set(allProducts.map(p => p.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Max Price: ${priceRange}</label>
          <input 
            type="range" className="form-range" 
            min="0" max="2000" step="50"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
        </div>
      </div>
      
     
      {/* عرض المنتجات المفلترة والمقسمة */}
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard data={product}/>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <h4>No products found! 🔍</h4>
          </div>
        )}
      </div>

      
      {/* أزرار الترقيم (تظهر فقط إذا كان هناك أكثر من صفحة) */}
      {totalPages > 1 && (
        <div className="mt-5 d-flex justify-content-center gap-2">
          <button 
            onClick={() => {
              setCurrentPage(p => Math.max(p - 1, 1))
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 bg-primary text-white rounded-pill">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() =>{ 
              setCurrentPage(p => Math.min(p + 1, totalPages))
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } }
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;