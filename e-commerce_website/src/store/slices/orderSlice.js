import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

export const fetchAllOrders = createAsyncThunk(
    'productCart/fetchAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/orders'); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders list.');
        }
    }
);

export const fetchOrderDetails = createAsyncThunk(
    'productCart/fetchOrderDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/orders/${orderId}`); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details.');
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        loading: 'idle', 
        error: null,
        ordersList: [], 
        currentOrderDetails: null,
        productDetailsCache: {}
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.ordersList = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = 'pending';
                state.currentOrderDetails = null;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentOrderDetails = action.payload; 
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            });
    },
});

export default orderSlice.reducer;