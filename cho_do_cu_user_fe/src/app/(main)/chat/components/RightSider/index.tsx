import React from "react";
import { Conversation, Post, UserProfile } from "../../../../../../utils/types";
import {
    EllipsisOutlined,
    EyeOutlined,
    FileAddOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, List, Menu, Skeleton } from "antd";
import {
    getNotification,
    handleGetRegion,
} from "../../../../../../utils/helper";
import { useFetchRegions } from "@/api/location";
import { useFetchMyPosts } from "@/api/post";
import { POST_STATUS } from "../../../../../../utils/constants";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { Dispatch } from "@reduxjs/toolkit";
import { setIsOpenConfirmSell } from "@/store/slices/order";

interface IProps {
    user: UserProfile;
    handleClickCreateOrderBtn: (post: Post) => void;
    loadingGetPosts: boolean,
    postsData: any
}

export const getMenu = (
    post: Post,
    dispatch: Dispatch,
    handleClickCreateOrderBtn: any,
    isPoster: boolean = true
) => {
    return <Menu>
        <Menu.Item key={"detail"} icon={<EyeOutlined />}>
            <Link href={`/posts/${post?._id}`} target={"_blank"}>
                Chi tiết
            </Link>
        </Menu.Item>
        {(post?.product?.price && isPoster) ? (
            <Menu.Item
                key={"confirm"}
                icon={<FileAddOutlined />}
                onClick={() => {
                    dispatch(setIsOpenConfirmSell(true));
                    handleClickCreateOrderBtn(post);
                }}
            >
                Tạo đơn
            </Menu.Item>
        ) : (
            ""
        )}
    </Menu>
};

export default function RightSider({
    user,
    handleClickCreateOrderBtn,
    loadingGetPosts,
    postsData
}: IProps) {
    const { chosenConversation } = useSelector(
        (state: RootState) => state.chat
    );

    const { data: regionsData } = useFetchRegions(() => {
        getNotification("error", "Không thể lấy thông tin địa chỉ các vùng");
    });
    
    const dispatch = useDispatch();

    return (
        <div className="flex flex-col w-1/4 bg-white pb-4 pt-5 pl-4 pr-1 border-l border-gray-300 w-1/4 custom-list rounded-r-xl">
            <div className="flex items-center justify-between mb-6">
                <div className={"font-semibold w-full text-center pr-3"}>
                    Danh sách bài đăng hiện tại
                </div>
            </div>
            {loadingGetPosts ? (
                <Skeleton />
            ) : (
                <List
                    className={
                        "overflow-hidden hover:overflow-auto h-full scrollbar-thin"
                    }
                    style={{ scrollbarGutter: "stable" }}
                    itemLayout="horizontal"
                    dataSource={postsData?.posts}
                    renderItem={(post: Post) => {
                        const location = handleGetRegion(
                            regionsData?.regions,
                            post.location?.city as string,
                            post.location?.district as string
                        );
                        return (
                            <List.Item
                                className=" transition-colors duration-200 cursor-pointer rounded-lg p-10"
                                style={{ padding: "10px" }}
                            >
                                <Avatar
                                    src={
                                        post?.product?.images
                                            ? post?.product?.images?.[0]
                                            : null
                                    }
                                    alt="Post Avatar"
                                    className="mr-4"
                                />
                                <List.Item.Meta
                                    title={
                                        <div
                                            className={
                                                "font-medium max-w-full ellipsis overflow-hidden"
                                            }
                                        >
                                            {post.title}
                                        </div>
                                    }
                                    description={
                                        <div className={"text-[12px]"}>
                                            {location?.district +
                                                ", " +
                                                location?.city}
                                        </div>
                                    }
                                />

                                <Dropdown
                                    overlay={getMenu(
                                        post,
                                        dispatch,
                                        handleClickCreateOrderBtn
                                    )}
                                    trigger={["click"]}
                                >
                                    <EllipsisOutlined className="text-gray-500 cursor-pointer" />
                                </Dropdown>
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );
}
