"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import DefaultAvatar from "../../../../assets/images/logos/user_default.png";
import OnlineDotIcon from "../../../../assets/images/icons/solid/online-dot.svg";
import styles from "./styles.module.scss";
import {
    BarsOutlined,
    LockOutlined,
    MailOutlined,
    MinusOutlined,
    PhoneOutlined,
    ShopOutlined,
    ShoppingOutlined,
    SmileOutlined,
    TeamOutlined,
    UserAddOutlined,
} from "@ant-design/icons";
import AccountTab from "../components/AccountTab";
import ChangePasswordTab from "../components/ChangePasswordTab";
import Link from "next/link";
import { Flex, Rate, Skeleton, Tabs, TabsProps } from "antd";
import Button from "@/components/Button";
import Image from "next/image";
import { setPageTitle } from "@/store/slices/app";
import { useAuthUser } from "@/hooks/useAuthUser";
import { handleGetProfile } from "@/actions/auth";
import { UserProfile } from "../../../../../utils/types";
import KidInformationTab from "@/app/(main)/profile/components/KidInformationTab";
import BreadcrumbUpdater from "../../../../components/BreadcrumbUpdater";
import { getNotification, handleGetRegion } from "../../../../../utils/helper";
import { useFetchRegions } from "@/api/location";
import {
    requestFollowUser,
    requestUnfollowUser,
    useFetchPosterProfile,
} from "@/api/profile";
import SellingOrSoldTab from "../components/BoughtOrSoldTab";
import {
    POST_STATUS,
    SERVER_ERROR_MESSAGE,
} from "../../../../../utils/constants";
import RatingTab from "../components/RatingTab";
import { useRouter } from "next/navigation";
import Head from "next/head";

const TabItem = ({ children }: { children: React.ReactNode }) => (
    <div className={"flex gap-[6px] items-center"}>{children}</div>
);

export default function Profile({ params }: { params: { slug: string } }) {
    const id = params.slug?.[0];
    const dispatch = useDispatch();
    const { authUser } = useAuthUser();
    const [user, setUser] = useState<UserProfile | null>(null);
    const { data: regionsData } = useFetchRegions(() => {
        setUser({
            ...user,
            address: {
                city: null,
                district: null,
                ward: null,
                detail: "",
            },
        } as UserProfile);
    });
    const [isAuthUser, setIsAuthUser] = useState<boolean>(false);
    const [tabIndex, setTabIndex] = useState<string>("account");
    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: "Trang cá nhân",
        },
    ];
    const router = useRouter();
    const { data: userProfile, mutate: getUserProfile } = useFetchPosterProfile(
        id,
        () => {
            getNotification("error", "Không thể lấy thông tin người dùng");
            router.push("/");
        }
    );
    const isFollowed = useMemo(() => {
        return (user?.follower_ids as string[])?.includes(authUser?._id as string);
    }, [authUser?._id, user]);

    useEffect(() => {
        dispatch(setPageTitle("Trang cá nhân"));
    }, [dispatch]);

    useEffect(() => {
        if (userProfile) {
            setUser(userProfile);
        }
    }, [userProfile]);

    useEffect(() => {
        if (authUser && authUser?._id === id) {
            router.push("/profile");
            return;
        }
        async function getProfile() {
            if (id) {
                getUserProfile();
            } else {
                handleGetProfile().then((user) => setUser(user));
            }
        }

        getProfile();
        setIsAuthUser(!id);
        setTabIndex(id ? "selling" : "account");
    }, [id, authUser]);

    const handleChangeTab = (chosenTab: string): void => {
        setTabIndex(chosenTab);
        // dispatch(setTab(chosenTab))
    };

    const handleConfirmUpdateProfile = (user: UserProfile) => {
        setUser(user);
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "account",
            label: (
                <TabItem>
                    <BarsOutlined />
                    Thông tin tài khoản
                </TabItem>
            ),
            children: (
                <AccountTab
                    handleConfirmUpdateProfile={handleConfirmUpdateProfile}
                />
            ),
        },
        {
            key: "kid-info",
            label: (
                <TabItem>
                    <TeamOutlined />
                    Thông tin về con
                </TabItem>
            ),
            children: <KidInformationTab />,
        },
        {
            key: "password",
            label: (
                <TabItem>
                    <LockOutlined /> Đổi mật khẩu
                </TabItem>
            ),
            children: <ChangePasswordTab />,
        },
        {
            key: "selling",
            label: (
                <TabItem>
                    <ShopOutlined />
                    Đang bán
                </TabItem>
            ),
            children: (
                <SellingOrSoldTab
                    status={POST_STATUS.APPROVED.VALUE}
                    regions={regionsData?.regions}
                    isNotMe={!!id}
                    user={user}
                />
            ),
        },
        {
            key: "sold",
            label: (
                <TabItem>
                    <ShoppingOutlined />
                    Đã bán
                </TabItem>
            ),
            children: (
                <SellingOrSoldTab
                    status={POST_STATUS.DONE.VALUE}
                    regions={regionsData?.regions}
                    isNotMe={!!id}
                    user={user}
                />
            ),
        },
        {
            key: "ratings",
            label: (
                <TabItem>
                    <SmileOutlined />
                    Đánh giá
                </TabItem>
            ),
            children: (
                <RatingTab
                    isNotMe={!!id}
                    user={user}
                    getUserProfile={getUserProfile}
                />
            ),
        },
    ];

    const userAddress = useMemo(() => {
        if (user?.address?.city && regionsData) {
            const location = handleGetRegion(
                regionsData?.regions,
                user?.address?.city,
                user?.address?.district as string
            );
            return location?.district + ", " + location?.city;
        }
        return "Chưa cập nhật";
    }, [user?._id, regionsData]);

    const [loadingFollowBtn, setLoadingFollowBtn] = useState<boolean>(false);
    const handleFollowOrUnfollowUser = () => {
        if (id) {
            setLoadingFollowBtn(true);
            if (!isFollowed) {
                requestFollowUser(id)
                    .finally(() => {
                        getUserProfile();
                    })
                    .catch(() => {
                        getNotification("error", SERVER_ERROR_MESSAGE);
                    })
                    .finally(() => {
                        setLoadingFollowBtn(false);
                    });
            } else {
                requestUnfollowUser(id)
                    .finally(() => {
                        getUserProfile();
                    })
                    .catch(() => {
                        getNotification("error", SERVER_ERROR_MESSAGE);
                    })
                    .finally(() => {
                        setLoadingFollowBtn(false);
                    });
            }
        }
    };

    return (
        <>
            <Head>
                <title>Trang cá nhân</title>
                <meta
                    name="description"
                    content="Trang cá nhân của người dùng trong hệ thống Chợ đồ cũ, bao gồm thông tin cá nhân, các bài đăng và đánh giá từ những người dùng khác"
                />
                <meta name="keywords" content="Trang cá nhân" />
                <meta name="robots" content="index, follow" />
                <link
                    rel="canonical"
                    href={`https://chodocu.vercel.app/profile/${params.slug?.[0]}`}
                />
            </Head>
            <div className={"w-full pt-3"}>
                <BreadcrumbUpdater
                    className={"mb-5"}
                    breadcrumbData={breadcrumbData}
                    title={"Trang cá nhân"}
                />
                <div className={`bg-[#fff] w-full h-auto rounded-[12px] pt-8`}>
                    <Flex
                        gap={25}
                        align={"center"}
                        className={"mx-8"}
                        wrap
                        justify={"center"}
                    >
                        {user ? (
                            <>
                                <div
                                    className={
                                        "w-[105px] relative border-[2px] border-gray-300 rounded-xl"
                                    }
                                >
                                    <Image
                                        src={user?.avatar || DefaultAvatar}
                                        alt={""}
                                        style={{
                                            borderRadius: "10px",
                                            height: "100%",
                                            width: "100%",
                                        }}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                    />
                                    <div
                                        className={
                                            "absolute right-[-9px] bottom-3 border-[3px] rounded-2xl border-white"
                                        }
                                    >
                                        <Image
                                            src={OnlineDotIcon}
                                            alt={""}
                                            width={11}
                                            height={11}
                                        />
                                    </div>
                                </div>
                                <Flex className={`flex-1`} gap={2} vertical>
                                    <Flex
                                        justify={"space-between"}
                                        align={"center"}
                                        className={styles.headerWrap}
                                    >
                                        <Flex vertical>
                                            <div
                                                className={
                                                    "font-semibold text-[20px] text-black"
                                                }
                                            >
                                                {user?.firstname +
                                                    " " +
                                                    user?.lastname}
                                            </div>
                                            <Flex
                                                wrap
                                                className={"gap-x-[30px]"}
                                            >
                                                <Flex
                                                    className={
                                                        styles.detailText
                                                    }
                                                    align={"center"}
                                                    gap={6}
                                                >
                                                    <MailOutlined />
                                                    <Link
                                                        href={`mailto: ${user?.email}`}
                                                        className={
                                                            "hover:decoration-transparent"
                                                        }
                                                    >
                                                        {user?.email}
                                                    </Link>
                                                </Flex>
                                                <Flex
                                                    className={
                                                        styles.detailText
                                                    }
                                                    align={"center"}
                                                    gap={6}
                                                >
                                                    <PhoneOutlined />
                                                    <div>
                                                        {user?.phone || (
                                                            <i>Chưa cập nhật</i>
                                                        )}
                                                    </div>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        {authUser?._id ? (
                                            !isAuthUser ? (
                                                <Button
                                                    size={"large"}
                                                    className={"cursor-pointer"}
                                                    onClick={
                                                        handleFollowOrUnfollowUser
                                                    }
                                                    loading={loadingFollowBtn}
                                                >
                                                    <UserAddOutlined />{" "}
                                                    {isFollowed
                                                        ? "Bỏ theo dõi"
                                                        : "Theo dõi"}
                                                </Button>
                                            ) : (
                                                ""
                                            )
                                        ) : (
                                            <Link
                                                href={`/login?redirect=profile/${id}`}
                                            >
                                                <Button
                                                    size={"large"}
                                                    className={"cursor-pointer"}
                                                >
                                                    <UserAddOutlined /> Theo dõi
                                                </Button>
                                            </Link>
                                        )}
                                    </Flex>

                                    <Flex
                                        justify={"space-between"}
                                        align={"center"}
                                    >
                                        <Flex vertical>
                                            <Flex
                                                className={styles.detailText}
                                                gap={6}
                                            >
                                                Địa chỉ: {userAddress}
                                            </Flex>
                                            <Flex
                                                className={styles.detailText}
                                                align={"center"}
                                                gap={1}
                                            >
                                                Người theo dõi:{" "}
                                                <span
                                                    className={
                                                        "font-semibold text-black ml-1"
                                                    }
                                                >
                                                    {user?.follower_ids
                                                        ?.length || 0}
                                                </span>
                                                <MinusOutlined rotate={90} />
                                                Đang theo dõi:{" "}
                                                <span
                                                    className={
                                                        "font-semibold text-black ml-1"
                                                    }
                                                >
                                                    {user?.following_user_ids
                                                        ?.length || 0}
                                                </span>
                                            </Flex>
                                        </Flex>
                                        <Flex
                                            vertical
                                            align="end"
                                            className="mt-2"
                                        >
                                            <Rate
                                                allowHalf
                                                value={user?.averageStars || 0}
                                                disabled
                                            />
                                            <div className="mt-1 text-[14px] text-[#6b7280]">
                                                ({user?.reviewers?.length || 0}{" "}
                                                đánh giá)
                                            </div>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </>
                        ) : (
                            <Skeleton loading={true} />
                        )}
                    </Flex>
                    <div className={"w-full px-8 mt-6 pb-8 custom-tabs"}>
                        <Tabs
                            activeKey={tabIndex}
                            items={isAuthUser ? tabItems : tabItems.slice(3)}
                            onChange={handleChangeTab}
                            destroyInactiveTabPane
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
