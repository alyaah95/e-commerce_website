import {createSlice} from '@reduxjs/toolkit'

const counterSlice = createSlice({
    name: "counter",
    initialState: {
        counterValue: 0,
      
    },
    reducers:{
        increment: (state) => {
            state.counterValue=state.counterValue+1;
        },
        decrement: (state) => {
            state.counterValue=state.counterValue-1;
        },
        decrementByQuantity: (state, action) => {
            state.counterValue=state.counterValue-action.payload
        }

    }
})

export const {increment , decrement ,decrementByQuantity} = counterSlice.actions;
export default counterSlice.reducer;