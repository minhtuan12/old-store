"use client";

import BreadcrumbUpdater from "@/components/BreadcrumbUpdater";
import { Select, Tabs, TabsProps } from "antd";
import { ShoppingFilled, ShopFilled } from "@ant-design/icons";
import OrderTab from "./components/OrderTab";
import { ORDER_STATUS } from "../../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { setFilter } from "@/store/slices/order";
import { useEffect } from "react";

const TabItem = ({ children }: { children: React.ReactNode }) => (
    <div className={"flex gap-[6px] items-center"}>{children}</div>
);

const orderStatusOptions = Object.values(ORDER_STATUS).map((item) => ({
    label: item.LABEL,
    value: item.VALUE,
}));

export default function Order({ searchParams }: { searchParams: any }) {
    const { filter } = useSelector((state: RootState) => state.order);
    const dispatch = useDispatch();
    const tabKeys = ["selling-order", "buying-order"];
    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: "Đơn hàng",
        },
    ];
    const defaultActiveKey =
        searchParams?.tab && tabKeys?.includes(searchParams?.tab)
            ? searchParams?.tab
            : "approved";

    const tabItems: TabsProps["items"] = [
        {
            key: "selling-order",
            label: (
                <TabItem>
                    {/* <ShopFilled className={"dropdown-icon"} /> */}
                    Đơn bán
                </TabItem>
            ),
            children: <OrderTab type="selling" />,
        },
        {
            key: "buying-order",
            label: (
                <TabItem>
                    {/* <ShoppingFilled className={"dropdown-icon"} /> */}
                    Đơn mua
                </TabItem>
            ),
            children: <OrderTab type="buying" />,
        },
    ];

    useEffect(() => {
        if (
            orderStatusOptions
                .map((item) => item.value)
                .includes(searchParams?.status)
        ) {
            dispatch(
                setFilter({ ...filter, status: searchParams?.status, page: 1 })
            );
        }
    }, [searchParams?.status]);

    return (
        <>
            <div className={"w-full pt-3"}>
                <BreadcrumbUpdater
                    className={"mb-5"}
                    breadcrumbData={breadcrumbData}
                    title={"Đơn hàng"}
                />
                <div className={`bg-[#fff] w-full h-auto rounded-[12px] pt-8`}>
                    <div className={"w-full px-8 pb-8 custom-tabs"}>
                        <div className="main-select w-full">
                            <Select
                                className="w-full"
                                onChange={(value) =>
                                    dispatch(
                                        setFilter({
                                            ...filter,
                                            status: value,
                                            page: 1,
                                        })
                                    )
                                }
                                allowClear
                                options={orderStatusOptions}
                                placeholder="Lọc theo trạng thái đơn"
                                value={filter.status}
                            />
                        </div>
                        <Tabs
                            items={tabItems}
                            destroyInactiveTabPane
                            defaultActiveKey={defaultActiveKey}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
