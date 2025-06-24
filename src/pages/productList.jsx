import { useState, useEffect } from "react";
import ProductCard from "../components/productCard";
import axiosInstance from '../apis/config';


const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // Show 10 products per page

  useEffect(() => {
    axiosInstance.get("/products")
      .then((res) => setAllProducts(res.data.products))
      .catch((err) => console.log(err));
  }, []);

  // Calculate current products to display
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  
  
  return (
    <div className="container py-4">
      <h3 className="mb-4">Welcome to our website</h3>
      
      {/* Products Grid */}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {currentProducts.map((product) => (
          <div className="col" key={product.id}>
            <ProductCard data={product}/>
          </div>
        ))}
      </div>

      {/* Super Simple Pagination */}
      <div className="mt-4 d-flex justify-content-center gap-2">
        <button 
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-primary"
        >
          Previous
        </button>
        
        <span className="px-3 align-self-center">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;