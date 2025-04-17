import BreadcrumbUpdater from "../../../components/BreadcrumbUpdater";
import React from "react";
import { Tabs, TabsProps } from "antd";
import {
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExceptionOutlined,
    FileOutlined,
    LockOutlined,
    OrderedListOutlined,
} from "@ant-design/icons";
import Posts from "@/app/(main)/my-post/components/Posts";
import { POST_STATUS } from "../../../../utils/constants";

const TabItem = ({ children }: { children: React.ReactNode }) => (
    <div className={"flex gap-[6px] items-center"}>{children}</div>
);

export default function MyPost({ searchParams }: { searchParams: any }) {
    const tabKeys = [
        "approved",
        "draft",
        "pending",
        "rejected",
        "hidden",
        "expired",
    ];
    const defaultActiveKey =
        searchParams?.tab && tabKeys?.includes(searchParams?.tab)
            ? searchParams?.tab
            : "approved";
    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: "Quản lý bài đăng",
        },
    ];

    const tabItems: TabsProps["items"] = [
        {
            key: "approved",
            label: (
                <TabItem>
                    <OrderedListOutlined />
                    Đang hiển thị
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.APPROVED.VALUE} />,
        },
        {
            key: "draft",
            label: (
                <TabItem>
                    <FileOutlined />
                    Bản nháp
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.DRAFT.VALUE} />,
        },
        {
            key: "pending",
            label: (
                <TabItem>
                    <ClockCircleOutlined />
                    Chờ duyệt
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.PENDING.VALUE} />,
        },
        {
            key: "rejected",
            label: (
                <TabItem>
                    <CloseCircleOutlined />
                    Bị từ chối duyệt
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.REJECTED.VALUE} />,
        },
        {
            key: "hidden",
            label: (
                <TabItem>
                    <LockOutlined />
                    Đã ẩn
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.HIDDEN.VALUE} />,
        },
        {
            key: "expired",
            label: (
                <TabItem>
                    <ExceptionOutlined />
                    Hết hạn
                </TabItem>
            ),
            children: <Posts status={POST_STATUS.EXPIRED.VALUE} />,
        },
    ];

    return (
        <>
            <div className={"w-full pt-3"}>
                <BreadcrumbUpdater
                    className={"mb-5"}
                    breadcrumbData={breadcrumbData}
                    title={"Quản lý bài đăng"}
                />
                <div className={`bg-[#fff] w-full h-auto rounded-[12px] pt-8`}>
                    <div className={"w-full px-8 pb-8 custom-tabs"}>
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
