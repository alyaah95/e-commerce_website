import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
// import ProductList from './pages/productList'
import { BrowserRouter, Route, Routes } from "react-router";
// import ProductDetails from './pages/productDetails';
import Navbar from './components/navbar';
// import NotFound from './pages/notFound';
// import ShoppingCart from './pages/shoppingCart';
// import Register from './pages/register';
import LanguageContext from './context/context'
import{useState, lazy, Suspense} from 'react'

const ProductList = lazy(() => import("./pages/productList"))
const ProductDetails = lazy(() => import("./pages/productDetails"))
const NotFound = lazy(() => import("./pages/notFound"))
const ShoppingCart = lazy(() => import("./pages/shoppingCart"))
const Register = lazy(() => import("./pages/register"))




function App() {
 
  const [language, setLanguage] = useState("English")

  return (
    <>
    <LanguageContext.Provider value={{language, setLanguage}}>
    <BrowserRouter>
    <div dir={language === 'English'? 'English' : 'Arabic'}>
    <Navbar/>
    <Suspense fallback={<h2>Loading...</h2>}>
    <Routes>
      <Route path="/" element={<ProductList/>}/>
      <Route path="/product-details/:id" element={<ProductDetails/>}/>
      <Route path="*" element={<NotFound/>}></Route>
      <Route path="/shopping-cart" element={<ShoppingCart/>}></Route>
      <Route path="/register" element={<Register/>}></Route>
    </Routes>
    </Suspense>
    </div>
    </BrowserRouter>
    </LanguageContext.Provider>
    </>
  )
}

export default App
