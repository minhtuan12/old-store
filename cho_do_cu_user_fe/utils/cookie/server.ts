'use server'

import {cookies} from "next/headers";
import {SERVER_AUTH_TOKEN, SERVER_REFRESH_TOKEN, SERVER_USER_PROFILE} from "./constants";

const cookieConfig = {
    httpOnly: true,
    secure: process.env.APP_ENV !== 'development'
}

export const setAuthToken = async (token: string) => {
    return cookies().set({
        name: SERVER_AUTH_TOKEN,
        value: token,
        ...cookieConfig
    });
}

export const setRefreshToken = async (token: string) => {
    return cookies().set({
        name: SERVER_REFRESH_TOKEN,
        value: token,
        ...cookieConfig
    });
}

export const setAuthProfile = async (userProfile: object) => {
    return cookies().set({
        name: SERVER_USER_PROFILE,
        value: JSON.stringify(userProfile)
    });
}

export const getCookieValue = async (cookieKey: string): Promise<any> => {
    return cookies().get(cookieKey)?.value;
}

export const deleteAllCookies = async (): Promise<void> => {
    return cookies().getAll().forEach(cookie => {
        cookies().delete(cookie.name)
    })
}
