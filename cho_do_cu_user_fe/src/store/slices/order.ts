import {createSlice, Slice} from "@reduxjs/toolkit";
import { PAYMENT_METHOD } from "../../../utils/constants";

const orderSlice: Slice = createSlice({
    name: 'order',
    initialState: {
        isOpenConfirmationSellingPopup: false,
        order: {
            customer_id: null,
            post_id: null,
            customer_name: null,
            customer_phone: null,
            customer_address: null,
            payment_method: PAYMENT_METHOD.CREDIT.VALUE,
            total: null,
            receiver_stripe_account_id: null
        },
        filter: {
            page: 1,
            searchKey: null,
            status: null
        }
    },
    reducers: {
        setFilter: (state, action) => ({
            ...state,
            filter: action.payload
        }),
        setIsOpenConfirmSell: (state, action) => ({
            ...state,
            isOpenConfirmationSellingPopup: action.payload
        }),
        setOrder: (state, action) => ({
            ...state,
            order: action.payload
        })
    }
})

export const {
    setIsOpenConfirmSell, setOrder, setFilter
} = orderSlice.actions

export default orderSlice.reducer;
