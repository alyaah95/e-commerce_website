

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 
import axiosInstance from '../../apis/config';




// const DUMMY_JSON_PRODUCTS_API_BASE_URL = 'https://dummyjson.com/products';


export const fetchCartItems = createAsyncThunk(
    'productCart/fetchCartItems',
    async (_, { rejectWithValue }) => {
        console.log("[Thunk] fetchCartItems: محاولة جلب عناصر السلة."); 
        try {
            const cartResponse = await api.get('/cart');
            const cartItems = cartResponse.data;
            console.log(cartResponse)
            console.log("[Thunk] fetchCartItems: تم جلب عناصر السلة الخام بنجاح. البيانات:", cartItems); 
      
            if (cartItems.length === 0) return [];
           
            const detailedCartItems = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        // 1. ✅ استخدام axiosInstance.get بشكل صحيح
                        const productDetailsResponse = await axiosInstance.get(`/products/${item.product_id}`);
                        
                        // 2. ❌ إزالة التحقق الخاطئ .ok (Axios لا يستخدمها)
                        // if (!productDetailsResponse.ok) { ... } 
                        
                        // 3. ✅ استخراج البيانات مباشرة من .data (Axios لا يستخدم .json())
                        const productDetails = productDetailsResponse.data; 
                        
                        console.log(`[Thunk] fetchCartItems: تم جلب التفاصيل للمنتج ${item.product_id}. المخزون: ${productDetails.stock}`); // LOG

                        return {
                            ...item, 
                            stock: productDetails.stock, 
                        };
                    } catch (productError) {
                        console.warn(`[تحذير Thunk] fetchCartItems: تعذر جلب التفاصيل للمنتج ${item.product_id}:`, productError); 
                        return { ...item, stock: 0 }; 
                    }
                })
            );

            console.log("[Thunk] fetchCartItems: تم جلب عناصر السلة التفصيلية بنجاح. البيانات:", detailedCartItems); 
            return detailedCartItems; 
        } catch (error) {
            console.error("[خطأ Thunk] fetchCartItems:", error.response?.data?.message || error.message); 
            return rejectWithValue(error.response.data.message || 'فشل جلب عناصر السلة');
        }
    }
);


export const addProductToCartBackend = createAsyncThunk(
    'productCart/addProductToCartBackend',
    async (productData, { dispatch, rejectWithValue }) => {
        console.log("[Thunk] addProductToCartBackend: محاولة إضافة المنتج.", productData); 
        try {
            const response = await api.post('/cart/add', {
                productId: productData.id,
                title: productData.title,
                imageUrl: productData.image,
                price: productData.price,
                quantity: productData.quantity,
            });
            
            console.log("[Thunk] addProductToCartBackend: تم إضافة المنتج بنجاح. إرسال تحديث محلي.", response.data.item); 
            // dispatch(fetchCartItems()); 
            return response.data;
        } catch (error) {
            console.error("[خطأ Thunk] addProductToCartBackend:", error.response?.data?.message || error.message); 
            return rejectWithValue(error.response.data.message || 'فشل إضافة المنتج إلى السلة');
        }
    }
);


export const updateProductQuantityBackend = createAsyncThunk(
    'productCart/updateProductQuantityBackend',
    async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
        console.log(`[Thunk] updateProductQuantityBackend: محاولة تحديث المنتج ${productId} إلى كمية ${quantity}`); 
        try {
            const response = await api.put(`/cart/update/${productId}`, { quantity });
            console.log(`[Thunk] updateProductQuantityBackend: نجاح للمنتج ${productId}. إرسال تحديث محلي.`, response.data.item); 
            // dispatch(fetchCartItems()); 
            return response.data;
        } catch (error) {
            console.error(`[خطأ Thunk] updateProductQuantityBackend للمنتج ${productId}:`, error.response?.data?.message || error.message); // LOG
            return rejectWithValue(error.response.data.message || 'فشل تحديث كمية المنتج');
        }
    }
);


export const removeProductFromCartBackend = createAsyncThunk(
    'productCart/removeProductFromCartBackend',
    async (productId, { dispatch, rejectWithValue }) => {
        console.log(`[Thunk] removeProductFromCartBackend: محاولة إزالة المنتج ${productId}`); 
        try {
            await api.delete(`/cart/remove/${productId}`);
            console.log(`[Thunk] removeProductFromCartBackend: تم إزالة المنتج ${productId} بنجاح. إرسال تحديث محلي.`); 
            // dispatch(fetchCartItems()); 
            return productId;
        } catch (error) {
            console.error(`[خطأ Thunk] removeProductFromCartBackend للمنتج ${productId}:`, error.response?.data?.message || error.message); // LOG
            return rejectWithValue(error.response.data.message || 'فشل إزالة المنتج من السلة');
        }
    }
);

const mapItemToProduct = (item) => ({
    id: item.product_id,
    title: item.title,
    image: item.image_url,
    quantity: item.quantity,
    price: parseFloat(item.price),
    stock: item.stock || 20, // قيمة افتراضية
});

export const placeOrderThunk = createAsyncThunk(
    'productCart/placeOrder',
    async (orderDetails, { rejectWithValue, dispatch }) => {
        console.log("[Thunk] placeOrder: محاولة وضع طلب جديد.", orderDetails); 
        try {
            // orderDetails = { shippingAddress, totalAmount }
            // يجب أن يكون لديك مسار API مُعد لاستقبال هذا الطلب، مثل: /api/orders/place-order
            const response = await api.post('/cart/place-order', orderDetails);
            
            // ✅ مسح عداد السلة بالكامل في Redux
            // بما أن الـ Backend سيمسح cart_items، سنمسح الـ Redux state هنا
            if (orderDetails.isSingleProduct && orderDetails.items.length === 1) {
                // إذا كان طلب منتج واحد، فقط أزل ذلك المنتج
                const productIdToRemove = orderDetails.items[0].productId;
                dispatch(removeProductLocal(productIdToRemove));
            } else {
                // إذا كان طلب كامل السلة، امسح السلة بالكامل في Redux
                dispatch(resetCart());
            }
            return response.data; // يحتوي على { orderId, trackingNumber, message }
        } catch (error) {
            console.error("[خطأ Thunk] placeOrder:", error.response?.data?.message || error.message); 
            return rejectWithValue(error.response?.data?.message || 'فشل إتمام الطلب');
        }
    }
);






const ProductCartSlice = createSlice({
    name: "productCart",
    initialState: {
        products: [],
        loading: 'idle', 
        error: null,
        productDetailsCache: {}
    },
    reducers: {
        
        addProductToCartLocal: (state, action) => {
            console.log(`[Reducer] addProductToCartLocal: تحديث الحالة. معرف المنتج: ${action.payload.product_id}, الكمية: ${action.payload.quantity}`); // LOG
            const newItem = action.payload;
            const product = state.products.find(p => p.id === newItem.product_id);

            if (product) {
                product.quantity = newItem.quantity;
            } else {
                state.products.push({
                    id: newItem.product_id,
                    title: newItem.title,
                    image: newItem.image_url,
                    quantity: newItem.quantity,
                    price: parseFloat(newItem.price),
                    stock: 0, 
                });
            }
        },
        updateProductQuantityLocal: (state, action) => {
            console.log(`[Reducer] updateProductQuantityLocal: تحديث الحالة. معرف المنتج: ${action.payload.product_id}, الكمية الجديدة: ${action.payload.quantity}`); // LOG
            const updatedItem = action.payload;
            const product = state.products.find(p => p.id === updatedItem.product_id);
            if (product) {
                product.quantity = updatedItem.quantity;
            }
        },
        removeProductLocal: (state, action) => {
            console.log(`[Reducer] removeProductLocal: إزالة المنتج من الحالة. معرف المنتج: ${action.payload}`); 
            state.products = state.products.filter(p => p.id !== action.payload);
        },
       
        setCartItems: (state, action) => {
            console.log(`[Reducer] setCartItems: تعيين حالة السلة بالكامل. طول البيانات: ${action.payload.length}`); 
            state.products = action.payload.map(item => ({
                id: item.product_id,
                title: item.title,
                image: item.image_url,
                quantity: item.quantity,
                price: parseFloat(item.price),
                stock: item.stock || 0, 
            }));
        },

        resetCart: (state) => { 
            console.log("[Reducer] resetCart: تم مسح قائمة المنتجات في Redux.");
            state.products = [];
            state.loading = 'idle';
            state.error = null;
            state.productDetailsCache = {}; 
        }
    },
   
    extraReducers: (builder) => {
        builder
          
            .addCase(fetchCartItems.pending, (state) => {
                console.log("[ExtraReducer] fetchCartItems.pending"); 
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                console.log("[ExtraReducer] fetchCartItems.fulfilled. طول البيانات:", action.payload.length); 
                state.loading = 'succeeded';
          
                state.products = action.payload.map(mapItemToProduct);
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                console.log("[ExtraReducer] fetchCartItems.rejected. الخطأ:", action.payload); 
                state.loading = 'failed';
                state.error = action.payload;
            })
           
            .addCase(addProductToCartBackend.pending, (state) => {
                console.log("[ExtraReducer] addProductToCartBackend.pending"); 
                // state.loading = 'pending';
                state.error = null;
            })
            .addCase(addProductToCartBackend.fulfilled, (state, action) => {
                console.log("[ExtraReducer] addProductToCartBackend.fulfilled (سيؤدي إلى تشغيل fetchCartItems)");
                state.loading = 'succeeded';
                const newItem = action.payload.item;
                const existingProduct = state.products.find(p => p.id === newItem.product_id);
                if (existingProduct) {
                    existingProduct.quantity = newItem.quantity;
                } else {
                    state.products.push(mapItemToProduct(newItem));
                }
            })
            .addCase(addProductToCartBackend.rejected, (state, action) => {
                console.log("[ExtraReducer] addProductToCartBackend.rejected. الخطأ:", action.payload); 
                state.loading = 'failed';
                state.error = action.payload;
            })
            .addCase(updateProductQuantityBackend.pending, (state) => {
                console.log("[ExtraReducer] updateProductQuantityBackend.pending"); 
                // state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateProductQuantityBackend.fulfilled, (state, action) => {
                console.log("[ExtraReducer] updateProductQuantityBackend.fulfilled (سيؤدي إلى تشغيل fetchCartItems)"); 
                state.loading = 'succeeded';
                const updatedItem = action.payload.item;
                const product = state.products.find(p => p.id === updatedItem.product_id);
                if (product) {
                    product.quantity = updatedItem.quantity;
                }
            })
            .addCase(updateProductQuantityBackend.rejected, (state, action) => {
                console.log("[ExtraReducer] updateProductQuantityBackend.rejected. الخطأ:", action.payload); 
                state.loading = 'failed';
                state.error = action.payload;
            })
            .addCase(removeProductFromCartBackend.pending, (state) => {
                console.log("[ExtraReducer] removeProductFromCartBackend.pending"); 
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(removeProductFromCartBackend.fulfilled, (state, action) => {
                console.log("[ExtraReducer] removeProductFromCartBackend.fulfilled (سيؤدي إلى تشغيل fetchCartItems)"); 
                state.loading = 'succeeded';
                const deletedId = action.payload;
                state.products = state.products.filter(p => p.id !== deletedId);
            })
            .addCase(removeProductFromCartBackend.rejected, (state, action) => {
                console.log("[ExtraReducer] removeProductFromCartBackend.rejected. الخطأ:", action.payload); 
                state.loading = 'failed';
                state.error = action.payload;
            })

            .addCase(placeOrderThunk.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(placeOrderThunk.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.error = null;
                // 🛑 لا حاجة لمسح state.products هنا، لأننا استخدمنا dispatch(resetCart()) في الـ Thunk.
            })
            .addCase(placeOrderThunk.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            });
            
            
    },
});

export const { addProductToCartLocal, removeProductLocal, updateProductQuantityLocal, setCartItems, resetCart  } = ProductCartSlice.actions;


export default ProductCartSlice.reducer;