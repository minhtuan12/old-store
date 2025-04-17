import { Flex, Spin } from "antd";

export default function Loading() {
    return <Flex className="w-full h-full" align="center" justify="center">
        <Spin/>
    </Flex>
}
