import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router'; 
import Navbar from './components/navbar';
import Footer from './components/Footer';
import LanguageContext from './context/context';
import { useState, lazy, Suspense, useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { fetchCartItems } from './store/slices/productCart'; 
import { reset,setCounterValue } from './store/slices/counter'; 
import { loginSuccess } from './store/slices/authSlice'; 
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';




const ProductList = lazy(() => import('./pages/productList'));
const ProductDetails = lazy(() => import('./pages/productDetails'));
const NotFound = lazy(() => import('./pages/notFound'));
const ShoppingCart = lazy(() => import('./pages/shoppingCart'));
const Register = lazy(() => import('./pages/register'));
const Login = lazy(() => import('./pages/login'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const WishListPage = lazy(() => import('./pages/WishListPage'));

function App() {
  const [language, setLanguage] = useState("English");
  const dispatch = useDispatch();
  const productsInCart = useSelector((state) => state.productCart.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); 


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {

      dispatch(loginSuccess({ token })); 
 
      console.log('App.jsx: Dispatching fetchCartItems on initial load for authenticated user.');
      dispatch(fetchCartItems());
    } 
  }, [dispatch]); 

  
  
  return (
    <>
      <LanguageContext.Provider value={{ language, setLanguage }}>
          
        <div dir={language === 'English' ? 'ltr' : 'rtl'} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> 
          <Navbar />
          <Suspense fallback={<h2>Loading...</h2>}>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/product-details/:id" element={<ProductDetails />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={isAuthenticated ? <Profile /> : <Login />} />
              <Route path="/wishlist" element={isAuthenticated ? <WishListPage /> : <Login />} />
              
              
              <Route
                path="/shopping-cart"
                element={isAuthenticated ? <ShoppingCart /> : <Login />}
              />

              <Route path="/orders" element={isAuthenticated ? <OrderTrackingPage /> : <Login />} />

              <Route
                path="/checkout"
                element={isAuthenticated ? <CheckoutPage /> : <Login />}
              />
              
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </LanguageContext.Provider>
    </>
  );
}

export default App;