import {configureStore} from '@reduxjs/toolkit';
import ProductCartReducer from './slices/productCart'
import authReducer from './slices/authSlice'; 
import orderReducer from './slices/orderSlice';
import wishlistReducer from './slices/wishlistSlice';
const store = configureStore({
    reducer: {
        productCart: ProductCartReducer,
        auth: authReducer, 
        order:orderReducer,
        wishlist: wishlistReducer
    }
})

export default store;