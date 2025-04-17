"use client";

import React, { useEffect, useState } from "react";
import {
    Conversation,
    Post,
    Product,
    UserProfile,
} from "../../../../utils/types";
import LeftSider from "@/app/(main)/chat/components/LeftSider";
import { useAuthUser } from "@/hooks/useAuthUser";
import Middle from "@/app/(main)/chat/components/Middle";
import RightSider from "@/app/(main)/chat/components/RightSider";
import { Flex, Spin, Tag } from "antd";
import { RootState, store } from "@/store/configureStore";
import { useDispatch, useSelector } from "react-redux";
import { setChosenConversation, setUnreadMessages } from "@/store/slices/chat";
import _ from "lodash";
import { setOrder } from "@/store/slices/order";
import { getNotification, handleGetRegion } from "../../../../utils/helper";
import { useFetchRegions } from "@/api/location";
import { PAYMENT_METHOD, POST_STATUS } from "../../../../utils/constants";
import CreateOrderModal from "./components/CreateOrderModal";
import { useFetchMyPosts } from "@/api/post";
import { useSocket } from "@/app/context/SocketContext";

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [firstTime, setFirstTime] = useState(true);
    const { authUser: user } = useAuthUser() as { authUser: UserProfile };
    const dispatch = useDispatch();
    const { order } = useSelector((state: RootState) => state.order);
    const { data: regionsData } = useFetchRegions(() => {
        dispatch(setOrder({ ...order, customer_address: "" }));
    });
    const { chosenConversation } = useSelector(
        (state: RootState) => state.chat
    );
    const [creatingPost, setCreatingPost] = useState<any>(null);
    const {socket, onlineUserIds} = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on("getConversations", (res: any) => {
                setConversations(res);
            });

            socket.on("err", (error: any) => {
                console.error("Error fetching conversations:", error);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [socket]);

    useEffect(() => {
        if (firstTime) {
            if (conversations?.length > 0) {
                setFirstTime(false);
                dispatch(setChosenConversation(conversations?.[0]));
            } else {
                dispatch(setChosenConversation(undefined));
            }
        }
    }, [conversations, dispatch]);

    const handleChosenConversation = (conversation: Conversation) => {
        dispatch(setChosenConversation(conversation));
    };

    const handleConfirmSeenMessage = (socket: any, conversationId: string) => {
        if (conversationId) {
            const { unreadMessages } = store.getState().chat;
            socket.emit("seenMessage", { conversationId });
            let newUnreadMessages = _.cloneDeep(unreadMessages);
            delete newUnreadMessages?.[conversationId];
            dispatch(setUnreadMessages(newUnreadMessages));
        }
    };

    const handleClickCreateOrderBtn = (post: Post) => {
        const product: Product = post?.product
            ? post?.product
            : (post?.product_id as any);
        setCreatingPost({
            ...post,
            product,
        });
        const { chosenConversation } = store.getState().chat;
        if (chosenConversation?._id && post) {
            const customer: UserProfile = chosenConversation?.participant;
            let address = "";
            if (customer?.address?.city) {
                const location = handleGetRegion(
                    regionsData.regions,
                    customer?.address?.city,
                    customer?.address?.district as string
                );
                address = location?.district + ", " + location?.city;
            }
            dispatch(
                setOrder({
                    customer_id: customer?._id,
                    post_id: post?._id,
                    customer_name:
                        customer?.firstname + " " + customer?.lastname,
                    customer_phone: customer?.phone,
                    customer_address: address,
                    payment_method: PAYMENT_METHOD.CREDIT.VALUE,
                    total: product?.price,
                    receiver_stripe_account_id: user?.stripe_account_id,
                })
            );
        }
    };

    const {
        data: postsData,
        isLoading: loadingGetPosts,
        mutate: getMyPosts,
    } = useFetchMyPosts(POST_STATUS.APPROVED.VALUE, { page: 1 }, () => {
        getNotification("error", "Đã xảy ra lỗi khi lấy danh sách bài đăng");
    });

    return (
        <>
            <div className="flex h-[calc(100vh_-_130px)] bg-gray-100 text-gray-800 rounded-xl">
                {chosenConversation || chosenConversation === undefined ? (
                    <>
                        <LeftSider
                            socket={socket}
                            onlineUserIds={onlineUserIds}
                            user={user as UserProfile}
                            conversations={conversations}
                            handleChosenConversation={handleChosenConversation}
                            handleConfirmSeenMessage={handleConfirmSeenMessage}
                        />

                        <Middle
                            user={user as UserProfile}
                            onlineUserIds={onlineUserIds}
                            socket={socket}
                            handleConfirmSeenMessage={handleConfirmSeenMessage}
                            handleClickCreateOrderBtn={
                                handleClickCreateOrderBtn
                            }
                        />

                        <RightSider
                            user={user as UserProfile}
                            handleClickCreateOrderBtn={
                                handleClickCreateOrderBtn
                            }
                            postsData={postsData}
                            loadingGetPosts={loadingGetPosts}
                        />
                    </>
                ) : (
                    <Flex
                        className="w-full h-full"
                        justify="center"
                        align="center"
                    >
                        <Spin />
                    </Flex>
                )}
            </div>
            <CreateOrderModal
                creatingPost={creatingPost}
                getMyPosts={getMyPosts}
            />
        </>
    );
}
