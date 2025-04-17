import {apiAxios} from "@/api/callApi";
import {AxiosResponse} from "axios";

export interface ILoginData {
    username?: string,
    email?: string,
    password: string
}

export interface IRegister extends ILoginData {
    firstname: string,
    lastname: string
}

export const requestLogin = (data: ILoginData) => {
    return apiAxios({
        method: 'post',
        url: 'auth/login',
        data: data,
    })
}

export const requestRegister = (data: IRegister) => {
    return apiAxios({
        method: 'post',
        url: 'auth/register',
        data: data,
    })
}

export const requestVerifyEmail = (token: string) => {
    return apiAxios({
        method: 'post',
        url: 'verify-email/register',
        data: {token},
    })
}

export const requestForgotPassword = (email: string) => {
    return apiAxios({
        method: 'post',
        url: 'auth/reset-password',
        data: {email},
    })
}

export const requestResetPassword = (token: string, resetPassword: string) => {
    return apiAxios({
        method: 'put',
        url: 'verify-email/reset-password',
        data: {token, resetPassword},
    })
}

export const requestGetNewTokens = async (refreshToken: string): Promise<AxiosResponse> => {
    return apiAxios({
        method: 'post',
        url: 'auth/new-access-token',
        data: {refreshToken}
    })
}
