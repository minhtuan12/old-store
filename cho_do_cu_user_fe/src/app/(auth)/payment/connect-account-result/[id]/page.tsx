"use client";

import DefaultButton from "@/components/Button";
import { Flex, Result, Spin } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConnectStripeAccountResult({
    params,
}: {
    params: { id: string };
}) {
    const [isLoadingRequest, setIsLoadingRequest] = useState<boolean>(false);
    const [result, setResult] = useState<{ status: string; message: string }>({
        status: "success",
        message: "Liên kết tài khoản Stripe thành công",
    });
    const [redirectBtn, setRedirectBtn] = useState({
        content: "Về trang cá nhân",
        url: "/profile",
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
