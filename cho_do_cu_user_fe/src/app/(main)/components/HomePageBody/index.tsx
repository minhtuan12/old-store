"use client";

import NextTopLoader from "nextjs-toploader";
import { ReactNode } from "react";
import Header from "../Header";
import { ToastContainer } from "react-toastify";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Flex, Spin } from "antd";

export default function HomePageBody({ children, hasCookie }: { children: ReactNode, hasCookie: boolean }) {
    const { authUser } = useAuthUser();

    if (hasCookie && !authUser) {
        return (
            <Flex className="w-full h-screen" align="center" justify="center">
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <>
            <NextTopLoader color={"#ffda21"} height={2} speed={100} />
            <div className={"relative min-h-screen"}>
                <Header />
                <div
                    className={`min-h-[calc(100vh_-_80px)] relative top-[80px] py-5 bg-[#f4f4f4] px-[16px] 2xl:px-[200px] xl:px-[200px] lg:px-[100px] md:px-[50px]`}
                >
                    {children}
                </div>
            </div>
            <ToastContainer />
        </>
    );
}
