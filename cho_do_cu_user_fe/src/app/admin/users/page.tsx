"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumb } from "@/store/slices/app";
import SearchBar from "@/app/admin/components/SearchBar";
import type { TableProps } from "antd";
import { Avatar, Flex, Image, Switch, Tooltip } from "antd";
import TableDefault from "@/components/Table";
import { getNotification, handleGetRegion } from "../../../../utils/helper";
import { lockOrUnlockUser, useFetchAllUsers } from "./api";
import { useFetchRegions } from "@/api/location";
import { UserOutlined } from "@ant-design/icons";
import { SERVER_ERROR_MESSAGE } from "../../../../utils/constants";

interface DataType {
    _id: string;
    firstname: string;
    lastname: string;
    key: string;
    email: string;
    phone: string | null;
    address: {
        city: string | null;
        district: string | null;
        ward: string | null;
    };
    avatar: string | null;
    is_deleted: boolean;
}

export default function UserManagement() {
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState<string>("");
    const [filter, setFilter] = useState({
        keywords: "",
        page: 1,
    });
    const {
        data: users,
        isLoading,
        mutate: getUsers,
    } = useFetchAllUsers(filter, () => {
        getNotification("error", "Lỗi khi lấy thông tin người dùng");
    });
    const { data: regionsData } = useFetchRegions(() => {});
    const [loadingSubmitLockUserId, setLoadingSubmitLockUserId] = useState<
        null | string
    >(null);

    const handleLockOrUnlockUser = (
        userId: string,
        type: string = "restore"
    ) => {
        if (userId) {
            setLoadingSubmitLockUserId(userId);
            lockOrUnlockUser(userId, type)
                .then(() => {
                    getNotification(
                        "success",
                        type === "restore"
                            ? "Mở khóa tài khoản thành công"
                            : "Khóa tài khoản thành công"
                    );
                    getUsers();
                })
                .catch(() => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    setLoadingSubmitLockUserId(null);
                });
        }
    };

    const columns: TableProps<DataType>["columns"] = [
        {
            title: "STT",
            dataIndex: "key",
            rowScope: "row",
            width: 70,
            align: "center",
            render: (text, record, index) => <div>{index + 1}</div>,
        },
        {
            title: "Họ và tên",
            dataIndex: "name",
            key: "name",
            width: 300,
            sorter: true,
            render: (text, record) => (
                <Flex
                    className="font-medium w-full overflow-hidden text-ellipsis"
                    gap={10}
                    align="center"
                >
                    {record?.avatar ? (
                        <img
                            src={record?.avatar as string}
                            className="rounded-[50%] w-[30px] h-[30px]"
                        />
                    ) : (
                        <div className="rounded-[50%] bg-gray-50 p-2 w-[30px] h-[30px] flex items-center justify-center">
                            <UserOutlined />
                        </div>
                    )}
                    {record?.firstname + " " + record?.lastname}
                </Flex>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 250,
            sorter: true,
            render: (text) => <a href={`mailto:${text}`}>{text}</a>,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 160,
            render: (text) =>
                text ? (
                    <a href={`tel:${text}`}>{text}</a>
                ) : (
                    <i className={"text-gray-500"}>Đang cập nhật</i>
                ),
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            render: (text, record) => {
                if (record?.address?.city && regionsData) {
                    const location = handleGetRegion(
                        regionsData?.regions,
                        record?.address?.city,
                        record?.address?.district as string
                    );
                    return (
                        <div>{location?.district + ", " + location?.city}</div>
                    );
                } else {
                    return <i className={"text-gray-500"}>Đang cập nhật</i>;
                }
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "action",
            key: "action",
            align: "center",
            width: 140,
            fixed: "right",
            render: (text, record) => (
                <Tooltip
                    title={
                        record?.is_deleted ? "Bấm để mở khóa" : "Bấm để khóa"
                    }
                >
                    <Switch
                        loading={loadingSubmitLockUserId === record?._id}
                        checked={!record?.is_deleted}
                        className="main-switch"
                        onChange={() => {
                            if (record?.is_deleted) {
                                handleLockOrUnlockUser(record?._id);
                            } else {
                                handleLockOrUnlockUser(record?._id, "lock");
                            }
                        }}
                    />
                </Tooltip>
            ),
        },
    ];

    useEffect(() => {
        dispatch(
            setBreadcrumb([
                {
                    path: "/admin/users",
                    name: "Quản lý người dùng",
                },
            ])
        );
    }, []);

    return (
        <Flex vertical gap={20}>
            <SearchBar
                className={"w-2/5"}
                value={searchValue}
                placeholder={
                    "Tìm kiếm theo tên, email hoặc số điện thoại người dùng"
                }
                size={"large"}
                onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (!e.target.value) {
                        setFilter({ ...filter, keywords: "" });
                    }
                }}
                onPressEnter={() =>
                    setFilter({ ...filter, keywords: searchValue })
                }
            />
            <TableDefault
                columns={columns}
                loading={isLoading}
                dataSource={users?.users}
                hasPagination={false}
            />
        </Flex>
    );
}
