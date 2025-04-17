import useSWR from "swr";
import { apiAxios, fetcher } from "./callApi";
import { AxiosResponse } from "axios";

export const useFetchOldNotifications = () => {
    return useSWR(`/notification`, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        suspense: false
    });
};

export const requestSeenNotification = (notificationIds: string[]): Promise<AxiosResponse> => {
    return apiAxios({
        method: 'patch',
        url: `/notification/read`,
        data: {notificationIds}
    })
}
