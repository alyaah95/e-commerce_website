import {configureStore} from '@reduxjs/toolkit';
import counterReducer from './slices/counter'
import ProductCartReducer from './slices/productCart'

const store = configureStore({
    reducer: {
        counter: counterReducer,
        productCart: ProductCartReducer
    }
})

export default store;