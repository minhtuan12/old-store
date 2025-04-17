"use client";

import React, { useEffect, useState } from "react";
import { useFetchAllPosts } from "@/api/post";
import { useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { Col, Row, Skeleton } from "antd";
import PostItem from "@/app/(main)/components/PostItem";
import { Post } from "../../../../../utils/types";

export default function MoreLoadedPosts({
    regions,
    total,
    searchParams,
    posts
}: {
    regions: any;
    total: number;
    searchParams: any;
    posts: any
}) {
    const [loading, setLoading] = useState(false);

    const {
        data: postsData,
        isLoading: loadingGetPosts,
        mutate: getAllPosts,
    } = useFetchAllPosts(
        {
            filter: {searchParams, page: 2},
        },
        () => {}
    );

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight && total > posts?.length
            ) {
                if (!loading) {
                    setLoading(true);
                    getAllPosts();
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading]);

    if (loadingGetPosts) {
        return <Skeleton />;
    }

    return (
        <Row gutter={[24, 24]}>
            {postsData?.posts?.map((item: Post) => (
                <Col
                    key={item?._id}
                    xxl={6}
                    xl={8}
                    lg={8}
                    md={8}
                    sm={8}
                    xs={24}
                >
                    <PostItem key={item._id} post={item} regions={regions} />
                </Col>
            ))}
        </Row>
    );
}
