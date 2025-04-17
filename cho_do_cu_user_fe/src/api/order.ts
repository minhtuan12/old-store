import { apiAxios } from "./callApi";
import { AxiosResponse } from "axios";
import { Order } from "../../utils/types";

export const requestCreateOrder = (order: Order): Promise<AxiosResponse> => {
    return apiAxios({
        method: "post",
        url: `/order/create`,
        data: { order },
    });
};
