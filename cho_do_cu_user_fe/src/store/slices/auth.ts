import {createSlice} from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthSuccess: false,
        userProfile: {},
        errorLogin: {
            email: '',
            password: ''
        },
        errorAdminLogin: {
            username: '',
            password: ''
        },
        errorRegister: {
            firstname: '',
            lastname: '',
            email: '',
            password: ''
        }
    },
    reducers: {
        setUserProfile: (state, action) => ({
            ...state,
            userProfile: action.payload
        }),
        setErrorLogin: (state, action) => ({
            ...state,
            errorLogin: action.payload
        }),
        setErrorRegister: (state, action) => ({
            ...state,
            errorRegister: action.payload
        }),
        setErrorAdminLogin: (state, action) => ({
            ...state,
            errorAdminLogin: action.payload
        }),
    }
})

export const {
    setErrorLogin, setErrorRegister,
    setUserProfile, setErrorAdminLogin
} = authSlice.actions

export default authSlice.reducer;
