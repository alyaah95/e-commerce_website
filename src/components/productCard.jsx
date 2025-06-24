import { Link, useNavigate } from "react-router";
import {useDispatch, useSelector} from 'react-redux';
import {addProductToCart} from '../store/slices/productCart'
import {increment} from '../store/slices/counter'
const ProductCard = (props) => {
  const { data } = props;
  console.log(data);

  
  const productsFromStore = useSelector((state) => state.productCart.products)
  const productFromStore = productsFromStore.find((p) => p.id === data?.id)
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    const currentQuantity = productFromStore?.quantity || 0;
    if (currentQuantity < data.stock){
      dispatch(increment())
      dispatch(addProductToCart(
        {
            id:data.id,
            title:data.title,
            image:data.images[0],
            quantity:currentQuantity + 1,
            price:data.price,
            stock:data.stock
        }
      ))
    }
    
  }
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="position-relative">
        {data.stock <= 0 ? ( 
          <span className="badge bg-danger">out of stock</span>
        ) : (
          <span className="badge bg-success">in stock</span>
        )}
        <Link to={`/product-details/${data.id}`}>
        <img
          src={data.images[0]}
          className="card-img-top p-3"
          style={{ objectFit: "contain", height: "200px" }}
        />
        </Link>
        
      </div>
      <div className="card-body">
        <h5 className="card-title" style={{ whiteSpace: "normal" }}>
          {data.title}
        </h5>
        <p className="card-text text-muted">{data.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">{data.price}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAddToCart} >Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
