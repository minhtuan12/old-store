import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Conversation, Post, UserProfile } from "../../../../../../utils/types";
import moment from "moment";
import {
    DownOutlined,
    EllipsisOutlined,
    EyeOutlined,
    FileAddOutlined,
    PaperClipOutlined,
    SendOutlined,
    SmileOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Flex, Menu, Tag } from "antd";
import socketService from "@/socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "@/store/configureStore";
import { setMessages, setUnreadMessages } from "@/store/slices/chat";
import {
    handleFormatCurrency,
    handleGetRegion,
} from "../../../../../../utils/helper";
import { getMenu } from "../RightSider";
import Image from "next/image";
import Link from "next/link";
import { setIsOpenConfirmSell } from "@/store/slices/order";
import OnlineDotIcon from "../../../../../assets/images/icons/solid/online-dot.svg";

interface IProps {
    user: UserProfile;
    onlineUserIds: string[];
    socket: any;
    handleConfirmSeenMessage: (socket: any, conversationId: string) => void;
    handleClickCreateOrderBtn: (post: Post) => void;
}

export interface Message {
    sender_id: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    is_deleted?: boolean;
}

export default function Middle({
    user,
    onlineUserIds,
    socket,
    handleConfirmSeenMessage,
    handleClickCreateOrderBtn,
}: IProps) {
    const [inputMessage, setInputMessage] = useState("");
    const { chosenConversation } = useSelector(
        (state: RootState) => state.chat
    );
    const fullName = useMemo(() => {
        return (
            chosenConversation?.participant?.firstname +
            " " +
            chosenConversation?.participant?.lastname
        );
    }, [chosenConversation?.participant]);
    const { messages } = useSelector((state: RootState) => state.chat);
    const dispatch = useDispatch();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle sending a message
    const handleSendMessage = () => {
        if (inputMessage && chosenConversation && socket) {
            const newMessage: Message = {
                sender_id: user?._id,
                content: inputMessage,
            };
            handleConfirmSeenMessage(socket, chosenConversation?._id);
            setInputMessage("");
            dispatch(setMessages([...messages, newMessage]));

            socket.emit("sendMessage", {
                senderUserId: user?._id,
                recipientUserId: chosenConversation?.participant?._id,
                conversationId: chosenConversation?._id,
                message: inputMessage,
                contentType: "string",
            });
        }
    };

    const handleInputChange = (e: any) => {
        setInputMessage(e.target.value);
    };

    const getMenu = useMemo(() => {
        const post = chosenConversation?.lastest_mentioned_post;
        const isPoster =
            chosenConversation?.lastest_mentioned_post?.poster_id === user?._id;

        return (
            <Menu>
                <Menu.Item key={"detail"} icon={<EyeOutlined />}>
                    <Link href={`/posts/${post?._id}`} target={"_blank"}>
                        Chi tiết
                    </Link>
                </Menu.Item>
                {post?.product_id?.price && isPoster ? (
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
        );
    }, [chosenConversation?.lastest_mentioned_post]);

    useEffect(() => {
        if (chosenConversation?._id && socket) {
            socket.emit(
                "getMessages",
                { conversationId: chosenConversation?._id },
                (res: any) => {
                    dispatch(setMessages(res));
                }
            );

            socket.on("err", (error: any) => {
                dispatch(setMessages([]));
                setInputMessage("");
                console.error("Error fetching conversations:", error);
            });
        }
    }, [chosenConversation?._id, dispatch]);

    useEffect(() => {
        if (user?._id && socket) {
            socket.on("receiveMessage", (data: any) => {
                const { messages, chosenConversation, unreadMessages } =
                    store.getState().chat;
                if (data.conversationId === chosenConversation?._id) {
                    dispatch(
                        setMessages([
                            ...messages,
                            {
                                sender_id: data.senderUserId,
                                content: data.message,
                            },
                        ])
                    );
                    handleConfirmSeenMessage(socket, chosenConversation?._id);
                } else if (data.senderUserId !== user?._id) {
                    dispatch(
                        setUnreadMessages({
                            ...unreadMessages,
                            [data.conversationId]: unreadMessages?.[
                                data.conversationId
                            ]
                                ? unreadMessages?.[data.conversationId] + 1
                                : 1,
                        })
                    );
                }
            });
        }

        return () => {
            socketService.disconnectSocket();
        };
    }, [user?._id, dispatch, socket]);

    return chosenConversation ? (
        <div className="flex-1 flex flex-col w-1/2 h-full">
            <div className="bg-[white] p-4 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center">
                    <div className="relative">
                        {chosenConversation?.participant?.avatar ? (
                            <Image
                                width={40}
                                height={40}
                                src={chosenConversation?.participant?.avatar}
                                alt={fullName || ""}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        ) : (
                            <div className="mr-3.5">
                                <Avatar
                                    icon={<UserOutlined />}
                                    className="h-[40px] w-[40px]"
                                />
                            </div>
                        )}
                        {onlineUserIds?.includes(
                            chosenConversation?.participant?._id
                        ) ? (
                            <div
                                className={
                                    "absolute right-[10px] bottom-1 border-[3px] rounded-2xl border-white"
                                }
                            >
                                <Image
                                    src={OnlineDotIcon}
                                    alt={""}
                                    width={7}
                                    height={7}
                                />
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold">{fullName}</h2>
                        <p className="text-sm text-gray-500">
                            {
                                chosenConversation?.participant?.follower_ids
                                    ?.length
                            }{" "}
                            người theo dõi
                        </p>
                    </div>
                </div>
            </div>
            {chosenConversation?.lastest_mentioned_post ? (
                <div
                    style={{
                        background:
                            "linear-gradient(to bottom, #f2d194, rgba(255, 255, 255, 0))",
                    }}
                    className="p-4 flex items-center justify-between border-b border-gray-300"
                >
                    <div className="flex items-center justify-between w-full">
                        <Flex align="center">
                            <Image
                                width={40}
                                height={40}
                                src={
                                    chosenConversation?.lastest_mentioned_post
                                        ?.product_id?.images?.[0]
                                }
                                alt={""}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <h2 className="font-semibold">
                                    {
                                        chosenConversation
                                            ?.lastest_mentioned_post?.title
                                    }
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {chosenConversation?.lastest_mentioned_post
                                        ?.product_id?.price ? (
                                        <div className="text-[#f80] font-semibold text-[15px]">
                                            {handleFormatCurrency(
                                                chosenConversation
                                                    ?.lastest_mentioned_post
                                                    ?.product_id?.price
                                            )}
                                        </div>
                                    ) : (
                                        <Tag color="cyan">Đồ cho tặng</Tag>
                                    )}
                                </p>
                            </div>
                        </Flex>

                        <Dropdown overlay={getMenu} trigger={["click"]}>
                            <Button
                                className="rounded-[50%] bg-white"
                                shape="circle"
                            >
                                <EllipsisOutlined className="text-gray-500 cursor-pointer" />
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            ) : (
                ""
            )}

            <div
                className="scrollbar-thin overflow-hidden hover:overflow-auto flex-1 p-4 space-y-4 bg-gray-50"
                style={{ scrollbarGutter: "stable" }}
            >
                {messages?.map((message: Message, index: number) => {
                    const isMyMessage =
                        message?.sender_id?.toString() ===
                        user?._id?.toString();
                    return (
                        <div
                            key={index}
                            className={`flex ${
                                isMyMessage ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] lg:max-w-md xl:max-w-lg ${
                                    isMyMessage ? "bg-blue-100" : "bg-gray-200"
                                } rounded-lg p-3 shadow-md`}
                                style={{
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}
                            >
                                <p>{message.content}</p>
                                <p
                                    className={`text-xs text-gray-500 mt-1 ${
                                        isMyMessage ? "text-right" : "text-left"
                                    }`}
                                >
                                    {moment(message.createdAt).format("HH:mm")}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="bg-white p-4 border-t border-gray-300">
                <div className="flex items-center bg-gray-200 rounded-full">
                    <button className="p-2 rounded-full hover:bg-gray-300 transition-colors duration-200">
                        <PaperClipOutlined className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 bg-transparent py-2 px-1 focus:outline-none"
                    />
                    <button className="p-2 rounded-full hover:bg-gray-300 transition-colors duration-200">
                        <SmileOutlined className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        className="flex items-center justify-center p-2 rounded-full bg-[#ffa652] text-white hover:bg-[#ff8d21] transition-colors duration-200 ml-2"
                        onClick={handleSendMessage}
                    >
                        <SendOutlined className="flex items-center justify-center w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <Flex justify={"center"} align={"center"} className="w-1/2 h-full">
            Bạn không có cuộc trò chuyện nào
        </Flex>
    );
}
