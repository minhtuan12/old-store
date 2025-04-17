import React from "react";
import { Post } from "../../../../../utils/types";
import { Flex, Tag } from "antd";
import Image from "next/image";
import {
    handleExportTimeAgo,
    handleFormatCurrency,
    handleGetRegion,
} from "../../../../../utils/helper";
import Link from "next/link";

export default function PostItem({
    post,
    regions,
    className = "",
}: {
    post: Post;
    regions: any;
    className?: string;
}) {
    const location: {
        city: string;
        district: string;
    } | null = handleGetRegion(
        regions,
        post.location.city as string,
        post.location.district as string
    );

    return (
        <Link
            href={`/posts/${post?._id}`}
            className={"text-black hover:decoration-transparent"}
        >
            <Flex
                vertical
                className={`rounded-lg p-5 w-full h-full hover:shadow-lg cursor-pointer ${className}`}
            >
                <Flex
                    className={
                        "h-[200px] w-full max-xsm:w-1/2 max-xsm:relative max-xsm:left-1/2 max-xsm:translate-x-[-50%]"
                    }
                    align={"center"}
                    justify={"center"}
                >
                    <Image
                        src={post.product?.images[0]}
                        alt={post.title as string}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "100%" }}
                        loading={"lazy"}
                    />
                </Flex>
                <Flex vertical className={"mt-1"}>
                    <div
                        className={
                            "font-medium text-[18px] w-full overflow-hidden text-ellipsis"
                        }
                    >
                        {post.title}
                    </div>
                    <div className={"mt-1"}>
                        {post.product?.price ? (
                            <span
                                className={
                                    "font-medium text-[18px] text-[#f80]"
                                }
                            >
                                {handleFormatCurrency(post.product?.price)}
                            </span>
                        ) : (
                            <Tag
                                color={"cyan"}
                                className={
                                    "!text-[15px] !h-[30px] w-fit !p-3 !flex !items-center !justify-center"
                                }
                            >
                                Đồ cho tặng
                            </Tag>
                        )}
                    </div>
                    <div className={"text-gray-500 mt-1"}>
                        {handleExportTimeAgo(post.updatedAt as string)} -{" "}
                        <span>
                            {location
                                ? location.district + ", " + location.city
                                : ""}
                        </span>
                    </div>
                </Flex>
            </Flex>
        </Link>
    );
}
