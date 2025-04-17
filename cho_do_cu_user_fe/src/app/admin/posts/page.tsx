"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumb } from "@/store/slices/app";
import SearchBar from "@/app/admin/components/SearchBar";
import type { TableProps } from "antd";
import { Button, Flex, Image, Select, Tag, Tooltip } from "antd";
import TableDefault from "@/components/Table";
import {
    POST_STATUS,
    POST_STATUS_ADMIN,
    SERVER_ERROR_MESSAGE,
} from "../../../../utils/constants";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { approvePost, rejectPost, useFetchAllPostsForAdmin } from "./api";
import {
    getNotification,
    handleFormatCurrency,
    handleGetLabelFromValue,
    handleGetRegion,
} from "../../../../utils/helper";
import { useFetchRegions } from "@/api/location";
import Link from "next/link";
import PreviewImagesModal from "./components/PreviewImagesModal";

const statusOptions = Object.values(POST_STATUS_ADMIN).map((item: any) => ({
    label: item.LABEL,
    value: item.VALUE,
}));

export default function PostManagement() {
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState({
        searchKey: "",
        status: null,
        sortOrder: -1,
        column: "createdAt",
        page: 1,
        total: 0,
    });
    const {
        data: postsData,
        isLoading,
        mutate: getPosts,
    } = useFetchAllPostsForAdmin(filter, () => {});
    const { data: regionsData } = useFetchRegions(() => {});
    const [openImagesModal, setOpenImagesModal] = useState(false);
    const [previewedImages, setPreviewdImages] = useState<string[]>([]);
    const [loadingActionBtn, setLoadingActionBtn] = useState(false);
    const [actionPostId, setActionPostId] = useState<string | null>(null);

    const handleOpenPreviewImagesModal = (images: string[]) => {
        setOpenImagesModal(true);
        setPreviewdImages(images);
    };

    const handleApproveOrRejectPost = (postId: string, type: string) => {
        if (postId) {
            setActionPostId(postId);
            setLoadingActionBtn(true);
            if (type === "approve") {
                approvePost(postId)
                    .then(() => {
                        getNotification("success", "Duyệt thành công");
                        getPosts();
                    })
                    .catch((err) => {
                        getNotification("error", SERVER_ERROR_MESSAGE);
                    })
                    .finally(() => {
                        setLoadingActionBtn(false);
                        setActionPostId(null);
                    });
            } else {
                rejectPost(postId)
                    .then(() => {
                        getNotification("success", "Từ chối thành công");
                        getPosts();
                    })
                    .catch((err) => {
                        getNotification("error", SERVER_ERROR_MESSAGE);
                    })
                    .finally(() => {
                        setLoadingActionBtn(false);
                        setActionPostId(null);
                    });
            }
        }
    };

    const columns: TableProps<any>["columns"] = [
        {
            title: "STT",
            dataIndex: "key",
            rowScope: "row",
            width: 70,
            align: "center",
            render: (text, record, index) => <div>{index + 1}</div>,
        },
        {
            title: "Bài đăng",
            dataIndex: "title",
            key: "title",
            width: 250,
            sorter: true,
            render: (text, record) => (
                <Flex gap={15} align="center">
                    <div className="max-w-[100px] min-w-[100px] h-full hover:cursor-pointer">
                        <Image
                            preview={false}
                            src={record?.product?.images?.[0]}
                            onClick={() =>
                                handleOpenPreviewImagesModal(
                                    record?.product?.images
                                )
                            }
                        />
                    </div>
                    <div className="font-medium w-full flex-1 overflow-hidden text-ellipsis">
                        {text}
                    </div>
                </Flex>
            ),
        },
        {
            title: "Người đăng tin",
            dataIndex: "product",
            key: "product",
            width: 250,
            render: (text, record) => {
                const poster = record?.poster;
                return (
                    <Flex vertical gap={5}>
                        <div>{poster?.firstname + " " + poster?.lastname}</div>
                        {poster?.email ? (
                            <Link
                                href={`mailto:${poster?.email}`}
                                className="w-fit"
                            >
                                {poster?.email}
                            </Link>
                        ) : (
                            <i
                                className={
                                    !poster?.email ? "text-gray-500" : ""
                                }
                            >
                                Chưa cập nhật email
                            </i>
                        )}

                        {poster?.phone ? (
                            <Link
                                href={`tel:${poster?.phone}`}
                                className="w-fit text-[#f80] hover:text-[#f80]"
                            >
                                {poster?.phone}
                            </Link>
                        ) : (
                            <i
                                className={
                                    !poster?.phone ? "text-gray-500" : ""
                                }
                            >
                                Chưa cập nhật số điện thoại
                            </i>
                        )}
                    </Flex>
                );
            },
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            width: 200,
            render: (text, record) => <div>{record?.category?.name}</div>,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            width: 200,
            render: (text, record) => {
                const location = handleGetRegion(
                    regionsData?.regions,
                    record?.location?.city as string,
                    record?.location?.district as string
                );
                return <div>{location?.district + ", " + location?.city}</div>;
            },
        },
        {
            title: "Giá sản phẩm",
            dataIndex: "price",
            key: "price",
            width: 150,
            align: "center",
            render: (text, record) => {
                return (
                    <div>
                        {record?.product?.price ? (
                            <Flex justify="end" className="font-medium">
                                {handleFormatCurrency(record?.product?.price)}
                            </Flex>
                        ) : (
                            <Tag
                                color={"cyan"}
                                className={
                                    "!text-[15px] !h-[30px] w-fit !p-3 !flex !items-center !justify-center"
                                }
                            >
                                Đồ cho tặng
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (text, record) => {
                let status = record?.status;
                if (status === POST_STATUS.HIDDEN.VALUE)
                    status = POST_STATUS_ADMIN.APPROVED.VALUE;
                const item = handleGetLabelFromValue(POST_STATUS_ADMIN, status);

                return (
                    <Tag
                        className={"w-fit text-[14px] mb-1.5 mt-1.5"}
                        color={item.color}
                    >
                        {item.label}
                    </Tag>
                );
            },
        },
        {
            title: "",
            dataIndex: "action",
            key: "action",
            width: 180,
            render: (text, record) => {
                return record?.status === POST_STATUS.PENDING.VALUE ? (
                    <Flex gap={15} justify="center" align="center">
                        <Tooltip title="Duyệt">
                            <Button
                                loading={
                                    record?._id === actionPostId &&
                                    loadingActionBtn
                                }
                                className="!bg-[#1677ff] admin-button"
                                type="primary"
                                onClick={() =>
                                    handleApproveOrRejectPost(
                                        record?._id,
                                        "approve"
                                    )
                                }
                            >
                                <CheckCircleOutlined
                                    style={{ color: "white" }}
                                />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                            <Button
                                loading={
                                    record?._id === actionPostId &&
                                    loadingActionBtn
                                }
                                type="primary"
                                rootClassName="!bg-[red] hover:!bg-[red]"
                                onClick={() =>
                                    handleApproveOrRejectPost(
                                        record?._id,
                                        "reject"
                                    )
                                }
                            >
                                <CloseCircleOutlined />
                            </Button>
                        </Tooltip>
                    </Flex>
                ) : record?.status === POST_STATUS.APPROVED.VALUE ? (
                    <Flex gap={15} justify="center" align="center">
                        <Tooltip title="Từ chối">
                            <Button
                                loading={
                                    record?._id === actionPostId &&
                                    loadingActionBtn
                                }
                                type="primary"
                                rootClassName="!bg-[red] hover:!bg-[red]"
                                onClick={() =>
                                    handleApproveOrRejectPost(
                                        record?._id,
                                        "reject"
                                    )
                                }
                            >
                                <CloseCircleOutlined />
                            </Button>
                        </Tooltip>
                    </Flex>
                ) : (
                    ""
                );
            },
        },
    ];

    useEffect(() => {
        dispatch(
            setBreadcrumb([
                {
                    path: "/admin/posts",
                    name: "Quản lý bài đăng",
                },
            ])
        );
    }, []);

    useEffect(() => {
        setFilter({
            ...filter,
            total: postsData?.total || 0,
        });
    }, [postsData?.total]);

    return (
        <>
            <Flex vertical gap={20}>
                <Flex gap={30}>
                    <SearchBar
                        className={"w-2/5"}
                        value={searchValue}
                        placeholder={
                            "Tìm kiếm theo tiêu đề bài đăng hoặc thông tin người đăng"
                        }
                        size={"large"}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            if (!e.target.value) {
                                setFilter({ ...filter, searchKey: "" });
                            }
                        }}
                        onPressEnter={() =>
                            setFilter({ ...filter, searchKey: searchValue })
                        }
                    />
                    <Select
                        allowClear
                        value={filter.status}
                        options={statusOptions}
                        onChange={(value) => {
                            setFilter({ ...filter, status: value });
                        }}
                        placeholder="Lọc theo trạng thái bài đăng"
                        className="h-[40px] w-[250px]"
                    />
                </Flex>
                <TableDefault
                    extraClassName="custom-admin-table"
                    columns={columns}
                    loading={isLoading}
                    dataSource={postsData?.posts}
                    pagination={{
                        currentPage: filter.page,
                        perPage: 20,
                        totalRecord: filter.total,
                    }}
                />
            </Flex>
            <PreviewImagesModal
                images={previewedImages}
                openImagesModal={openImagesModal}
                setOpenImagesModal={setOpenImagesModal}
            />
        </>
    );
}
