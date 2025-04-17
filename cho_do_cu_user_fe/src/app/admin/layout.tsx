"use client";

import React, { useState } from "react";
import { StoreProvider } from "@/store/StoreProvider";
import {
    Breadcrumb,
    Button,
    ConfigProvider,
    Flex,
    Layout,
    Menu,
    Spin,
    theme,
} from "antd";
import viVN from "antd/locale/vi_VN";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import "../global.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { useAuthUser } from "../../hooks/useAuthUser";
import Sider from "antd/es/layout/Sider";
import styles from "./styles.module.scss";
import {
    ContainerOutlined,
    FileDoneOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import AuthUserPopover from "@/components/Popover";
import Link from "next/link";

const AdminLayout = ({
    adminChildren,
}: Readonly<{ adminChildren?: React.ReactNode }>) => (
    <StoreProvider>
        <ConfigProvider locale={viVN}>
            <NextTopLoader color={"#1677ff"} height={2} speed={100} />
            <div className={"relative min-h-screen"}>{adminChildren}</div>
            <ToastContainer />
        </ConfigProvider>
    </StoreProvider>
);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const pathname = usePathname();
    const breadcrumb = useSelector((state: RootState) => state.app.breadcrumb);
    const { loading, authUser } = useAuthUser('admin');

    if (loading) {
        return (
            <div
                className={
                    "relative min-h-screen w-full flex justify-center items-center"
                }
            >
                <Spin size={"large"} />
            </div>
        );
    }

    if (!authUser) {
        return (
            <AdminLayout
                adminChildren={
                    <div className={styles.authWrap}>
                        <div
                            className={
                                "absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
                            }
                        >
                            {children}
                        </div>
                    </div>
                }
            />
        );
    }

    // @ts-ignore
    if (!authUser?.username) {
        window.location.href = "/forbidden";
        return;
    }

    return (
        <AdminLayout
            adminChildren={
                <Layout className={"relative min-h-screen"}>
                    <Sider trigger={null} collapsible collapsed={collapsed}>
                        <div className={"w-full h-auto py-3 px-4"}>
                            {/*<Image alt={'chodocu-logo'} src={MainLogo}/>*/}
                        </div>
                        <Menu
                            theme="dark"
                            mode="inline"
                            defaultSelectedKeys={[pathname as string]}
                            items={[
                                {
                                    key: "/admin",
                                    icon: <HomeOutlined />,
                                    label: (
                                        <Link href={"/admin"}>Tổng quan</Link>
                                    ),
                                },
                                {
                                    key: "/admin/users",
                                    icon: <UserOutlined />,
                                    label: (
                                        <Link href={"/admin/users"}>
                                            Quản lý người dùng
                                        </Link>
                                    ),
                                },
                                {
                                    key: "/admin/categories",
                                    icon: <ContainerOutlined />,
                                    label: (
                                        <Link href={"/admin/categories"}>
                                            Quản lý danh mục
                                        </Link>
                                    ),
                                },
                                {
                                    key: "/admin/posts",
                                    icon: <FileDoneOutlined />,
                                    label: (
                                        <Link href={"/admin/posts"}>
                                            Quản lý bài đăng
                                        </Link>
                                    ),
                                },
                            ]}
                        />
                    </Sider>
                    <Layout>
                        <Header
                            style={{ padding: 0, background: colorBgContainer }}
                            className={"flex items-center justify-between"}
                        >
                            <Flex align={"center"}>
                                <Button
                                    type="text"
                                    icon={
                                        collapsed ? (
                                            <MenuUnfoldOutlined />
                                        ) : (
                                            <MenuFoldOutlined />
                                        )
                                    }
                                    onClick={() => setCollapsed(!collapsed)}
                                    style={{
                                        fontSize: "16px",
                                        width: 64,
                                        height: 64,
                                    }}
                                />
                                <Breadcrumb
                                    separator=">"
                                    items={breadcrumb?.map(
                                        (item: {
                                            path: string;
                                            name: string;
                                        }): {
                                            href: string;
                                            title: string;
                                        } => ({
                                            href: item.path,
                                            title: item.name,
                                        })
                                    )}
                                />
                            </Flex>
                            <div className={"mr-6"}>
                                <AuthUserPopover
                                    authUser={authUser}
                                    items={[]}
                                />
                            </div>
                        </Header>
                        <Content
                            style={{
                                margin: "24px 16px",
                                padding: 24,
                                minHeight: 280,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {children}
                        </Content>
                    </Layout>
                </Layout>
            }
        />
    );
}
