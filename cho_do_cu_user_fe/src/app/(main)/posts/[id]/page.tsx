import React from "react";
import "../../../global.scss";
import BreadcrumbUpdater from "@/components/BreadcrumbUpdater";
import { Avatar, Col, Flex, Rate, Tag } from "antd";
import {
    handleExportTimeAgo,
    handleFormatCurrency,
    handleGetRegion,
} from "../../../../../utils/helper";
import {
    CaretRightOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    PushpinFilled,
    UserOutlined,
} from "@ant-design/icons";
import { fetchRegions } from "@/actions/public";
import Link from "next/link";
import PostAction from "@/app/(main)/posts/components/PostAction";
import DetailProductTable from "../components/DetailProductTable";
import PostItem from "../../components/PostItem";
import { POST_STATUS } from "../../../../../utils/constants";
import { redirect } from "next/navigation";
import Head from "next/head";
import SlidingImages from "../components/SlidingImages";

async function fetchDetailPost(id: string) {
    try {
        const postResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/posts/${id}`,
            { cache: "no-store" }
        );
        if (!postResponse?.ok) {
            return { post: null };
        }
        return postResponse.json();
    } catch (err) {
        return { post: null };
    }
}

async function fetchUserPost(userId: string, postId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/user/${userId}/posts`,
            { cache: "no-store" }
        );
        if (!response?.ok) {
            return { posts: null };
        }
        const posts = await response.json();
        return posts?.filter((item: any) => item?._id !== postId);
    } catch (err) {
        return { posts: null };
    }
}

export default async function PostDetail({
    params,
}: {
    params: { id: string };
}) {
    const id = params.id;
    const { post } = await fetchDetailPost(id);
    if (post?.status !== POST_STATUS.APPROVED.VALUE || post?.is_ordering) {
        return redirect("/");
    }

    const posterPosts = await fetchUserPost(post?.poster_id, post?._id);

    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: `Thông tin bài đăng`,
        },
    ];
    const { regions } = await fetchRegions();
    const location = handleGetRegion(
        regions,
        post?.location?.city,
        post?.location?.district
    );
    const poster = post?.poster;

    return (
        <>
            <Head>
                <title>Chi tiết bài đăng</title>
                <meta
                    name="description"
                    content="Chi tiết bài đăng gồm thông tin người đăng bài, chi tiết sản phẩm trong bài đăng giúp người dùng có cái nhìn tổng quan hơn về sản phẩm cũng như những bài đăng khác của chủ bài đăng"
                />
                <meta
                    name="keywords"
                    content="Chi tiết bài đăng, chi tiết, bài đăng"
                />
                <meta name="robots" content="index, follow" />
                <link
                    rel="canonical"
                    href={`https://chodocu.vercel.app/posts/${id}`}
                />
            </Head>
            <div className={"w-full pt-3"}>
                <BreadcrumbUpdater
                    className={"mb-5"}
                    breadcrumbData={breadcrumbData}
                    title={`Bài đăng`}
                />
                <div className={`bg-[#fff] w-full h-auto rounded-[12px] pt-8`}>
                    <Flex
                        className={"w-full px-8 pb-8"}
                        justify={"space-between"}
                        wrap
                        gap={30}
                    >
                        <Flex gap={30} wrap>
                            <Flex vertical>
                                <div
                                    className={
                                        "relative min-w-[300px] max-w-[300px] max-xsm:!max-w-[250px] max-xsm:!min -w-[250px] h-[300px] custom-carousel border-[1px] border-[gray] p-2 rounded-lg"
                                    }
                                >
                                    <SlidingImages
                                        images={post?.product?.images}
                                    />
                                </div>
                            </Flex>
                            <Flex
                                vertical
                                justify={"space-between"}
                                className={"flex-1"}
                            >
                                <Flex vertical>
                                    <div
                                        className={
                                            "font-semibold text-[22px] w-full overflow-hidden text-ellipsis"
                                        }
                                    >
                                        {post?.title}
                                    </div>
                                    <div className={"text-[18px]"}>
                                        {post?.product?.description}
                                    </div>
                                    <div className={"mt-1"}>
                                        {post?.product?.price ? (
                                            <div
                                                className={
                                                    "text-[24px] font-semibold text-[#f80]"
                                                }
                                            >
                                                {handleFormatCurrency(
                                                    post?.product?.price
                                                )}
                                            </div>
                                        ) : (
                                            <Tag
                                                className={
                                                    "!text-[15px] !h-[30px] w-fit !p-3 !flex !items-center !justify-center"
                                                }
                                                color={"cyan"}
                                            >
                                                Đồ cho tặng
                                            </Tag>
                                        )}
                                    </div>
                                    <Flex vertical className={"mt-3"} gap={5}>
                                        <Flex
                                            className={"text-[17px]"}
                                            gap={12}
                                        >
                                            <PhoneOutlined />
                                            {poster?.phone ? (
                                                <Link
                                                    href={`tel:${poster?.phone}`}
                                                    className={
                                                        "hover:decoration-transparent text-[#f80]"
                                                    }
                                                >
                                                    {poster?.phone}
                                                </Link>
                                            ) : (
                                                <i className={"text-gray-500"}>
                                                    Chưa cập nhật
                                                </i>
                                            )}
                                        </Flex>
                                        <Flex
                                            className={"text-[17px]"}
                                            gap={12}
                                        >
                                            <MailOutlined />
                                            {poster?.email ? (
                                                <Link
                                                    href={`mailto:${poster?.email}`}
                                                    className={
                                                        "hover:decoration-transparent text-[#f80]"
                                                    }
                                                >
                                                    {poster?.email}
                                                </Link>
                                            ) : (
                                                <i className={"text-gray-500"}>
                                                    Chưa cập nhật
                                                </i>
                                            )}
                                        </Flex>
                                        <Flex
                                            className={"text-[17px]"}
                                            gap={12}
                                        >
                                            <EnvironmentOutlined />{" "}
                                            {location?.district +
                                                ", " +
                                                location?.city}
                                        </Flex>
                                        <Flex
                                            className={"text-[17px]"}
                                            gap={12}
                                        >
                                            <ClockCircleOutlined /> Cập nhật{" "}
                                            {handleExportTimeAgo(
                                                post?.updatedAt
                                            )}
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <div className="mt-2">
                                    <PostAction
                                        posterId={post?.poster_id}
                                        postId={post?._id}
                                    />
                                </div>
                            </Flex>
                        </Flex>
                        <Link
                            href={`/profile/${poster?._id}`}
                            className="rounded-lg text-[#000] hover:text-[#000] w-fit shadow-[rgba(0,_0,_0,_0.35)_0px_2px_5px] h-fit hover:shadow-[rgba(0,_0,_0,_0.35)_0px_3px_8px]"
                        >
                            <Flex className={"p-4 flex-1 h-fit"} gap={20}>
                                <div
                                    className={
                                        "w-fit h-fit rounded-lg border-[1px] border-[#f80]"
                                    }
                                >
                                    {poster?.avatar ? (
                                        <Avatar
                                            shape="square"
                                            src={poster?.avatar}
                                            size={100}
                                            alt={
                                                poster?.firstname +
                                                " " +
                                                poster?.lastname
                                            }
                                        />
                                    ) : (
                                        <Avatar icon={<UserOutlined />} />
                                    )}
                                </div>
                                <Flex vertical justify={"space-between"}>
                                    <div className={"font-semibold"}>
                                        {poster?.firstname +
                                            " " +
                                            poster?.lastname}
                                    </div>
                                    <Flex vertical>
                                        <div
                                            className={
                                                "font-medium text-[14px]"
                                            }
                                        >
                                            Người theo dõi:{" "}
                                            {poster?.follower_ids?.length}
                                        </div>
                                        <div
                                            className={
                                                "font-medium text-[14px]"
                                            }
                                        >
                                            Đang theo dõi:{" "}
                                            {poster?.following_user_ids?.length}
                                        </div>
                                    </Flex>
                                    <Flex
                                        className={"font-medium text-[14px]"}
                                        gap={15}
                                        align={"center"}
                                    >
                                        <Rate
                                            allowHalf
                                            value={poster?.averageStars || 0}
                                            disabled
                                        />
                                        ({poster?.reviewers?.length} đánh giá)
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Link>
                    </Flex>
                </div>
                <div
                    className={`bg-[#fff] w-full h-auto rounded-[12px] py-5 px-8 mt-6`}
                >
                    <div className="font-semibold">Mô tả chi tiết</div>
                    <Flex vertical className="mt-2" gap={4}>
                        <div>{post?.title}</div>
                        <div>{post?.product?.description}</div>
                        <Flex gap={6}>
                            <PushpinFilled />
                            Địa chỉ:{" "}
                            {location?.district + ", " + location?.city}
                        </Flex>
                        <Flex gap={6}>
                            <PushpinFilled />
                            Số điện thoại:{" "}
                            {poster?.phone ? (
                                <Link
                                    href={`tel:${poster?.phone}`}
                                    className={
                                        "hover:decoration-transparent text-[#f80]"
                                    }
                                >
                                    {poster?.phone}
                                </Link>
                            ) : (
                                <i className={"text-gray-500"}>Chưa cập nhật</i>
                            )}
                        </Flex>
                        <Flex vertical className="mt-4">
                            <div className="font-semibold">
                                Chi tiết sản phẩm
                            </div>
                            {post?.product?.product_attributes?.length > 0 ? (
                                <DetailProductTable
                                    productAttributes={
                                        post?.product?.product_attributes
                                    }
                                />
                            ) : (
                                <i className="text-gray-500 mt-1">Không có</i>
                            )}
                        </Flex>
                    </Flex>
                </div>

                <div
                    className={`bg-[#fff] w-full h-auto rounded-[12px] py-5 px-8 mt-6`}
                >
                    <Flex
                        justify="space-between"
                        align="center"
                        className="w-full"
                    >
                        <div className="font-semibold">
                            Bài đăng khác của{" "}
                            {poster?.firstname + " " + poster?.lastname}
                        </div>
                        <Link
                            href={`/profile/${poster?._id}`}
                            className="font-semibold cursor-pointer flex items-center hover:text-[#f80]"
                        >
                            Xem tất cả{" "}
                            <CaretRightOutlined className="mt-[1px] ml-1" />
                        </Link>
                    </Flex>
                    <Flex
                        style={{ scrollbarGutter: "stable" }}
                        className="mt-2 w-full overflow-auto scrollbar-thin py-3"
                        gap={20}
                    >
                        {posterPosts?.length > 0 ? (
                            posterPosts?.map((post: any) => (
                                <Col
                                    key={post?._id}
                                    xxl={6}
                                    xl={6}
                                    lg={6}
                                    md={8}
                                    sm={8}
                                    xs={24}
                                >
                                    <PostItem
                                        post={post}
                                        regions={regions}
                                        className="border-2"
                                    />
                                </Col>
                            ))
                        ) : (
                            <Flex
                                className="w-full text-[#8c8c8c]"
                                justify="center"
                            >
                                Chưa có thêm bài đăng nào
                            </Flex>
                        )}
                    </Flex>
                </div>
            </div>
        </>
    );
}
