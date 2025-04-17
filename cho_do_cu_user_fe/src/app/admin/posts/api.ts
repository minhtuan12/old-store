import { apiAxios, fetcher } from "@/api/callApi"
import useSWR from "swr"

export const useFetchAllPostsForAdmin = (filter: any, onError: () => void) => {
    let url = `/admin/posts?column=${filter?.column || 'createdAt'}&sort_order=${filter?.sortOrder || -1}&page=${filter?.page || 1}`
    if (filter?.status) url += `&status=${filter?.status}`
    if (filter?.searchKey) url += `&search_key=${filter?.searchKey}`

    return useSWR(url, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        onError
    })
}

export const approvePost = async (postId: string) => {
    return apiAxios({
        method: 'patch',
        url: `/admin/manage-post/${postId}/approve`
    })
}

export const rejectPost = async (postId: string) => {
    return apiAxios({
        method: 'patch',
        url: `/admin/manage-post/${postId}/reject`
    })
}
