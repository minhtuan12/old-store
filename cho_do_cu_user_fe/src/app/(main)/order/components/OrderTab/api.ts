import { apiAxios, fetcher } from "@/api/callApi";
import useSWR from "swr";

export const useFetchOrders = (
    orderType: string,
    { search, page, status }: any,
    onError: () => void
) => {
    let url =
        orderType === "selling"
            ? `/order/get-my-selling-orders?page=${page || 1}`
            : `/order/get-my-buying-orders?page=${page || 1}`;
    url += search ? `&search_key=${search}` : "";
    url += status ? `&status=${status}` : "";

    return useSWR(url, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        onError,
        revalidateOnMount: true,
    });
};

export const requestChangeOrderStatus = (orderId: string, status: string) => {
    return apiAxios({
        method: "patch",
        url: "order/update-order-status",
        data: {
            order: {
                order_id: orderId,
                status,
            },
        },
    });
};

export const requestCancelOrder = (orderId: string) => {
    return apiAxios({
        method: "patch",
        url: "order/cancel",
        data: {
            order: {
                order_id: orderId,
            },
        },
    });
};

export const requestReceivedOrder = (orderId: string) => {
    return apiAxios({
        method: "patch",
        url: "order/received-order",
        data: {
            order: {
                order_id: orderId,
            },
        },
    });
};

export const requestPayOrder = (orderId: string) => {
    return apiAxios({
        method: "post",
        url: "stripe/checkout",
        data: {
            order_id: orderId,
        },
    });
};
