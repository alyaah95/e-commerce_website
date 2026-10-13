

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
            clearAuthToken(); 
            
            dispatch(logout()); 
            

            dispatch(resetCart()); 
            
            return true;
        } catch (error) {
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
            const response = await api.get('/users/profile'); 
            return response.data.user;
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
          const response = await api.put('/users/profile', userData); 
          
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
      localStorage.removeItem('token'); 
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

      .addCase(fetchUserProfile.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload; 
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
          state.user = action.payload; 
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