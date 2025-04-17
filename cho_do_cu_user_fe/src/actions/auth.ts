"use server";

import { ILoginData, requestGetNewTokens, requestLogin } from "@/api/auth";
import {
    deleteAllCookies,
    getCookieValue,
    setAuthProfile,
    setAuthToken,
    setRefreshToken,
} from "../../utils/cookie/server";
import { requestGetProfile } from "@/api/profile";
import {
    SERVER_AUTH_TOKEN,
    SERVER_REFRESH_TOKEN,
} from "../../utils/cookie/constants";
import { AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLoginResult(
    data: ILoginData,
    type = "user"
): Promise<any> {
    return requestLogin(data)
        .then(async (res) => {
            await setAuthToken(res.data?.access_token);
            await setRefreshToken(res.data?.refresh_token);
            await handleGetProfile(type);
            return {
                status: res.status,
                data: res.data,
            };
        })
        .catch((err) => {
            console.log("err", err);
            return {
                status: err.response?.status,
                message: err.response?.data,
            };
        });
}

export async function handleGetProfile(type = 'user'): Promise<any> {
    return requestGetProfile(type)
        .then((res) => {
            setAuthProfile(res.data);
            return res.data;
        })
        .catch((err) => {
            handleLogout();
            return redirect("/login");
        });
}

export async function handleGetNewTokens(): Promise<any> {
    const refreshToken: string = await getCookieValue(SERVER_REFRESH_TOKEN);

    return requestGetNewTokens(refreshToken)
        .then((res: AxiosResponse): void => {
            setAuthToken(res.data.access_token);
            setRefreshToken(res.data.refresh_token);
        })
        .catch((): void => {
            deleteAllCookies();
        });
}

export async function handleGetNewTokensInMiddleware(): Promise<any> {
    const refreshToken: string = await getCookieValue(SERVER_REFRESH_TOKEN);

    return requestGetNewTokens(refreshToken)
        .then((res: AxiosResponse): any => {
            return {
                accessToken: res.data.access_token,
                refreshToken: res.data.refresh_token
            }
        })
        .catch((err): void => {
            deleteAllCookies();
        });
}

export async function setCookie(name: string, value: string): Promise<any> {
    return cookies().set(name, value);
}

export async function handleLogout() {
    deleteAllCookies();
    return redirect("/login");
}

export async function fetchUserProfile(
    userId: string | undefined
): Promise<any> {
    try {
        const accessToken = await getCookieValue(SERVER_AUTH_TOKEN);
        const refreshToken = await getCookieValue(SERVER_REFRESH_TOKEN);
        const url = userId
            ? `user/get-user-profile/${userId}`
            : "user/get-profile";
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
            cache: "default",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();

        if (
            response.status === 401 &&
            result.message === "accessToken đã hết hạn"
        ) {
            const refreshResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/new-access-token`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refreshToken }),
                }
            );
            if (refreshResponse.ok) {
                const { access_token, refresh_token } =
                    await refreshResponse.json();
                setAuthToken(access_token);
                setRefreshToken(refresh_token);

                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
                    cache: "default",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } else {
                throw new Error("Lỗi refresh token");
            }

            if (!response.ok) {
                throw new Error("Lỗi lấy dữ liệu người dùng");
            }

            return response.json();
        }
        return result;
    } catch (err) {
        return err;
    }
}
