import { AxiosResponse } from "axios";
import { apiAxios, fetcher } from "@/api/callApi";
import { Post } from "../../utils/types";
import { POST_STATUS } from "../../utils/constants";
import useSWR from "swr";

export const requestUploadPostImage = async (
    images: any[]
): Promise<AxiosResponse> => {
    return apiAxios({
        headers: {
            "Content-Type": "multipart/form-data",
        },
        method: "post",
        url: "post/images-upload",
        data: { images },
    });
};

export const requestSaveDraftOrPost = async (
    post: Post
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "post",
        url: "post/create",
        data: { post },
    });
};

export const requestUpdatePost = async (
    postId: string,
    post: Post
): Promise<any> => {
    if (postId) {
        return apiAxios({
            method: "put",
            url: `post/update/${postId}`,
            data: { post },
        });
    }
};

export const requestGetPost = async (id: string): Promise<AxiosResponse> => {
    return apiAxios({
        method: "get",
        url: `post/${id}`,
    });
};

export const useFetchMyPosts = (
    status: string,
    {
        search,
        page,
        column,
        sort_order,
    }: {
        search?: string;
        page: number;
        column?: string;
        sort_order?: number;
    },
    onError: () => void
) => {
    let url: string = status
        ? `post/get-own-post?status=${status}`
        : `post/get-own-post?status=${POST_STATUS.APPROVED.VALUE}`;
    url += search ? `&search=${search}` : "";
    url += page ? `&page=${page}` : "";
    url += column ? `&column=${column}` : "";
    url += sort_order ? `&sort_order=${sort_order}` : "";

    return useSWR(url, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        onError,
        revalidateOnMount: true,
    });
};

export const requestChangePostVisibility = async (
    postId: string,
    isVisibility: boolean
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: `post/${postId}/visibility`,
        data: { is_visibility: isVisibility },
    });
};

export const useFetchAllPosts = (filter: any, onError: () => void) => {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/public/posts?column=${
        filter?.column || "createdAt"
    }`;
    if (filter?.page) url += `&page=${filter?.page}`;
    if (filter?.sortOrder) url += `&sort_order=${filter?.sortOrder}`;
    if (filter?.city) url += `&city=${filter?.city}`;
    if (filter?.searchKey) url += `&search_key=${filter?.searchKey}`;
    if (filter?.categoryIds) {
        if (typeof filter.categoryIds === "string")
            url += `&category_ids=${filter?.categoryIds}`;
        else {
            filter?.categoryIds?.forEach((id: string) => {
                url += `&category_ids=${id}`;
            });
        }
    }
    if (filter?.priceFrom || filter?.priceFrom === "none")
        url += `&price_from=${filter?.priceFrom}`;
    if (filter?.priceTo || filter?.priceTo === "none")
        url += `&price_to=${filter?.priceTo}`;
    if (filter?.condition) {
        if (typeof filter.condition === "string")
            url += `&condition=${filter?.condition}`;
        else {
            filter?.condition?.forEach((id: string) => {
                url += `&condition=${id}`;
            });
        }
    }

    return useSWR(url, fetcher, {
        onError,
        revalidateIfStale: true,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        revalidateOnFocus: false,
        suspense: false,
    });
};

export const requestAddToWishlist = async (
    postId: string
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "post",
        url: `wishlist/add-to-wishlist`,
        data: { postId },
    });
};

export const requestRemoveFromWishlist = async (
    postId: string
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: `wishlist/remove/${postId}`,
    });
};
