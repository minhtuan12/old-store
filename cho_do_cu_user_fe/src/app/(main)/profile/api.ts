import { fetcher } from "@/api/callApi";
import useSWR from "swr";

export const useFetchSellingPosts = (
    userId: string | undefined,
    status: string
) => {
    return useSWR(`/public/user/${userId}/posts?status=${status}`, fetcher, {
        revalidateIfStale: true,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        suspense: false,
    });
};

export const useFetchRatings = (userId: string | undefined) => {
    return useSWR(`/public/user/${userId}/ratings`, fetcher, {
        revalidateIfStale: true,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        suspense: false,
    });
};
