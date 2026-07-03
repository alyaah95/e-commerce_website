

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';
import axiosInstance from '../../apis/config';

// ─── THUNKS ───────────────────────────────────────────────────────────────────

export const fetchCartItems = createAsyncThunk(
  'productCart/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const cartResponse = await api.get('/cart');
      const cartItems = cartResponse.data;

      if (cartItems.length === 0) return [];

      const detailedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productDetailsResponse = await axiosInstance.get(
              `/products/${item.product_id}`
            );
            const productDetails = productDetailsResponse.data;
            return { ...item, stock: productDetails.stock };
          } catch {
            return { ...item, stock: 0 };
          }
        })
      );

      return detailedCartItems;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart items'
      );
    }
  }
);

export const addProductToCartBackend = createAsyncThunk(
  'productCart/addProductToCartBackend',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add', {
        productId: productData.id,
        title: productData.title,
        imageUrl: productData.image,
        price: productData.price,
        quantity: productData.quantity,
      });
      // Pass stock through so the reducer can store it correctly
      return { ...response.data, stock: productData.stock };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add product'
      );
    }
  }
);

export const updateProductQuantityBackend = createAsyncThunk(
  'productCart/updateProductQuantityBackend',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cart quantity'
      );
    }
  }
);

export const removeProductFromCartBackend = createAsyncThunk(
  'productCart/removeProductFromCartBackend',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove product from cart'
      );
    }
  }
);

export const placeOrderThunk = createAsyncThunk(
  'productCart/placeOrder',
  async (orderDetails, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/cart/place-order', orderDetails);

      if (orderDetails.isSingleProduct && orderDetails.items?.length === 1) {
        dispatch(removeProductLocal(orderDetails.items[0].productId));
      } else {
        dispatch(resetCart());
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to place order'
      );
    }
  }
);

// ─── HELPER ───────────────────────────────────────────────────────────────────

// FIX 1: stock is now a real second argument, not silently ignored
const mapItemToProduct = (item, stock) => ({
  // FIX 3: store ids as Numbers everywhere so comparisons never fail
  id: Number(item.product_id),
  title: item.title,
  image: item.image_url,
  quantity: item.quantity,
  price: parseFloat(item.price),
  stock: stock !== undefined ? stock : (item.stock ?? 0),
});

// ─── SLICE ────────────────────────────────────────────────────────────────────

const ProductCartSlice = createSlice({
  name: 'productCart',
  initialState: {
    products: [],
    loading: 'idle',
    error: null,
  },
  reducers: {
    addProductToCartLocal: (state, action) => {
      const newItem = action.payload;
      const id = Number(newItem.product_id);
      const product = state.products.find((p) => p.id === id);
      if (product) {
        product.quantity = newItem.quantity;
      } else {
        state.products.push(mapItemToProduct(newItem));
      }
    },

    updateProductQuantityLocal: (state, action) => {
      const updatedItem = action.payload;
      const id = Number(updatedItem.product_id);
      const product = state.products.find((p) => p.id === id);
      if (product) {
        product.quantity = updatedItem.quantity;
      }
    },

    removeProductLocal: (state, action) => {
      // FIX 3: compare as Numbers
      const id = Number(action.payload);
      state.products = state.products.filter((p) => p.id !== id);
    },

    setCartItems: (state, action) => {
      state.products = action.payload.map((item) => mapItemToProduct(item));
    },

    resetCart: (state) => {
      state.products = [];
      state.loading = 'idle';
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchCartItems — full server sync on page load
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        console.log("=== FETCH CART SUCCESS ===", action.payload);
        // FIX 1: stock comes from the enriched payload, passed as second arg
        state.products = action.payload.map((item) =>
          mapItemToProduct(item, item.stock)
        );
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })

      // addProductToCartBackend — optimistic local update from server response
      .addCase(addProductToCartBackend.pending, (state) => {
        state.error = null;
      })
      .addCase(addProductToCartBackend.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        console.log("=== ADD PRODUCT SUCCESS ===", action.payload);
        const newItem = action.payload.item;
        const stock = action.payload.stock; // FIX 1: real stock value preserved
        // FIX 3: compare as Numbers
        const id = Number(newItem.product_id);
        const existingProduct = state.products.find((p) => p.id === id);
        if (existingProduct) {
          existingProduct.quantity = newItem.quantity;
          existingProduct.stock = stock;
        } else {
          // FIX 1: pass stock as second argument so it is never dropped
          state.products.push(mapItemToProduct(newItem, stock));
        }
      })
      .addCase(addProductToCartBackend.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })

      // updateProductQuantityBackend — patch quantity in Redux from DB response
      .addCase(updateProductQuantityBackend.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProductQuantityBackend.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const updatedItem = action.payload.item;
        // FIX 3: compare as Numbers
        const id = Number(updatedItem.product_id);
        const product = state.products.find((p) => p.id === id);
        if (product) {
          product.quantity = updatedItem.quantity;
        }
      })
      .addCase(updateProductQuantityBackend.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })

      // removeProductFromCartBackend
      .addCase(removeProductFromCartBackend.pending, (state) => {
        state.error = null;
      })
      .addCase(removeProductFromCartBackend.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // FIX 3: compare as Numbers
        const id = Number(action.payload);
        state.products = state.products.filter((p) => p.id !== id);
      })
      .addCase(removeProductFromCartBackend.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })

      // placeOrderThunk
      .addCase(placeOrderThunk.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.error = null;
        // cart cleared by resetCart / removeProductLocal dispatched inside thunk
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  addProductToCartLocal,
  removeProductLocal,
  updateProductQuantityLocal,
  setCartItems,
  resetCart,
} = ProductCartSlice.actions;

export default ProductCartSlice.reducer;