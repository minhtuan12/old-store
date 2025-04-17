"use client";

import { Avatar, Dropdown, Flex, MenuProps } from "antd";
import {
    CaretDownOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import React from "react";
import { AdminProfile, UserProfile } from "../../../utils/types";
import "../../app/global.scss";
import styles from "@/app/(main)/components/Header/styles.module.scss";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/actions/auth";
import { DISPLAY_ADMIN_TYPE } from "../../../utils/constants";
import Link from "next/link";

interface IProps {
    items?: MenuProps["items"];
    authUser: UserProfile | AdminProfile;
}

export default function AuthUserPopover({ items = [], authUser }: IProps) {
    const router = useRouter();
    const handleClickLogout = async () => {
        await handleLogout();
    };

    const displayName: string =
        authUser?.username || authUser?.firstname + " " + authUser?.lastname;

    const menuItems: MenuProps["items"] = [
        {
            key: "0",
            label: (
                <Link href={"/profile"} className={"flex flex-col"}>
                    <Flex gap={10} align={"center"}>
                        <Avatar
                            size={"large"}
                            src={authUser?.avatar}
                            icon={!authUser?.avatar && <UserOutlined />}
                        />
                        <Flex vertical>
                            <div
                                className={
                                    "font-semibold text-black text-base w-full overflow-hidden text-ellipsis"
                                }
                            >
                                {displayName}
                            </div>
                            <div className={"text-gray-500 text-[14px]"}>
                                {authUser?.email ||
                                    DISPLAY_ADMIN_TYPE[
                                        authUser?.role as string
                                    ]}
                            </div>
                        </Flex>
                    </Flex>
                </Link>
            ),
        },
        {
            type: "divider",
        },
        ...items,
        {
            type: "divider",
        },
        {
            key: "999999",
            icon: (
                <div
                    className={"w-6 h-6 rounded-[50%] relative bg-[#D0B8A8]"}
                    onClick={handleClickLogout}
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
                    onClick={handleClickLogout}
                >
                    Đăng xuất
                </div>
            ),
        },
    ];

    // @ts-ignore
    return (
        <Dropdown
            trigger={["click"]}
            menu={{ items: menuItems }}
            rootClassName={"dropdown-custom"}
        >
            <div
                className={
                    "flex items-center text-[15px] cursor-pointer hover:opacity-75 w-fit"
                }
            >
                {authUser?.avatar ? (
                    <Avatar src={authUser?.avatar} />
                ) : (
                    <UserOutlined />
                )}
                <div className={"ml-2 w-full overflow-hidden text-ellipsis"}>
                    {displayName}
                </div>
                <CaretDownOutlined
                    className={"ml-2 mt-0.5"}
                    style={{ fontSize: "14px" }}
                />
            </div>
        </Dropdown>
    );
}
