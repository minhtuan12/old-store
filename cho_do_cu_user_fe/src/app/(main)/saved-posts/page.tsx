"use client";

import BreadcrumbUpdater from "@/components/BreadcrumbUpdater";
import {
    HeartOutlined,
    MessageOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    getNotification,
    handleFormatCurrency,
    handleGetRegion,
    setLocalStorageItem,
} from "../../../../utils/helper";
import { useFetchMySavedPosts } from "./api";
import { useEffect, useState } from "react";
import { Flex, Image, Spin, Tag } from "antd";
import DefaultButton from "@/components/Button";
import Link from "next/link";
import { useFetchRegions } from "@/api/location";
import {
    LOCALSTORAGE_DEFAULT_CHAT_USER,
    SERVER_ERROR_MESSAGE,
} from "../../../../utils/constants";
import { requestCreateConversation } from "@/api/chat";
import { requestRemoveFromWishlist } from "@/api/post";
import useWindowSize from "@/hooks/useWindowSize";

export default function SavedPosts() {
    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: "Bài đăng yêu thích",
        },
    ];
    const {
        data: wishlist,
        isLoading,
        mutate: getSavedPosts,
    } = useFetchMySavedPosts(() => {
        getNotification(
            "error",
            "Đã có lỗi xảy ra khi lấy danh sách Bài đăng yêu thích"
        );
    });

    const { data: regionsData } = useFetchRegions(() => {});
    const [loadingRemoveSavedPost, setLoadingRemoveSavedPost] = useState(false);

    const handleRemoveSavedPosts = (postId: string) => {
        setLoadingRemoveSavedPost(true);
        requestRemoveFromWishlist(postId)
            .then(() => {
                getSavedPosts();
                getNotification(
                    "success",
                    "Bài đăng đã được bỏ khỏi danh sách yêu thích"
                );
            })
            .catch(() => {
                getNotification("error", SERVER_ERROR_MESSAGE);
            })
            .finally(() => {
                setLoadingRemoveSavedPost(false);
            });
    };

    useEffect(() => {
        getSavedPosts();
    }, []);

    const { width } = useWindowSize();

    return (
        <>
            <div className={"w-full pt-3"}>
                {!isLoading && wishlist ? (
                    <>
                        <BreadcrumbUpdater
                            className={"mb-5"}
                            breadcrumbData={breadcrumbData}
                            title={`Bài đăng yêu thích (${
                                wishlist?.wishlist?.length || 0
                            })`}
                        />
                        <div
                            className={`bg-[#fff] w-full h-auto rounded-[12px] py-6 px-6`}
                        >
                            {wishlist?.wishlist?.length === 0 ? (
                                <Flex
                                    vertical
                                    justify="center"
                                    align="center"
                                    gap={20}
                                >
                                    <div className="text-[#8c8c8c] text-[17px]">
                                        Chưa có bài đăng yêu thích nào
                                    </div>
                                    <Link href="/">
                                        <DefaultButton reverseColor>
                                            <SearchOutlined />
                                            Bắt đầu tìm kiếm
                                        </DefaultButton>
                                    </Link>
                                </Flex>
                            ) : (
                                <Flex vertical>
                                    {wishlist?.wishlist?.map((item: any) => {
                                        const location = handleGetRegion(
                                            regionsData?.regions,
                                            item?.location?.city,
                                            item?.location?.district
                                        );
                                        const posterFullname =
                                            item?.poster?.firstname +
                                            " " +
                                            item?.poster?.lastname;
                                        return (
                                            <Link
                                                key={item?._id}
                                                href={`/posts/${item?._id}`}
                                                className="hover:shadow-lg p-4 cursor-pointer text-[#000] hover:text-[#000] rounded-lg"
                                            >
                                                <Flex
                                                    justify="space-between"
                                                    wrap
                                                >
                                                    <Flex gap={30}>
                                                        <Image
                                                            width={100}
                                                            src={
                                                                item?.product
                                                                    ?.images?.[0]
                                                            }
                                                        />
                                                        <Flex
                                                            vertical
                                                            justify="space-between"
                                                        >
                                                            <Flex vertical>
                                                                <div className="font-semibold text-base">
                                                                    {
                                                                        item?.title
                                                                    }
                                                                </div>
                                                                <div>
                                                                    {
                                                                        item
                                                                            ?.product
                                                                            ?.description
                                                                    }
                                                                </div>
                                                                {item?.product
                                                                    ?.price ? (
                                                                    <div className="text-[#f80] font-semibold text-[20px]">
                                                                        {handleFormatCurrency(
                                                                            item
                                                                                ?.product
                                                                                ?.price
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <Tag
                                                                        color={
                                                                            "cyan"
                                                                        }
                                                                        className={
                                                                            "!text-[15px] !h-[30px] w-fit !p-3 !flex !items-center !justify-center"
                                                                        }
                                                                    >
                                                                        Đồ cho
                                                                        tặng
                                                                    </Tag>
                                                                )}
                                                            </Flex>
                                                            <Flex vertical>
                                                                <div className="text-gray-500">
                                                                    Người đăng:{" "}
                                                                    {
                                                                        posterFullname
                                                                    }
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    Địa chỉ:{" "}
                                                                    {location?.district +
                                                                        ", " +
                                                                        location?.city}
                                                                </div>
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                    <Flex
                                                        className={`${!!(width && width <= 650) ? 'mt-5' : ''}`}
                                                        vertical={!!(width && width > 650)}
                                                        align="end"
                                                        gap={10}
                                                    >
                                                        <Link
                                                            href={"/chat"}
                                                            onClick={() => {
                                                                setLocalStorageItem(
                                                                    LOCALSTORAGE_DEFAULT_CHAT_USER,
                                                                    item?.poster_id
                                                                );
                                                                requestCreateConversation(
                                                                    item?.poster_id,
                                                                    item?._id
                                                                );
                                                            }}
                                                        >
                                                            <DefaultButton
                                                                className="w-[150px]"
                                                                reverseColor
                                                            >
                                                                <MessageOutlined />
                                                                Nhắn tin
                                                            </DefaultButton>
                                                        </Link>
                                                        <Link href="/saved-posts">
                                                            <DefaultButton
                                                                loading={
                                                                    loadingRemoveSavedPost
                                                                }
                                                                className="w-[150px]"
                                                                onClick={() =>
                                                                    handleRemoveSavedPosts(
                                                                        item?._id
                                                                    )
                                                                }
                                                            >
                                                                <HeartOutlined />{" "}
                                                                Bỏ yêu thích
                                                            </DefaultButton>
                                                        </Link>
                                                    </Flex>
                                                </Flex>
                                            </Link>
                                        );
                                    })}
                                </Flex>
                            )}
                        </div>
                    </>
                ) : (
                    <Flex
                        justify="center"
                        align="center"
                        className="w-full h-screen"
                    >
                        <Spin />
                    </Flex>
                )}
            </div>
        </>
    );
}
