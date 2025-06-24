import EmptyCart from '../components/emptyCart'
import Cart from '../components/cart'
import {useSelector} from 'react-redux'
const ShoppingCart = () => {
    const products = useSelector((state) => state.productCart.products) 
    return (
        <>
        {products.length === 0 ? <EmptyCart/> : <Cart/>}
        
        </>
    )
}
export default ShoppingCart;