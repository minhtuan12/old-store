import {apiAxios} from "@/api/callApi";

export const requestRevenue = (groupBy: string) => {
    return apiAxios({
        method: 'get',
        url: 'user-dashboard/revenue',
        params: { groupBy } 
    })
}

export const requestExpenses = (groupBy: string) => {
    return apiAxios({
        method: 'get',
        url: 'user-dashboard/expenses',
        params: { groupBy } 
    })
}

export const requestRatings = () => {
    return apiAxios({
        method: 'get',
        url: 'user-dashboard/ratings',
    })
}

export const requestOrdersStatus = () => {
    return apiAxios({
        method: 'get',
        url: 'user-dashboard/orders-status',
    })
}

export const requestGetOrerallStats = () => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/overall-stats',
    })
}
export const requestGetActiveConversations = () => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/active-conversations',
    })
}

export const requestGetUserGrowth = (groupBy: string) => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/user-growth',
        params: { groupBy } 
    })
}

export const requestGetOrderByStatus = () => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/order-by-status',
    })
}

export const requestGetOrderByTime = (groupBy: string) => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/order-by-time',
        params: { groupBy } 
    })
}

export const requestGetPostOrderByStatus = () => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/post-by-status',
    })
}

export const requestGetPostPerCategory = () => {
    return apiAxios({
        method: 'get',
        url: 'admin-dashboard/post-per-category',
    })
}
