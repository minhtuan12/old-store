import React from "react";
import {Result} from "antd";
import Link from "next/link";
import Button from "@/components/Button";

export default function Page() {
    return <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập"
        extra={<Link href={'/'} type="primary"><Button>Trở về trang chủ</Button></Link>}
    />
}
