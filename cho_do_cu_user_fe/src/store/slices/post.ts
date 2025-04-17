import {createSlice, Slice} from "@reduxjs/toolkit";

const postSlice: Slice = createSlice({
    name: 'post',
    initialState: {
        currentTab: null
    },
    reducers: {
        setCurrentTab: (state, action) => ({
            ...state,
            currentTab: action.payload
        })
    }
})

export const {
    setCurrentTab
} = postSlice.actions

export default postSlice.reducer;
