import {AxiosResponse} from "axios";
import {apiAxios, fetcher} from "@/api/callApi";
import useSWR from "swr";

export const useFetchRegions = (onError: () => void) => {
    return useSWR('/location/regions', fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError
    })
}

export const useFetchWards = (onError: () => void) => {
    return useSWR('/location/regions', fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError
    })
}

export const requestGetWards = async (area: string): Promise<AxiosResponse> => {
    return apiAxios({
        method: 'get',
        url: `location/wards?area=${area}`
    })
}
