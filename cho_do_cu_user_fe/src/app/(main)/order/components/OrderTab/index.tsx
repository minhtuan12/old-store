"use client";

import { useState } from "react";
import {
    getNotification,
    handleFormatCurrency,
    handleGetLabelFromValue,
} from "../../../../../../utils/helper";
import { Empty, Flex, Select, Spin, Table, Tag, Tooltip } from "antd";
import {
    requestCancelOrder,
    requestChangeOrderStatus,
    requestReceivedOrder,
    useFetchOrders,
} from "./api";
import { Order, UserProfile } from "../../../../../../utils/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import Link from "next/link";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import {
    ORDER_STATUS,
    ORDER_STATUS_CHANGABLE,
    SERVER_ERROR_MESSAGE,
} from "../../../../../../utils/constants";
import { setFilter } from "@/store/slices/order";
import DetailModal from "../DetailModal";
import BuyingOrder from "../BuyingOrder";
import { useAuthUser } from "@/hooks/useAuthUser";

const Center = ({ children }: { children: React.ReactNode }) => (
    <Flex
        className={"w-full h-[calc(100vh_-_400px)]"}
        align={"center"}
        justify={"center"}
    >
        {children}
    </Flex>
);

const options = Object.values(ORDER_STATUS_CHANGABLE).map((item) => ({
    label: item.LABEL,
    value: item.VALUE,
}));

export default function OrderTab({ type }: { type: string }) {
    const { filter } = useSelector((state: RootState) => state.order);
    const { authUser } = useAuthUser();
    const onErrorFetchPosts = () => {
        getNotification(
            "error",
            "Đã xảy ra lỗi khi lấy thông tin các đơn hàng"
        );
    };
    const dispatch = useDispatch();

    const {
        data: ordersData,
        isLoading: loadingGetOrders,
        mutate: getOrders,
    } = useFetchOrders(type, filter, onErrorFetchPosts);

    const [loadingUpdateStatus, setLoadingUpdateStatus] =
        useState<boolean>(false);
    const handleChangeOrderStatus = (orderId: string, status: string) => {
        setLoadingUpdateStatus(true);
        requestChangeOrderStatus(orderId, status)
            .then(() => {
                getOrders();
                getNotification(
                    "success",
                    status === ORDER_STATUS.CANCELLED.VALUE
                        ? "Đã hủy đơn hàng"
                        : "Cập nhật trạng thái thành công"
                );
            })
            .catch((err) => {
                getNotification(
                    "error",
                    err?.response?.data || SERVER_ERROR_MESSAGE
                );
            })
            .finally(() => {
                setLoadingUpdateStatus(false);
            });
    };

    const handleCancelOrder = (order: Order) => {
        setLoadingUpdateStatus(true);
        requestCancelOrder(order?._id)
            .then(() => {
                getOrders();
                setOrderToDelete(null);
                getNotification(
                    "success",
                    `Đã hủy đơn hàng ${
                        order?.stripe_payment_intent_id
                            ? ", số tiền đã thanh toán sẽ sớm được hoàn lại."
                            : ""
                    }`
                );
            })
            .catch((err) => {
                getNotification(
                    "error",
                    err?.response?.data || SERVER_ERROR_MESSAGE
                );
            })
            .finally(() => {
                setLoadingUpdateStatus(false);
            });
    };

    const handleReceivedOrder = (orderId: string) => {
        setLoadingUpdateStatus(true);
        requestReceivedOrder(orderId)
            .then(() => {
                getOrders();
                getNotification("success", "Đã nhận hàng");
            })
            .catch((err) => {
                getNotification(
                    "error",
                    err?.response?.data || SERVER_ERROR_MESSAGE
                );
            })
            .finally(() => {
                setLoadingUpdateStatus(false);
            });
    };

    const [isOpenDetailModal, setIsOpenDetailModal] = useState<boolean>(false);
    const [orderDetail, setOrderDetail] = useState<Order | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const columns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            width: 200,
            render: (text: string) => (
                <div className={"font-semibold"}>{text}</div>
            ),
        },
        {
            title: "Khách hàng",
            dataIndex: "customer_name",
            width: 180,
            render: (text: string, record: any) => (
                <Link
                    target="_blank"
                    href={`/profile/${record?.customer_id}`}
                    className={"font-semibold"}
                >
                    {text}
                </Link>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "customer_phone",
            align: "center",
            width: 120,
            render: (text: string) => {
                return <Link href={`tel:${text}`}>{text}</Link>;
            },
        },
        {
            title: "Địa chỉ",
            dataIndex: "customer_address",
            width: 200,
            render: (text: string) => <div>{text}</div>,
        },
        {
            title: "Tổng tiền",
            dataIndex: "total",
            align: "right",
            width: 130,
            render: (text: number) => (
                <div className="font-medium text-[#f80] text-[15px]">
                    {handleFormatCurrency(text)}
                </div>
            ),
        },
        {
            title: "Tài khoản nhận tiền",
            dataIndex: "receiver_stripe_account_id",
            align: "center",
            render: (text: string) => <div>{text}</div>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 200,
            align: "center",
            render: (text: string, record: any) => {
                const item = handleGetLabelFromValue(ORDER_STATUS, text);
                return (
                    <>
                        {text === ORDER_STATUS.DELIVERED.VALUE ||
                        text === ORDER_STATUS.DERLIVERING.VALUE ||
                        text === ORDER_STATUS.PROCESSING.VALUE ? (
                            <Select
                                loading={loadingUpdateStatus}
                                rootClassName="w-full"
                                onChange={(value) =>
                                    handleChangeOrderStatus(record?._id, value)
                                }
                                value={record?.status}
                                options={options}
                            />
                        ) : (
                            <Tag color={item.color}>{item.label}</Tag>
                        )}
                    </>
                );
            },
        },
        {
            title: "",
            align: "center",
            width: 140,
            render: (text: string, record: any) => (
                <Flex gap={15} align="center" justify="center">
                    <Tooltip title="Chi tiết đơn hàng">
                        <EyeOutlined
                            onClick={() => {
                                setIsOpenDetailModal(true);
                                setOrderDetail(record);
                            }}
                            style={{ fontSize: "20px", cursor: "pointer" }}
                            className="hover:text-[#f80]"
                        />
                    </Tooltip>
                    {record?.status ===
                        ORDER_STATUS.WAITING_FOR_PAYMENT.VALUE ||
                    record?.status === ORDER_STATUS.PROCESSING.VALUE ? (
                        <Tooltip title="Hủy đơn hàng">
                            {loadingUpdateStatus ? (
                                <Flex
                                    className="w-fit h-full"
                                    align="center"
                                    justify="center"
                                >
                                    <Spin size="small" />
                                </Flex>
                            ) : (
                                <CloseOutlined
                                    onClick={() => handleCancelOrder(record)}
                                    style={{
                                        fontSize: "18px",
                                        cursor: "pointer",
                                    }}
                                    className="!text-[red]"
                                />
                            )}
                        </Tooltip>
                    ) : (
                        ""
                    )}
                </Flex>
            ),
        },
    ];

    if (loadingGetOrders) {
        return (
            <Center>
                <Spin size={"default"} />
            </Center>
        );
    }

    if (ordersData?.orders?.length === 0) {
        return (
            <Center>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Center>
        );
    }

    return (
        <div className={"h-[calc(100vh_-_400px)] scrollbar-thin"}>
            {type === "selling" ? (
                <Table
                    columns={columns as any}
                    dataSource={ordersData?.orders}
                    loading={loadingGetOrders}
                    className={"order-table custom-table"}
                    pagination={{
                        total: ordersData?.total,
                        pageSize: 10,
                        current: filter.page,
                        onChange(page, pageSize) {
                            dispatch(setFilter({ ...filter, page }));
                        },
                    }}
                />
            ) : (
                <BuyingOrder
                    handleReceivedOrder={handleReceivedOrder}
                    orderToDelete={orderToDelete}
                    setOrderToDelete={setOrderToDelete}
                    handleCancelOrder={handleCancelOrder}
                    ordersData={ordersData}
                    loadingUpdateStatus={loadingUpdateStatus}
                    setIsOpenDetailModal={setIsOpenDetailModal}
                    setOrderDetail={setOrderDetail}
                />
            )}
            {orderDetail && (
                <DetailModal
                    authUser={authUser as UserProfile}
                    openModal={isOpenDetailModal}
                    setOpenDetailModal={setIsOpenDetailModal}
                    order={orderDetail}
                    type={type}
                />
            )}
        </div>
    );
}
