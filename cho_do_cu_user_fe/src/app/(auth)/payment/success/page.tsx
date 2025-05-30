"use client";

import DefaultButton from "@/components/Button";
import { Flex, Result, Spin } from "antd";
import Link from "next/link";
import { useState } from "react";

export default function PaymentSuccess() {
    const [isLoadingRequest, setIsLoadingRequest] = useState<boolean>(false);
    const [result, setResult] = useState<{ status: string; message: string }>({
        status: "success",
        message: "Thanh toán thành công",
    });
    const [redirectBtn, setRedirectBtn] = useState({
        content: "Xem trạng thái đơn hàng",
        url: "/order?tab=buying-order",
    });

    return (
        <>
            {isLoadingRequest ? (
                <Spin size={"large"} />
            ) : (
                <Result
                    status={result.status !== "success" ? "error" : "success"}
                    title={result.message}
                    extra={[
                        <Flex
                            justify="center"
                            align="center"
                            key="console"
                            className={"!w-full"}
                        >
                            <Link
                                href={redirectBtn.url}
                                className={`auth-button redirect-btn`}
                            >
                                <DefaultButton type="primary" size={"large"}>
                                    {redirectBtn.content}
                                </DefaultButton>
                            </Link>
                        </Flex>,
                    ]}
                />
            )}
        </>
    );
}
