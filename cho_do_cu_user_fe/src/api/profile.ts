import { AxiosResponse } from "axios";
import { apiAxios, fetcher } from "@/api/callApi";
import { IChangePasswordData } from "@/app/(main)/profile/type";
import { Baby } from "../../utils/types";
import useSWR from "swr";

export const requestGetProfile = async (
    type = "user"
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "get",
        url: `${type}/get-profile`,
    });
};

export const useFetchProfile = (onError: () => void) => {
    return useSWR("/user/get-profile", fetcher, {
        revalidateIfStale: true,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        revalidateOnFocus: true,
        onError,
    });
};

export const useFetchUserProfile = (
    userId: string | undefined,
    onError: () => void
) => {
    if (userId) {
        return useSWR(`/user/get-user-profile/${userId}`, fetcher, {
            revalidateIfStale: true,
            revalidateOnReconnect: false,
            revalidateOnMount: false,
            onError,
        });
    }
    return useSWR("/user/get-profile", fetcher, {
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
        onError,
    });
};

export const useFetchPosterProfile = (userId: string, onError: () => void) => {
    if (userId) {
        return useSWR(`/user/get-user-profile/${userId}`, fetcher, {
            revalidateIfStale: true,
            revalidateOnReconnect: false,
            revalidateOnMount: false,
            onError,
        });
    }
    return { data: null, mutate: () => {} };
};

export const requestUpdateProfile = async (
    data: any
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: "user/update",
        data,
    });
};

export const requestUpdateAvatar = async (
    avatarFile: any
): Promise<AxiosResponse> => {
    return apiAxios({
        headers: {
            "Content-Type": "multipart/form-data",
        },
        method: "patch",
        url: "user/update-avatar",
        data: {
            file: avatarFile,
        },
    });
};

export const requestChangePassword = async (
    data: IChangePasswordData
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: "auth/change-password",
        data: {
            oldPassword: data.currentPassword,
            newPassword: data.newPassword,
        },
    });
};

export const requestGetKidsInfo = async (): Promise<AxiosResponse> => {
    return apiAxios({
        method: "get",
        url: "baby/get-babies",
    });
};

export const requestAddKidInfo = async (baby: Baby): Promise<AxiosResponse> => {
    return apiAxios({
        method: "post",
        url: "baby/create",
        data: { ...baby },
    });
};

export const requestUpdateKidInfo = async (
    babyId: string,
    baby: Baby
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: "baby/create",
        data: { ...baby },
    });
};

export const requestFollowUser = async (
    userId: string
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: "user/follow-user",
        data: { userId },
    });
};

export const requestUnfollowUser = async (
    userId: string
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "patch",
        url: "user/unfollow-user",
        data: { userId },
    });
};

export const requestCreateNewAccount = async (): Promise<AxiosResponse> => {
    return apiAxios({
        method: "post",
        url: "stripe/create-account",
    });
};

export const requestConnectAccount = async (
    accountId: string,
    userId: string
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "get",
        url: `stripe/account-link/${accountId}/${userId}`,
    });
};

export const requestCheckPayableStripeAccount = async (
    stripeAccount: String
): Promise<AxiosResponse> => {
    return apiAxios({
        method: "get",
        url: `stripe/check-linked-account/${stripeAccount}`,
    });
};
