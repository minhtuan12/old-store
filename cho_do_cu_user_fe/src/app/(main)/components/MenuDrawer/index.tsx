"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { Drawer, Flex } from "antd";
import Link from "next/link";
import {
    HeartFilled,
    DashboardOutlined,
    ShoppingFilled,
    ShopFilled,
    SnippetsFilled,
    LogoutOutlined,
} from "@ant-design/icons";
import _ from "lodash";
import styles from "../Header/styles.module.scss";
import { handleLogout } from "@/actions/auth";

export default function MenuDrawer({
    open,
    setOpen,
    setMessageBadge,
    messageBadge,
}: {
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    setMessageBadge: (badge: number) => void;
    messageBadge: number;
}) {
    const { authUser } = useAuthUser();
    const dropdownMenu: any = [
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
        {
            key: "4",
            icon: (
                <div
                    className={"w-6 h-6 rounded-[50%] relative bg-[#D0B8A8]"}
                    onClick={async () => await handleLogout()}
                >
                    <LogoutOutlined
                        className={styles.dropdownIcon}
                        rotate={180}
                    />
                </div>
            ),
            label: (
                <div
                    className={"text-[14px] font-medium"}
                    onClick={async () => await handleLogout()}
                >
                    Đăng xuất
                </div>
            ),
        },
    ];

    return (
        <Drawer
            closable
            destroyOnClose
            title={
                <p className="flex items-center">
                    Xin chào
                    {authUser ? (
                        <div className="font-semibold ml-1">
                            {authUser?.firstname + " " + authUser?.lastname}
                        </div>
                    ) : (
                        ""
                    )}
                </p>
            }
            placement="right"
            open={open}
            onClose={() => setOpen(false)}
        >
            {!authUser ? (
                <Flex vertical gap={10}>
                    <Link href="/register" className="text-[#f80] font-medium">
                        Đăng ký
                    </Link>
                    <Link href="/login" className="font-medium">
                        Đăng nhập
                    </Link>
                </Flex>
            ) : (
                <>
                    <Flex className="gap-[10px] cursor-pointer mb-4">
                        <Link
                            href={"/my-post"}
                            className="flex items-center text-[#000] hover:text-[#000] w-6 h-6 rounded-[50%] relative bg-[#FF8F8F]"
                        >
                            <SnippetsFilled className={styles.dropdownIcon} />
                        </Link>
                        <Link
                            href={"/my-post"}
                            className="text-[14px] font-medium"
                        >
                            Quản lý bài đăng
                        </Link>
                    </Flex>
                    {dropdownMenu.map((item: any) => (
                        <Flex key={item.key} gap={10} className="mb-4">
                            {item.icon}
                            {item.label}
                        </Flex>
                    ))}
                </>
            )}
        </Drawer>
    );
}
