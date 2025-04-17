import React, { useEffect, useMemo } from "react";
import { Col, Empty, Flex, Row, Spin } from "antd";
import { Post, UserProfile } from "../../../../../../utils/types";
import { useFetchSellingPosts } from "../../api";
import { POST_STATUS } from "../../../../../../utils/constants";
import PostItem from "@/app/(main)/components/PostItem";
import { handleExportTimeAgo } from "../../../../../../utils/helper";

export default function BoughtOrSoldTab({
    status,
    isNotMe,
    user,
    regions,
}: {
    status: string;
    isNotMe: boolean;
    user: UserProfile | null;
    regions: any;
}) {
    const {
        data: posts,
        isLoading,
        mutate: getPostsByStatus,
    } = useFetchSellingPosts(user?._id, status);

    const userFullname = useMemo(() => {
        if (user?._id) {
            return user?.firstname + " " + user?.lastname;
        }
        return "";
    }, [user?._id]);

    const isApprovedPosts = useMemo(() => {
        return status === POST_STATUS.APPROVED.VALUE;
    }, [status]);

    useEffect(() => {
        if (user?._id) {
            getPostsByStatus();
        }
    }, [user?._id]);

    if (isLoading) {
        return (
            <Flex align="center" justify="center" className="w-full h-full">
                <Spin />
            </Flex>
        );
    }

    return (
        <div>
            {posts?.length === 0 ? (
                <Empty
                    description={
                        <div className="font-semibold">
                            {isApprovedPosts
                                ? `${
                                      isNotMe ? userFullname : "Bạn"
                                  } chưa có bài đăng nào`
                                : `${
                                      isNotMe ? userFullname : "Bạn"
                                  } chưa bán sản phẩm nào`}
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Row gutter={[24, 18]}>
                    {posts?.map((post: Post) => {
                        if (isApprovedPosts)
                            return (
                                <Col
                                    key={post?._id}
                                    xxl={4}
                                    xl={5}
                                    lg={7}
                                    md={8}
                                    sm={10}
                                    xs={24}
                                >
                                    <PostItem post={post} regions={regions} />
                                </Col>
                            );
                        return (
                            <Flex
                                vertical
                                className="w-full h-fit py-4 px-6 border-[1px] rounded-lg"
                            >
                                <div className="font-semibold text-[16px]">
                                    {post?.title}
                                </div>
                                <div>
                                    Đã bán{" "}
                                    {handleExportTimeAgo(
                                        post?.updatedAt as string
                                    )}
                                </div>
                            </Flex>
                        );
                    })}
                </Row>
            )}
        </div>
    );
}
