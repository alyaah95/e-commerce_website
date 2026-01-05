

import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
    name: "counter",
    initialState: {
        counterValue: 0,
    },
    reducers:{
        increment: (state) => {
            state.counterValue = state.counterValue + 1;
        },
        decrement: (state) => {
            if (state.counterValue > 0) { 
                state.counterValue = state.counterValue - 1;
            }
        },
        
        setCounterValue: (state, action) => {
            state.counterValue = action.payload;
        },
        decrementByQuantity: (state, action) => {
            state.counterValue = Math.max(0, state.counterValue - action.payload); 
        },
        reset: (state) => { 
            state.counterValue = 0;
          },
    }
})

export const { increment, decrement, decrementByQuantity, setCounterValue, reset } = counterSlice.actions; 
export default counterSlice.reducer;