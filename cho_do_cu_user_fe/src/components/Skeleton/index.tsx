import React from "react";
import {Flex} from "antd";

export default function Skeleton({loading, width}: {loading: boolean, width?: string}) {
    return <Flex className={width ? width : 'w-full'} >
        <Skeleton loading={loading} width={'40%'}></Skeleton>
        <Skeleton loading={loading} width={'100%'}></Skeleton>
        <Skeleton loading={loading} width={'100%'}></Skeleton>
        <Skeleton loading={loading} width={'70%'}></Skeleton>
    </Flex>
}
