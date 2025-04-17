import {createSlice, Slice} from "@reduxjs/toolkit";

const categorySlice: Slice = createSlice({
    name: 'category',
    initialState: {
        currentCategory: {}
    },
    reducers: {
        setCurrentCategory: (state, action) => ({
            ...state,
            currentCategory: action.payload
        })
    }
})

export const {
    setCurrentCategory
} = categorySlice.actions

export default categorySlice.reducer;
