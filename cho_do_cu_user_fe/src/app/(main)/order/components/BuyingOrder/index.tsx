"use client";

import {
    getNotification,
    handleFormatCurrency,
    handleGetLabelFromValue,
} from "../../../../../../utils/helper";
import { Flex, Image, Modal, Popconfirm, Spin, Tag, Tooltip } from "antd";
import { requestPayOrder } from "../OrderTab/api";
import { Order } from "../../../../../../utils/types";
import {
    CheckOutlined,
    CloseOutlined,
    CreditCardOutlined,
    EyeOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import {
    ORDER_STATUS,
    SERVER_ERROR_MESSAGE,
} from "../../../../../../utils/constants";

interface IProps {
    orderToDelete: Order | null;
    loadingUpdateStatus: boolean;
    ordersData: { total: number; orders: Order[] };
    setOrderToDelete: (order: Order | null) => void;
    handleCancelOrder: (order: Order) => void;
    setIsOpenDetailModal: (isOpen: boolean) => void;
    setOrderDetail: (order: Order) => void;
    handleReceivedOrder: (orderId: string) => void;
}

export default function BuyingOrder({
    orderToDelete,
    ordersData,
    loadingUpdateStatus,
    setOrderToDelete,
    handleReceivedOrder,
    handleCancelOrder,
    setIsOpenDetailModal,
    setOrderDetail,
}: IProps) {
    return (
        <>
            <Flex
                vertical
                className="h-full overflow-auto scrollbar-thin px-3 py-2"
                gap={30}
            >
                {ordersData?.orders?.map((order: Order) => {
                    const orderStatus = handleGetLabelFromValue(
                        ORDER_STATUS,
                        order?.status
                    );

                    return (
                        <Flex
                            key={order?._id}
                            className="rounded-lg shadow-[rgba(0,_0,_0,_0.16)_0px_1px_4px] p-4"
                            align="center"
                            justify="space-between"
                            wrap
                            gap={30}
                        >
                            <Flex gap={25} wrap>
                                <Image
                                    src={order?.product?.images?.[0]}
                                    width={100}
                                />
                                <Flex vertical>
                                    <div className="font-medium text-[18px] w-full text-ellipsis overflow-hidden">
                                        Mã đơn hàng: {order?.code}
                                    </div>
                                    <div className="text-[16px] w-full">
                                        {order?.post?.title}
                                    </div>
                                    <div className="text-[16px] w-full">
                                        Mô tả: {order?.product?.description}
                                    </div>
                                    <div className="text-[16px] w-full">
                                        Địa chỉ nhận hàng: {order?.customer_address}
                                    </div>
                                    <div className="text-[18px] text-[#f80] font-medium w-full">
                                        {handleFormatCurrency(
                                            order?.total as number
                                        )}
                                    </div>
                                    <Tag
                                        color={orderStatus.color}
                                        className="w-fit mt-1"
                                    >
                                        {orderStatus?.label}
                                    </Tag>
                                </Flex>
                            </Flex>
                            <Flex
                                gap={15}
                                align="center"
                                justify="center"
                                className="mr-12"
                            >
                                {order?.status ===
                                ORDER_STATUS.WAITING_FOR_PAYMENT.VALUE ? (
                                    <Tooltip title="Thanh toán đơn hàng">
                                        <div
                                            onClick={() => {
                                                requestPayOrder(order?._id)
                                                    .then((res) => {
                                                        window.location.href =
                                                            res?.data;
                                                    })
                                                    .catch((err) => {
                                                        getNotification(
                                                            "error",
                                                            err?.response
                                                                ?.data ||
                                                                SERVER_ERROR_MESSAGE
                                                        );
                                                    });
                                            }}
                                            className="cursor-pointer rounded-[50%] bg-[#a7d2fd] hover:bg-[#7eb9f4] w-fit h-fit flex items-center justify-center p-3"
                                        >
                                            <CreditCardOutlined
                                                style={{
                                                    fontSize: "20px",
                                                }}
                                            />
                                        </div>
                                    </Tooltip>
                                ) : (
                                    ""
                                )}
                                <Tooltip title="Chi tiết đơn hàng">
                                    <div
                                        onClick={() => {
                                            setIsOpenDetailModal(true);
                                            setOrderDetail(order);
                                        }}
                                        className="cursor-pointer rounded-[50%] bg-[#ffb561] hover:bg-[#f80] w-fit h-fit flex items-center justify-center p-3"
                                    >
                                        <EyeOutlined
                                            style={{
                                                fontSize: "20px",
                                            }}
                                        />
                                    </div>
                                </Tooltip>
                                {order?.status ===
                                ORDER_STATUS.DELIVERED.VALUE ? (
                                    <Tooltip title="Đã nhận hàng">
                                        {loadingUpdateStatus ? (
                                            <Flex
                                                className="w-fit h-full"
                                                align="center"
                                                justify="center"
                                            >
                                                <Spin size="small" />
                                            </Flex>
                                        ) : (
                                            <div
                                                onClick={() =>
                                                    handleReceivedOrder(
                                                        order._id
                                                    )
                                                }
                                                className="cursor-pointer rounded-[50%] bg-[#71e879] hover:bg-[#45d04e] w-fit h-fit flex items-center justify-center p-3"
                                            >
                                                <CheckOutlined
                                                    style={{
                                                        fontSize: "18px",
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Tooltip>
                                ) : (
                                    ""
                                )}
                                {order?.status ===
                                    ORDER_STATUS.WAITING_FOR_PAYMENT.VALUE ||
                                order?.status ===
                                    ORDER_STATUS.PROCESSING.VALUE ? (
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
                                            <div
                                                onClick={() =>
                                                    setOrderToDelete(order)
                                                }
                                                className="cursor-pointer rounded-[50%] bg-[#ff5b5b] hover:bg-[red] w-fit h-fit flex items-center justify-center p-3"
                                            >
                                                <CloseOutlined
                                                    style={{
                                                        fontSize: "18px",
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Tooltip>
                                ) : (
                                    ""
                                )}
                            </Flex>
                        </Flex>
                    );
                })}
            </Flex>
            <Modal
                title={
                    <div className={"text-[17px]"}>
                        Hủy đơn hàng <br />
                        (ORD-{orderToDelete?._id})
                    </div>
                }
                open={!!orderToDelete}
                onOk={() => {
                    if (orderToDelete) {
                        handleCancelOrder(orderToDelete);
                    }
                }}
                onCancel={() => {
                    setOrderToDelete(null);
                }}
                okButtonProps={{
                    className: "main-delete-btn",
                    loading: loadingUpdateStatus,
                }}
                okText={"Xác nhận"}
                cancelText={"Đóng"}
                width={400}
            >
                <div className={"text-[14px]"}>
                    Bạn có chắc chắn muốn hủy đơn hàng này không?
                </div>
            </Modal>
        </>
    );
}
