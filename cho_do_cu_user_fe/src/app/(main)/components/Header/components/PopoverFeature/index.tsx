import {
    ProfileOutlined,
    ShopOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import React from "react";
import { Col, Flex, Row } from "antd";
import Link from "next/link";

interface IFeature {
    icon: React.ReactElement<any, any>;
    label: string;
    link: string;
}

const features: IFeature[] = [
    {
        icon: <ProfileOutlined className={"text-[16px]"} />,
        label: "Quản lý bài đăng",
        link: "/my-post",
    },
    {
        icon: <ShoppingOutlined className={"text-[16px]"} />,
        label: "Đơn mua",
        link: "/order?tab=buying-order",
    },
    {
        icon: <ShopOutlined className={"text-[16px]"} />,
        label: "Đơn bán",
        link: "/order?tab=selling-order",
    },
    {
        icon: <ShopOutlined className={"text-[16px]"} />,
        label: "Đơn báasdasdn",
        link: "/my-post",
    },
];

const FeatureItem = ({ item }: { item: IFeature }) => {
    return (
        <Link
            href={item.link}
            className={"text-[14px] text-black hover:text-[#f80]"}
        >
            <Flex
                vertical
                align={"center"}
                justify={"center"}
                gap={5}
                className={"p-3 hover:bg-slate-100 rounded-lg"}
            >
                {item.icon}
                <div className={"w-full text-center"}>{item.label}</div>
            </Flex>
        </Link>
    );
};

export default function PopoverFeature() {
    let eachRow: IFeature[][] = [];
    for (let i = 0; i < features.length; i += 3) {
        eachRow.push(features.slice(i, i + 3));
    }

    return (
        <div className={"bg-[white] rounded-[12px] shadow-sm p-5"}>
            {eachRow.map((items: IFeature[], index: number) => (
                <Row key={index} gutter={[8, 24]}>
                    {items.map((item: IFeature) => (
                        <Col
                            key={item.link}
                            xs={24}
                            lg={12}
                            xxl={8}
                            xl={8}
                            className={"min-w-[100px]"}
                        >
                            <FeatureItem item={item} />
                        </Col>
                    ))}
                </Row>
            ))}
        </div>
    );
}
