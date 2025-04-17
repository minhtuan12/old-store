import { Avatar, Divider, Flex, Rate } from "antd";
import React from "react";
import { Rating } from "../../../../../../../../utils/types";
import { UserOutlined } from "@ant-design/icons";
import { handleExportTimeAgo } from "../../../../../../../../utils/helper";

export default function UserRating({ rating }: { rating: Rating }) {
    const reviewer = rating?.reviewer;

    return (
        <Flex vertical>
            <Flex justify="space-between" align="center">
                <Flex gap={15}>
                    {reviewer?.avatar ? (
                        <Avatar
                            src={reviewer?.avatar}
                            size={"large"}
                            className="w-[40px] h-[40px] border-[1px] border-[#f80]"
                        />
                    ) : (
                        <Avatar
                            icon={<UserOutlined />}
                            size={"large"}
                            className="w-[40px] h-[40px] border-[1px] border-[#f80]"
                        />
                    )}
                    <Flex
                        gap={5}
                        vertical
                        className="min-w-[400px] max-w-[400px]"
                    >
                        <div className="font-semibold text-[16px]">
                            {reviewer?.firstname + " " + reviewer?.lastname}
                        </div>
                        <div
                            style={{
                                overflowWrap: "break-word",
                            }}
                        >
                            {rating?.comment}
                        </div>
                    </Flex>
                </Flex>
                <Flex vertical align="end" gap={5}>
                    <Rate allowHalf value={rating?.stars || 0} disabled />
                    <div>
                        {handleExportTimeAgo(rating?.createdAt as string)}
                    </div>
                </Flex>
            </Flex>
            <Divider variant="dashed" />
        </Flex>
    );
}
