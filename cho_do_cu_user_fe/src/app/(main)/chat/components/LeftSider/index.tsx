import React, { useEffect } from "react";
import { Conversation, UserProfile } from "../../../../../../utils/types";
import { useDispatch, useSelector } from "react-redux";
import { setChosenConversation, setUnreadMessages } from "@/store/slices/chat";
import { RootState, store } from "@/store/configureStore";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Badge, Flex, Skeleton } from "antd";
import socketService from "@/socket";
import _ from "lodash";
import Image from "next/image";
import OnlineDotIcon from "../../../../../assets/images/icons/solid/online-dot.svg";

interface IProps {
    socket: any;
    onlineUserIds: string[];
    user: UserProfile;
    conversations: Conversation[];
    handleChosenConversation: (conversation: Conversation) => void;
    handleConfirmSeenMessage: (socket: any, conversationId: string) => void;
}

export default function LeftSider({
    socket,
    onlineUserIds,
    user,
    conversations,
    handleChosenConversation,
    handleConfirmSeenMessage,
}: IProps) {
    const userFullName = user?.firstname + " " + user?.lastname;
    const { chosenConversation } = useSelector(
        (state: RootState) => state.chat
    );
    const dispatch = useDispatch();

    const handleClickConversation = (conversation: Conversation) => {
        if (user?._id && conversation?._id) {
            const { unreadMessages } = store.getState().chat;
            let newUnreadMessages = _.cloneDeep(unreadMessages);
            dispatch(setChosenConversation(conversation));
            delete newUnreadMessages[conversation?._id as string];
            dispatch(setUnreadMessages(newUnreadMessages));
            handleConfirmSeenMessage(socket, conversation?._id as string);
        }
    };

    useEffect(() => {
        if (user?._id && socket) {
            socket.emit(
                "getUnreadMessages",
                { userId: user?._id },
                (conversations: any) => {
                    let unreadMessages: any = {};
                    conversations?.forEach((item: any) => {
                        if (item?.unreadMessages > 0) {
                            unreadMessages[item._id] = item?.unreadMessages;
                        }
                    });
                    dispatch(setUnreadMessages(unreadMessages));
                }
            );
        }

        return () => {
            socketService.disconnectSocket();
        };
    }, [user?._id, dispatch, socket]);

    return (
        <div className="flex flex-col w-1/4 bg-white p-4 border-r border-gray-300 w-1/4 h-full rounded-l-xl">
            <div className="flex items-center justify-between mb-6 w-full">
                <div className="flex items-center w-full">
                    <div className="h-full relative">
                        {user?.avatar ? (
                            <Image
                                src={user?.avatar}
                                alt={userFullName}
                                className="w-10 h-10 rounded-full mr-3"
                                width={40}
                                height={40}
                            />
                        ) : (
                            <Avatar icon={<UserOutlined />} />
                        )}
                        {onlineUserIds?.includes(user?._id) ? (
                            <div
                                className={
                                    "absolute right-[-6px] bottom-1 border-[3px] rounded-2xl border-white"
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
                    <span className="font-semibold ml-2 w-full overflow-hidden text-ellipsis">
                        {userFullName || <Skeleton />}
                    </span>
                </div>
            </div>
            <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-gray-200 text-gray-800 rounded-full py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div
                className="overflow-hidden hover:overflow-auto h-full scrollbar-thin flex flex-col space-y-4"
                style={{ scrollbarGutter: "stable" }}
            >
                {chosenConversation
                    ? conversations?.map((conversation: Conversation) => {
                          const { unreadMessages } = store.getState().chat;
                          return (
                              <div
                                  key={conversation?._id}
                                  className={`flex justify-between items-center p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                                      chosenConversation?.participant?._id ===
                                      conversation?.participant?._id
                                          ? "bg-[#fff4df] border-l-4 border-[#f80]"
                                          : "bg-gray-100"
                                  }`}
                                  onClick={() =>
                                      handleClickConversation(conversation)
                                  }
                              >
                                  <Flex>
                                      <div className="relative">
                                          {conversation?.participant?.avatar ? (
                                              <Image
                                                  src={
                                                      conversation?.participant
                                                          ?.avatar
                                                  }
                                                  alt={
                                                      conversation?.participant
                                                          ?.firstname +
                                                      " " +
                                                      conversation?.participant
                                                          ?.lastname
                                                  }
                                                  className="w-12 h-12 rounded-full mr-3"
                                                  width={48}
                                                  height={48}
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
                                              conversation?.participant
                                                  ?._id as string
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
                                          <h3 className="font-semibold">
                                              {conversation?.participant
                                                  ?.firstname +
                                                  " " +
                                                  conversation?.participant
                                                      ?.lastname}
                                          </h3>
                                          <p className="text-sm text-gray-500">
                                              {
                                                  conversation?.participant
                                                      ?.follower_ids?.length
                                              }{" "}
                                              người theo dõi
                                          </p>
                                      </div>
                                  </Flex>
                                  {unreadMessages?.[
                                      conversation?._id as string
                                  ] &&
                                  unreadMessages?.[
                                      conversation?._id as string
                                  ] > 0 ? (
                                      <Badge
                                          count={
                                              unreadMessages?.[
                                                  conversation?._id as string
                                              ]
                                          }
                                      />
                                  ) : (
                                      ""
                                  )}
                              </div>
                          );
                      })
                    : ""}
            </div>
        </div>
    );
}
