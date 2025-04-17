import InputWithLabel from "@/components/InputWithLabel";
import { RootState } from "@/store/configureStore";
import { setIsOpenConfirmSell, setOrder } from "@/store/slices/order";
import { Flex, Modal, Radio, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CheckOutlined } from "@ant-design/icons";
import {
    getNotification,
    handleFormatCurrency,
    handleGetLabelFromValue,
    isValidPhone,
} from "../../../../../../utils/helper";
import {
    PAYMENT_METHOD,
    PRODUCT_CONDITION,
    SERVER_ERROR_MESSAGE,
} from "../../../../../../utils/constants";
import { useEffect, useState } from "react";
import { requestCreateOrder } from "@/api/order";

const ProductInformation = ({
    label,
    value,
}: {
    label: string;
    value: any;
}) => (
    <Flex className="text-[16px]" gap={5} align="center">
        <Flex className="font-medium" gap={8} align="center">
            <CheckOutlined />
            {label}:
        </Flex>
        {value}
    </Flex>
);

export default function CreateOrderModal({
    creatingPost,
    getMyPosts,
}: {
    creatingPost: any;
    getMyPosts: () => void;
}) {
    const { isOpenConfirmationSellingPopup, order } = useSelector(
        (state: RootState) => state.order
    );
    const [disabledSubmitBtn, setDisabledSubmitBtn] = useState<boolean>(true);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const dispatch = useDispatch();

    const handleChangeOrderData = (value: string, key: string) => {
        dispatch(
            setOrder({
                ...order,
                [key]: value,
            })
        );
    };

    const handleCreateOrder = () => {
        setLoadingCreate(true);
        requestCreateOrder(order)
            .then(() => {
                getNotification(
                    "success",
                    "Tạo đơn hàng thành công, thông tin đã được thông báo đến người mua"
                );
                getMyPosts();
                dispatch(setIsOpenConfirmSell(false));
            })
            .catch((err) => {
                getNotification(
                    "error",
                    err?.response?.data || SERVER_ERROR_MESSAGE
                );
            })
            .finally(() => {
                setLoadingCreate(false);
            });
    };

    useEffect(() => {
        let isNotFullValues = false;
        Object.values(order).forEach((value) => {
            if (!value) {
                isNotFullValues = true;
                return;
            }
        });
        if (order.customer_phone && !isValidPhone(order.customer_phone)) {
            setDisabledSubmitBtn(true);
        } else {
            setDisabledSubmitBtn(isNotFullValues);
        }
    }, [order]);

    return (
        <Modal
            open={isOpenConfirmationSellingPopup}
            onClose={() => dispatch(setIsOpenConfirmSell(false))}
            onCancel={() => dispatch(setIsOpenConfirmSell(false))}
            onOk={handleCreateOrder}
            okText={"Tạo đơn"}
            okButtonProps={{
                style: {
                    background: "#f80",
                    fontSize: "16px",
                    height: "35px",
                    marginTop: "15px",
                },
                disabled: disabledSubmitBtn,
                loading: loadingCreate,
            }}
            cancelButtonProps={{
                style: { fontSize: "16px", height: "35px", marginTop: "15px" },
            }}
            maskClosable={false}
            title={<div className="text-[20px]">Tạo đơn hàng</div>}
            width={600}
        >
            <Flex gap={20} vertical>
                <Flex vertical>
                    <div className="text-[18px] font-medium">
                        Thông tin khách hàng
                    </div>
                    <Flex vertical className="mt-1" gap={10}>
                        <Flex gap={10} justify="space-between">
                            <InputWithLabel
                                label="Họ và tên"
                                value={order.customer_name}
                                isRequired
                                width={"w-1/2"}
                                onChange={(e) =>
                                    handleChangeOrderData(
                                        e.target.value,
                                        "customer_name"
                                    )
                                }
                            />
                            <InputWithLabel
                                label="Số điện thoại"
                                value={order.customer_phone}
                                isRequired
                                width={"w-1/2"}
                                onChange={(e) =>
                                    handleChangeOrderData(
                                        e.target.value,
                                        "customer_phone"
                                    )
                                }
                            />
                        </Flex>
                        <InputWithLabel
                            label="Địa chỉ nhận hàng"
                            value={order.customer_address}
                            isRequired
                            onChange={(e) =>
                                handleChangeOrderData(
                                    e.target.value,
                                    "customer_address"
                                )
                            }
                        />
                    </Flex>
                </Flex>
                <Flex vertical>
                    <div className="text-[18px] font-medium">
                        Thông tin sản phẩm
                    </div>
                    <Flex vertical>
                        <ProductInformation
                            label="Tên sản phẩm"
                            value={creatingPost?.title}
                        />
                        <ProductInformation
                            label="Giá sản phẩm"
                            value={
                                creatingPost?.product?.price ? (
                                    <div className="text-[#f80] font-medium">
                                        {handleFormatCurrency(
                                            creatingPost?.product
                                                ?.price as number
                                        )}
                                    </div>
                                ) : (
                                    <Tag
                                        className={
                                            "w-fit text-[14px] mb-1.5 mt-1.5"
                                        }
                                        color={"cyan"}
                                    >
                                        Đồ cho tặng
                                    </Tag>
                                )
                            }
                        />
                        <ProductInformation
                            label="Tình trạng"
                            value={
                                handleGetLabelFromValue(
                                    PRODUCT_CONDITION,
                                    creatingPost?.product?.condition as string
                                ).label
                            }
                        />
                    </Flex>
                </Flex>
                <Flex vertical>
                    <Flex align="center" justify="space-between">
                        <div className="text-[18px] font-medium">
                            Phương thức thanh toán
                        </div>
                        <Radio.Group value={order.payment_method}>
                            <Radio
                                className="ml-3 text-[16px]"
                                value={PAYMENT_METHOD.CREDIT.VALUE}
                            >
                                {PAYMENT_METHOD.CREDIT.LABEL}
                            </Radio>
                        </Radio.Group>
                    </Flex>
                    <Flex gap={10} vertical className="mt-2">
                        <InputWithLabel
                            isRequired
                            onChange={(e) =>
                                handleChangeOrderData(
                                    e.target.value,
                                    "receiver_stripe_account_id"
                                )
                            }
                            label="Tài khoản nhận tiền"
                            value={order.receiver_stripe_account_id}
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Modal>
    );
}
