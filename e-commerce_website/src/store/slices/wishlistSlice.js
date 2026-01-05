import { createSlice } from '@reduxjs/toolkit';

// جلب البيانات المخزنة مسبقاً من المتصفح
const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: savedWishlist },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item.id === product.id);
      
      if (index >= 0) {
        state.items.splice(index, 1); // حذف إذا كان موجوداً
      } else {
        state.items.push(product); // إضافة إذا لم يكن موجوداً
      }
      // حفظ في الـ Local Storage
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;