import { apiAxios } from "@/api/callApi";
import { AxiosResponse } from "axios";

export const requestRateUser = (data: {
    revieweeId: string;
    star: number;
    comment: string | null;
}) => {
    return apiAxios({
        method: "post",
        url: "rating/rate-user",
        data: { rating: data },
    });
};
