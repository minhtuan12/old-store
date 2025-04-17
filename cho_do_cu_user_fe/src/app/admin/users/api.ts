import { apiAxios, fetcher } from "@/api/callApi"
import useSWR from "swr"

export const useFetchAllUsers = (filter: any, onError: () => void) => {
    let url = `/admin/get-users?page=${filter?.page || 1}`
    if (filter?.keywords) url += `&keywords=${filter?.keywords}`

    return useSWR(url, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        onError
    })
}

export const lockOrUnlockUser = async (userId: string, type: string = 'restore') => {
    if (type === 'lock') {
        return apiAxios({
            method: 'patch',
            url: `/admin/delete-user/${userId}`
        })
    }
    return apiAxios({
        method: 'patch',
        url: `/admin/restore-user/${userId}`
    }) 
}
