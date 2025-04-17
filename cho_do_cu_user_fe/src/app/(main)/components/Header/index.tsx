"use client";

import React, { Suspense, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import "./styles.scss";
import _ from "lodash";
import {
    BellOutlined,
    DashboardOutlined,
    HeartFilled,
    MenuFoldOutlined,
    MessageOutlined,
    SearchOutlined,
    ShopFilled,
    ShoppingFilled,
    SnippetsOutlined,
} from "@ant-design/icons";
import { Badge, Flex, MenuProps, Popover } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DefaultInput from "@/components/Input";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDispatch, useSelector } from "react-redux";
import { setFilter, setNotifications } from "@/store/slices/app";
import DefaultButton from "@/components/Button";
import AuthUserPopover from "@/components/Popover";
import Notifications from "../Notifications";
import socketService from "@/socket";
import Link from "next/link";
import { useFetchOldNotifications } from "@/api/notifications";
import { Notification as NotificationType } from "../../../../../utils/types";
import { RootState, store } from "@/store/configureStore";
import { useSocket } from "@/app/context/SocketContext";
import Loading from "@/components/Loading";
import useWindowSize from "@/hooks/useWindowSize";
import MenuDrawer from "../MenuDrawer";

const HeaderSuspense = () => {
    const { authUser } = useAuthUser();
    const [showMenu, setShowMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [notificationBadge, setNotificationBadge] = useState(0);

    const dropdownMenu: MenuProps["items"] = [
        {
            key: "1",
            icon: (
                <Link
                    href={"/dashboard"}
                    className={"w-6 h-6 rounded-[50%] relative bg-[#8c6a65]"}
                >
                    <DashboardOutlined className={styles.dropdownIcon} />
                </Link>
            ),
            label: (
                <Link href={"/dashboard"} className={"text-[14px] font-medium"}>
                    Thống kê
                </Link>
            ),
        },
        {
            key: "2",
            icon: (
                <Link
                    href={"/order?tab=buying-order"}
                    className={"w-6 h-6 rounded-[50%] relative bg-[#8ecd3c]"}
                >
                    <ShoppingFilled className={styles.dropdownIcon} />
                </Link>
            ),
            label: (
                <Link
                    href={"/order?tab=buying-order"}
                    className={"text-[14px] font-medium"}
                >
                    Đơn mua
                </Link>
            ),
        },
        {
            key: "3",
            icon: (
                <Link
                    href={"/order?tab=selling-order"}
                    className={"w-6 h-6 rounded-[50%] relative bg-[#fe9b69]"}
                >
                    <ShopFilled className={styles.dropdownIcon} />
                </Link>
            ),
            label: (
                <Link
                    href={"/order?tab=selling-order"}
                    className={"text-[14px] font-medium"}
                >
                    Đơn bán
                </Link>
            ),
        },
        {
            type: "divider",
        },
        {
            key: "4",
            icon: (
                <Link
                    href={"/saved-posts"}
                    className={"w-6 h-6 rounded-[50%] relative bg-[#FF8F8F]"}
                >
                    <HeartFilled className={styles.dropdownIcon} />
                </Link>
            ),
            label: (
                <Link
                    href={"/saved-posts"}
                    className={"text-[14px] font-medium"}
                >
                    Bài đăng yêu thích
                </Link>
            ),
        },
    ];

    const { filter } = useSelector((state: RootState) => state.app);
    const searchParams = useSearchParams();

    const handleChangeKeySearch = (value: string): void => {
        if (searchParams) {
            dispatch(setFilter({ ...filter, searchKey: value }));
            if (!value) {
                const params = new URLSearchParams(searchParams);
                params.delete("searchKey");
                router.push(`/?${params.toString()}`);
            }
        }
    };

    const {
        data: notifications,
        isLoading,
        mutate: getOldNotifications,
    } = useFetchOldNotifications();

    const { socket } = useSocket();
    const [messageBadge, setMessageBadge] = useState(0);

    useEffect(() => {
        if (authUser?._id) {
            getOldNotifications();
        }
    }, [authUser?._id]);

    useEffect(() => {
        if (socket) {
            const handleUpdateNoti = (res: any) => {
                const { notifications } = store.getState().app;
                dispatch(
                    setNotifications([res?.newNotification, ...notifications])
                );
                setNotificationBadge((prevBadge) => prevBadge + 1);
            };
            const getNewMessage = () => {
                setMessageBadge((prev) => prev + 1);
            };

            socket.on("notification", handleUpdateNoti);
            socket.on("receiveMessage", getNewMessage);

            return () => {
                socket.off("notification", handleUpdateNoti);
                socketService.disconnectSocket();
            };
        }
    }, [socket]);

    useEffect(() => {
        if (notifications) {
            dispatch(setNotifications(notifications));
            setNotificationBadge(
                notifications?.filter((item: NotificationType) => !item.seen_at)
                    ?.length
            );
        }
    }, [notifications]);

    const { width } = useWindowSize();
    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <header className={styles.headerWrap}>
            {!!(width && width <= 1200) ? (
                ""
            ) : (
                <Link
                    className={`${styles.headerTitle} !text-[#000]`}
                    href={"/"}
                >
                    Chợ đồ cũ
                </Link>
            )}
            {pathname !== "/checkout" ? (
                <div
                    className={`${styles.headerMiddleWrap} ${
                        !!(width && width <= 900)
                            ? "!justify-center !w-2/3"
                            : ""
                    }`}
                >
                    <div className={`${styles.search}`}>
                        <div className={"h-[45px] max-w-[500px]"}>
                            <DefaultInput
                                onPressEnter={() => {
                                    if (searchParams) {
                                        // dispatch(setIsSearched(true))
                                        const params = new URLSearchParams(
                                            searchParams
                                        );
                                        const { filter } = store.getState().app;
                                        if (filter.searchKey) {
                                            params.set(
                                                "searchKey",
                                                filter.searchKey
                                            );
                                        } else {
                                            params.delete("searchKey");
                                        }
                                        router.push(`?${params.toString()}`);
                                    }
                                }}
                                className={styles.searchInput}
                                size={"large"}
                                placeholder="Tìm kiếm sản phẩm trên Chợ Đồ Cũ"
                                prefix={<SearchOutlined />}
                                onChange={(e) =>
                                    handleChangeKeySearch(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            {!!(width && width <= 900) ? (
                <>
                    <Flex align="center" gap={30}>
                        <Link
                            onClick={() => {
                                setMessageBadge(0);
                                window.location.href = "/chat";
                            }}
                            href={"/chat"}
                            className={
                                "cursor-pointer text-[#000] hover:text-[#000]"
                            }
                        >
                            <Badge
                                count={messageBadge}
                                style={{ fontSize: "14px" }}
                            >
                                <MessageOutlined
                                    className={"text-[24px] mt-1"}
                                />
                            </Badge>
                        </Link>
                        <Popover
                            trigger={["click"]}
                            content={
                                <Notifications
                                    userId={authUser?._id as string}
                                    getOldNotifications={getOldNotifications}
                                    isLoading={isLoading}
                                />
                            }
                        >
                            <div className={"cursor-pointer"}>
                                <Badge
                                    count={notificationBadge}
                                    style={{ fontSize: "14px" }}
                                >
                                    <BellOutlined
                                        className={"text-[24px] mt-1"}
                                    />
                                </Badge>
                            </div>
                        </Popover>
                        <Link href={"/post/create"}>
                            <DefaultButton reverseColor size="large">
                                ĐĂNG TIN
                            </DefaultButton>
                        </Link>
                        <MenuFoldOutlined
                            style={{ fontSize: "20px" }}
                            onClick={() => setOpenDrawer(true)}
                        />
                    </Flex>
                    <MenuDrawer
                        messageBadge={messageBadge}
                        setMessageBadge={setMessageBadge}
                        open={openDrawer}
                        setOpen={setOpenDrawer}
                    />
                </>
            ) : (
                <div className={`${styles.headerRightWrap}`}>
                    <Flex
                        gap={30}
                        align="center"
                        className={`${styles.itemHeaderRight} icon-custom`}
                    >
                        <Link
                            onClick={() => {
                                setMessageBadge(0);
                                window.location.href = "/chat";
                            }}
                            href={"/chat"}
                            className={
                                "cursor-pointer text-[#000] hover:text-[#000]"
                            }
                        >
                            <Badge
                                count={messageBadge}
                                style={{ fontSize: "14px" }}
                            >
                                <MessageOutlined
                                    className={"text-[24px] mt-1"}
                                />
                            </Badge>
                        </Link>
                        <Popover
                            trigger={["click"]}
                            content={
                                <Notifications
                                    userId={authUser?._id as string}
                                    getOldNotifications={getOldNotifications}
                                    isLoading={isLoading}
                                />
                            }
                        >
                            <div className={"cursor-pointer"}>
                                <Badge
                                    count={notificationBadge}
                                    style={{ fontSize: "14px" }}
                                >
                                    <BellOutlined
                                        className={"text-[24px] mt-1"}
                                    />
                                </Badge>
                            </div>
                        </Popover>
                        <Link
                            href={"/my-post"}
                            className="flex items-center gap-[8px] cursor-pointer text-[#000] hover:text-[#000]"
                        >
                            <SnippetsOutlined className={"text-[24px]"} />
                            <div className="text-[17px]">Quản lý bài đăng</div>
                        </Link>
                        {_.isEmpty(authUser) ? (
                            <Flex gap={2} justify={"center"} align={"center"}>
                                <Flex
                                    vertical
                                    justify={"center"}
                                    align={"start"}
                                >
                                    <Link
                                        href="/register"
                                        className="text-white font-medium hover:text-white"
                                    >
                                        Đăng ký
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="text-white font-medium hover:text-white"
                                    >
                                        Đăng nhập
                                    </Link>
                                </Flex>
                            </Flex>
                        ) : (
                            <AuthUserPopover
                                authUser={authUser}
                                items={dropdownMenu}
                            />
                        )}
                        <Link href={"/post/create"}>
                            <DefaultButton reverseColor size="large">
                                ĐĂNG TIN
                            </DefaultButton>
                        </Link>
                    </Flex>
                </div>
            )}
        </header>
    );
};

export default function Header() {
    return (
        <Suspense fallback={<Loading />}>
            <HeaderSuspense />
        </Suspense>
    );
}
