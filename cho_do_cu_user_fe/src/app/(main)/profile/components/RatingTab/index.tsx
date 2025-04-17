import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Col, Divider, Empty, Flex, Rate, Row, Spin, Tag } from "antd";
import { Post, Rating, UserProfile } from "../../../../../../utils/types";
import { useFetchRatings } from "../../api";
import UserRating from "./components/UserRating";
import InputWithLabel from "@/components/InputWithLabel";
import DefaultButton from "@/components/Button";
import { requestRateUser } from "@/api/rating";
import { getNotification } from "../../../../../../utils/helper";
import { SERVER_ERROR_MESSAGE } from "../../../../../../utils/constants";
import { useAuthUser } from "@/hooks/useAuthUser";
import Link from "next/link";

interface IRating {
    comment: string;
    ratingCount: number;
}

const suggestedComments = [
    "Quá tuyệt vời",
    "Giao dịch tốt",
    "Sản phẩm chất lượng",
    "Thương lượng nhanh chóng",
];

export default function RatingTab({
    getUserProfile,
    isNotMe,
    user,
}: {
    getUserProfile: () => void;
    isNotMe: boolean;
    user: UserProfile | null;
}) {
    const { authUser } = useAuthUser();
    const {
        data: ratings,
        isLoading,
        mutate: getRatings,
    } = useFetchRatings(user?._id);
    const [rating, setRating] = useState<IRating>({
        comment: "",
        ratingCount: 0,
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const userFullname = useMemo(() => {
        if (user?._id) {
            return user?.firstname + " " + user?.lastname;
        }
        return "";
    }, [user?._id]);

    const handleSubmit = () => {
        setLoadingSubmit(true);
        requestRateUser({
            revieweeId: user?._id as string,
            comment: rating.comment,
            star: rating.ratingCount,
        })
            .then(() => {
                getNotification("success", "Đánh giá thành công");
                getUserProfile();
                getRatings();
                setRating({
                    comment: "",
                    ratingCount: 0,
                });
            })
            .catch(() => {
                getNotification("error", SERVER_ERROR_MESSAGE);
            })
            .finally(() => {
                setLoadingSubmit(false);
            });
    };

    useEffect(() => {
        if (user?._id) {
            getRatings();
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
        <div className="mt-3">
            {isNotMe ? (
                <Flex gap={15} className="w-full" align="end" vertical>
                    <InputWithLabel
                        width="w-full"
                        label="Đánh giá"
                        value={rating.comment}
                        onChange={(e) =>
                            setRating({ ...rating, comment: e.target.value })
                        }
                    />
                    <Flex align="center" gap={25} wrap className="w-full mt-1">
                        <Flex className="w-1/2" justify="start">
                            <Row gutter={[12, 12]}>
                                {suggestedComments.map((comment: string) => (
                                    <Col key={comment}>
                                        <Tag
                                            onClick={() =>
                                                setRating({
                                                    ...rating,
                                                    comment,
                                                })
                                            }
                                            bordered={false}
                                            rootClassName={`text-[14px] px-2 py-1 cursor-pointer`}
                                            color={
                                                comment === rating.comment
                                                    ? "#d4d4d4"
                                                    : "volcano"
                                            }
                                        >
                                            {comment}
                                        </Tag>
                                    </Col>
                                ))}
                            </Row>
                        </Flex>
                        <Flex
                            align="center"
                            justify="end"
                            gap={25}
                            className="flex-1"
                        >
                            <Rate
                                allowHalf
                                value={rating.ratingCount}
                                onChange={(e) =>
                                    setRating({ ...rating, ratingCount: e })
                                }
                            />
                            {authUser?._id ? (
                                <DefaultButton
                                    reverseColor
                                    size="large"
                                    onClick={handleSubmit}
                                    loading={loadingSubmit}
                                >
                                    Gửi đánh giá
                                </DefaultButton>
                            ) : (
                                <Link href={`/login?redirect=profile/${user?._id}`}>
                                    <DefaultButton reverseColor size="large">
                                        Gửi đánh giá
                                    </DefaultButton>
                                </Link>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
            ) : (
                ""
            )}
            <Divider />
            {ratings?.ratings?.length === 0 ? (
                <Empty
                    description={
                        <div className="font-semibold">
                            {isNotMe ? userFullname : "Bạn"} chưa có đánh giá
                            nào
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Flex vertical gap={20}>
                    {ratings?.ratings?.map((rating: Rating) => (
                        <UserRating key={rating?._id} rating={rating} />
                    ))}
                </Flex>
            )}
        </div>
    );
}
