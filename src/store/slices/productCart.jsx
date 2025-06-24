import {createSlice} from '@reduxjs/toolkit';

const ProductCartSlice = createSlice ({
    name:"productCart",
    initialState:{
        products:[]
    },
    reducers:{
        addProductToCart: (state,action) => {
           const product = state.products.find(p => p.id === action.payload.id);
           if (product) {
            product.quantity+=1
           }
           else {
            state.products.push({...action.payload})
           }
           console.log(state.products)
        },
        decreaseProduct: (state, action) => {
            const productIndex = state.products.findIndex(p => p.id === action.payload);
            
            if (productIndex !== -1) {
              const product = state.products[productIndex];
              
              if (product.quantity > 1) {
                
                product.quantity -= 1;
              } else {
               
                state.products.splice(productIndex, 1);
              }
            }
          },
          removeProduct: (state, action) => {
            const productIndex = state.products.findIndex(p => p.id === action.payload) 
            state.products.splice(productIndex, 1);
            
          },
          increaseProduct: (state, action) => {
            const product = state.products.find(p => p.id === action.payload);
            
            product.quantity += 1;
            
          }
          
    }
})

export const {addProductToCart, removeProduct, decreaseProduct,increaseProduct} = ProductCartSlice.actions;
export default ProductCartSlice.reducer;