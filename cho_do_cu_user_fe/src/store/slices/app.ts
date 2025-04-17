import {createSlice, Slice} from "@reduxjs/toolkit";

const appSlice: Slice = createSlice({
    name: 'app',
    initialState: {
        breadcrumb: [],
        pageTitle: '',
        regions: [],
        isSearched: false,
        filter: {
            searchKey: null,
            city: null,
            column: 'createdAt',
            sortOrder: -1,
            page: 1,
            priceFrom: null,
            priceTo: null,
            categoryIds: null,
            condition: null
        },
        notifications: [],
        socket: null
    },
    reducers: {
        setSocket: (state, action: {payload: any, type: string}) => ({
            ...state,
            socket: action.payload
        }),
        setNotifications: (state, action: {payload: any, type: string}) => ({
            ...state,
            notifications: action.payload
        }),
        setFilter: (state, action: {payload: any, type: string}) => ({
            ...state,
            filter: action.payload
        }),
        setIsSearched: (state, action: {payload: any, type: string}) => ({
            ...state,
            isSearched: action.payload
        }),
        setBreadcrumb: (state, action: {payload: any, type: string}) => ({
            ...state,
            breadcrumb: action.payload
        }),
        setPageTitle: (state, action: {payload: any, type: string}) => ({
            ...state,
            pageTitle: action.payload
        }),
        setRegions: (state, action: {payload: any, type: string}) => ({
            ...state,
            regions: action.payload
        })
    }
})

export const {
    setBreadcrumb, setPageTitle, setRegions, setIsSearched, setFilter, setNotifications, setSocket
} = appSlice.actions

export default appSlice.reducer;
