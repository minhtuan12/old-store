import axios, {AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {getCookieValue} from "../../utils/cookie/server";
import {SERVER_AUTH_TOKEN} from "../../utils/cookie/constants";
import {AUTH_ROUTES} from "../../utils/constants";
import {handleGetNewTokens, handleLogout} from "@/actions/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

const onRejected = (error: any): Promise<any> => {
    return Promise.reject(error)
}

export const apiAxios: AxiosInstance = axios.create({
    baseURL: `${baseUrl}`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetcher = (url: string) => {
    return apiAxios.get(url)
        .then(res => {
            if (!res.data) {
                throw Error(res.data.message);
            }
            return res.data;
        })
        .catch(err => {
            console.log('err', err)
        })
}

apiAxios.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
    const accessToken = await getCookieValue(SERVER_AUTH_TOKEN)
    request.headers.Authorization = accessToken ? `Bearer ${accessToken}` : ''

    return request;
}, onRejected);

apiAxios.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        const responseUrl = error.response?.config?.url

        if (error?.response?.status === 401 && !AUTH_ROUTES.includes(responseUrl) && error?.response?.data?.message === 'accessToken đã hết hạn' && !originalRequest._retry) {
            originalRequest._retry = true;

            if (responseUrl === 'auth/new-access-token') {
                // force to log out
                // getNotification('warning', 'Đã hết phiên đăng nhập')
                return handleLogout()
            } else {
                // request get new access token
                await handleGetNewTokens()
                return apiAxios(originalRequest)
            }
        }
        
        if (error?.response?.status === 403) {
            if (error?.response?.data === 'Tài khoản đã bị khóa, vui lòng liên hệ admin để mở khóa') {
                return onRejected(error)
            }
            window.location.href = '/forbidden'
            return
        }

        return onRejected(error)
    }
);
