import {createSlice, Slice} from "@reduxjs/toolkit";

const chatSlice: Slice = createSlice({
    name: 'chat',
    initialState: {
        messages: [],
        chosenConversation: null,
        unreadMessages: {}
    },
    reducers: {
        setMessages: (state, action) => ({
            ...state,
            messages: action.payload
        }),
        setChosenConversation: (state, action) => ({
            ...state,
            chosenConversation: action.payload
        }),
        setUnreadMessages: (state, action) => ({
            ...state,
            unreadMessages: action.payload
        })
    }
})

export const {
    setMessages, setChosenConversation, setUnreadMessages
} = chatSlice.actions

export default chatSlice.reducer;
