"use client";

import {
    EditOutlined,
    HeartOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import Button from "@/components/Button";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    getNotification,
    setLocalStorageItem,
} from "../../../../../../utils/helper";
import {
    LOCALSTORAGE_DEFAULT_CHAT_USER,
    SERVER_ERROR_MESSAGE,
} from "../../../../../../utils/constants";
import { requestCreateConversation } from "@/api/chat";
import { Flex } from "antd";
import { useAuthUser } from "@/hooks/useAuthUser";
import { UserProfile } from "../../../../../../utils/types";
import { requestAddToWishlist, requestRemoveFromWishlist } from "@/api/post";
import { requestGetProfile, useFetchProfile } from "@/api/profile";
import { getCookieValue } from "../../../../../../utils/cookie/server";
import { SERVER_AUTH_TOKEN } from "../../../../../../utils/cookie/constants";

export default function PostAction({
    posterId,
    postId,
}: {
    posterId: string;
    postId: string;
}) {
    const { data: user, mutate: getProfile } = useFetchProfile(() => {});
    const [wishlist, setWishlist] = useState(user?.wishlist);
    const isLiked = useMemo(() => {
        return wishlist?.includes(postId);
    }, [wishlist?.length]);
    const [loadingLikeBtn, setLoadingLikeBtn] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const handleLikeOrUnlikePost = () => {
        setLoadingLikeBtn(true);
        if (!isLiked) {
            requestAddToWishlist(postId)
                .then(() => {
                    setWishlist([...(wishlist as string[]), postId]);
                })
                .catch(() => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    setLoadingLikeBtn(false);
                });
        } else {
            requestRemoveFromWishlist(postId)
                .then(() => {
                    setWishlist(
                        wishlist?.filter((item: string) => item !== postId)
                    );
                })
                .catch(() => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    setLoadingLikeBtn(false);
                });
        }
    };

    useEffect(() => {
        async function getUserProfile() {
            if (await getCookieValue(SERVER_AUTH_TOKEN)) {
                getProfile();
            }
        }
        getUserProfile();
    }, []);

    useEffect(() => {
        if (user?.wishlist) {
            setWishlist(user?.wishlist);
        }
    }, [user?._id]);

    if (!user) {
        return null;
    }

    return (
        <>
            {user?._id === posterId ? (
                <Link href={`/post/${postId}`}>
                    <Button size={"large"} className={"w-[200px]"}>
                        <EditOutlined />
                        Sửa bài đăng
                    </Button>
                </Link>
            ) : (
                <Flex gap={20}>
                    <Button
                        size={"large"}
                        className={"w-[200px]"}
                        reverseColor
                        onClick={handleLikeOrUnlikePost}
                        loading={loadingLikeBtn}
                    >
                        <HeartOutlined />
                        {isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                    </Button>
                    <div
                        onClick={() => {
                            setLoadingCreate(true);
                            setLocalStorageItem(
                                LOCALSTORAGE_DEFAULT_CHAT_USER,
                                posterId
                            );
                            requestCreateConversation(posterId, postId)
                                .then(() => {
                                    window.location.href = "/chat";
                                })
                                .catch(() => {
                                    getNotification(
                                        "error",
                                        SERVER_ERROR_MESSAGE
                                    );
                                })
                                .finally(() => {
                                    setLoadingCreate(false);
                                });
                        }}
                    >
                        <Button
                            size={"large"}
                            className={"w-[200px]"}
                            loading={loadingCreate}
                        >
                            <MessageOutlined />
                            Nhắn tin
                        </Button>
                    </div>
                </Flex>
            )}
        </>
    );
}
