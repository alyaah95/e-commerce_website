

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resetCart } from './productCart';
import { clearAuthToken } from '../../apis/axiosConfig'; 
import api from '../../apis/axiosConfig';

const initialState = {
  token: localStorage.getItem('token') || null, 
  isAuthenticated: !!localStorage.getItem('token'), 
  loading: false,
  error: null,
  user: null,
};

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // 1. تنظيف التوثيق (Local Storage + Axios Header)
            clearAuthToken(); 
            
            // 2. تحديث حالة الـ Auth Slice (Reducer متزامن)
            dispatch(logout()); // هذا هو الـ Reducer الذي قمتِ بتعريفه في هذا الـ Slice
            
            // 3. تنظيف حالة Slices الأخرى
            // يجب استدعاء Action resetCart من ملف productCartSlice.js
            dispatch(resetCart()); 
            
            return true;
        } catch (error) {
            // ... منطق التعامل مع الأخطاء (إذا كان هناك مكالمة API لتسجيل الخروج)
            clearAuthToken();
            dispatch(logout());
            dispatch(resetCart());
            return rejectWithValue('Logout failed on backend, but logged out locally.');
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            // يستخدم api.get المسار المحمي، والتوكن يضاف تلقائياً بواسطة Interceptor
            const response = await api.get('/users/profile'); 
            return response.data.user; // إرجاع بيانات المستخدم
        } catch (error) {
            console.error("[Thunk] fetchUserProfile error:", error.response?.data?.message || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile.');
        }
    }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
      try {
          // userData تحتوي على { username, email }
          const response = await api.put('/users/profile', userData); 
          
          // نُعيد البيانات المُحدَّثة لاستخدامها في الـ Reducer
          return response.data.user; 
      } catch (error) {
          console.error("[Thunk] updateUserProfile error:", error.response?.data?.message || error.message);
          return rejectWithValue(error.response?.data?.message || 'Failed to update user profile.');
      }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
      try {
          // passwords = { currentPassword, newPassword }
          await api.put('/users/change-password', passwords); 
          return 'Password changed successfully.'; 
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || 'Failed to change password.');
      }
  }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', { email }); 
            return response.data.message; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to request reset.');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (credentials, { rejectWithValue }) => {
        // credentials = { email, token, newPassword }
        try {
            const response = await api.post('/auth/reset-password', credentials);
            return response.data.message; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password.');
        }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
   
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token); 
    },
    
    loginFail: (state, action) => {
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
      localStorage.removeItem('token');
    },
   
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.user = null;
      localStorage.removeItem('token'); // ينظف الـ localStorage هنا
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      // ----------------------------------------------------
      // حالات جلب بيانات البروفايل
      // ----------------------------------------------------
      .addCase(fetchUserProfile.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload; // ✅ حفظ بيانات البروفايل
          state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.user = null;
      })

      .addCase(updateUserProfile.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload; // 🛑 تحديث بيانات المستخدم في الـ Store
          state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })

      .addCase(changePassword.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.error = null; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
        
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state, action) => { state.loading = false; state.error = null; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
    
});




export const { loginSuccess, loginFail, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;