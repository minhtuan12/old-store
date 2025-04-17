import { fetcher } from "@/api/callApi";
import useSWR from "swr";

export const useFetchMySavedPosts = (onError: () => void) => {
    return useSWR(`/wishlist/my-wishlist`, fetcher, {
        revalidateOnMount: false,
        onError,
        revalidateIfStale: true,
        suspense: false,
    });
};
