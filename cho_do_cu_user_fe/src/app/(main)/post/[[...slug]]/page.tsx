"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { setPageTitle, setRegions } from "@/store/slices/app";
import { useDispatch, useSelector } from "react-redux";
import {
    Col,
    Flex,
    Input as RawInput,
    InputNumber,
    Row,
    Select,
    Skeleton,
    Spin,
    Tag,
    Upload,
    UploadFile,
    Modal,
} from "antd";
import {
    Attribute,
    Category,
    Post,
    Product,
    SelectOption,
    UserProfile,
} from "../../../../../utils/types";
import {
    requestGetAttributesOfCategory,
    requestGetPublicCategories,
} from "@/api/category";
import {
    beforeUpload,
    getBase64,
    getNotification,
    handleFormatCityData,
    handleGetInitialValueOfInputType,
    handleRemoveVietnameseTones,
} from "../../../../../utils/helper";
import {
    ATTRIBUTE_INPUT_TYPE,
    POST_STATUS,
    PRODUCT_CONDITION,
    SERVER_ERROR_MESSAGE,
} from "../../../../../utils/constants";
import { UploadChangeParam } from "antd/es/upload";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Image from "next/image";
import Element from "@/components/Element";
import Input from "@/components/Input";
import "../../../global.scss";
import Button from "@/components/Button";
import _, { update } from "lodash";
import { RootState } from "@/store/configureStore";
import { useFetchRegions } from "@/api/location";
import {
    requestGetPost,
    requestSaveDraftOrPost,
    requestUpdatePost,
    requestUploadPostImage,
} from "@/api/post";
import BreadcrumbUpdater from "../../../../components/BreadcrumbUpdater";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

const initialPostData = {
    title: null,
    location: {
        city: null,
        district: null,
    },
    is_draft: false,
    product: {
        description: null,
        images: [],
        price: null,
        condition: PRODUCT_CONDITION.NEW.VALUE,
        category_id: null,
        product_attributes: [],
    },
};

const conditionOptions = Object.keys(PRODUCT_CONDITION).map((key) => ({
    label: PRODUCT_CONDITION[key].LABEL,
    value: PRODUCT_CONDITION[key].VALUE,
}));

const priceOptions = [
    { label: "Bán", value: "sell" },
    { label: "Cho tặng", value: "free" },
];

export default function CreatePost({ params }: { params: { slug: string } }) {
    const id = params.slug?.[0];
    const router = useRouter();
    const dispatch = useDispatch();
    const { authUser } = useAuthUser() as { authUser: UserProfile };
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingGetPost, setLoadingGetPost] = useState(false);
    const [loadingGetCategories, setLoadingGetCategories] = useState(false);
    const [loadingGetAttributes, setLoadingGetAttributes] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null
    );
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [post, setPost] = useState<Post>(initialPostData);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);
    const [loadingSaveDraftOrPost, setLoadingSaveDraftOrPost] = useState(false);
    const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
    const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
    const regions = useSelector((state: RootState) => state.app.regions);
    const [disableSubmitPost, setDisableSubmitPost] = useState(false);
    const [focusedAttributeId, setFocusedAttributeId] = useState<string | null>(
        null
    );
    const priceOptionValue: string = useMemo(() => {
        return post.product?.price ? "sell" : "free";
    }, [post.product?.price]);
    const buttonsText = useMemo(() => {
        if (id !== "create") {
            if (post?.status === POST_STATUS.DRAFT.VALUE) {
                return [
                    {
                        text: "LƯU",
                        status: POST_STATUS.DRAFT.VALUE,
                    },
                    {
                        text: "ĐĂNG TIN",
                        status: POST_STATUS.PENDING.VALUE,
                    },
                ];
            }
            if (post?.status === POST_STATUS.APPROVED.VALUE) {
                return [
                    {
                        text: "LƯU THÔNG TIN MỚI",
                        status: POST_STATUS.PENDING.VALUE,
                    },
                ];
            }
            if (post?.status === POST_STATUS.REJECTED.VALUE) {
                return [
                    {
                        text: "YÊU CẦU DUYỆT LẠI",
                        status: POST_STATUS.PENDING.VALUE,
                    },
                ];
            }
            if (post?.status === POST_STATUS.PENDING.VALUE) {
                return [{ text: "LƯU", status: POST_STATUS.PENDING.VALUE }];
            }
        }
    }, [id, post?.status]);
    const breadcrumbData = useMemo(() => {
        if (id === "create") {
            return [
                {
                    path: "/",
                    name: "Trang chủ",
                },
                {
                    name: "Đăng tin",
                },
            ];
        }
        return [
            {
                path: "/",
                name: "Trang chủ",
            },
            {
                path: "/my-post",
                name: "Quản lý bài đăng",
            },
            {
                name: "Sửa tin",
            },
        ];
    }, [id]);

    /* Call api get categories and attributes */
    const handleGetCategories = () => {
        setLoadingGetCategories(true);
        requestGetPublicCategories()
            .then((res) => {
                setCategories(res.data.categories);
            })
            .catch(() => {
                getNotification(
                    "error",
                    "Đã xảy ra lỗi khi lấy dữ liệu danh mục"
                );
            })
            .finally(() => {
                setLoadingGetCategories(false);
            });
    };

    const handleGetAttributesOfCategory = (categoryId: string) => {
        setLoadingGetAttributes(true);
        requestGetAttributesOfCategory(categoryId)
            .then((res) => {
                setAttributes(res.data.attributes);
                if (id === "create") {
                    setPost({
                        ...post,
                        product: {
                            ...post.product,
                            product_attributes: res.data.attributes?.map(
                                (item: Attribute) => ({
                                    attribute_id: item._id,
                                    value:
                                        item.input_type ===
                                        ATTRIBUTE_INPUT_TYPE.CHECKBOX.VALUE
                                            ? []
                                            : item.input_type ===
                                              ATTRIBUTE_INPUT_TYPE.DROPDOWN
                                                  .VALUE
                                            ? item.is_required
                                                ? item.initial_value?.[0]
                                                : null
                                            : null,
                                })
                            ),
                        } as Product,
                    });
                } else {
                    const oldAttributeIds =
                        post.product?.product_attributes?.map(
                            (item: any) => item.attribute_id
                        );
                    const newAttributes = res.data.attributes?.filter(
                        (item: any) => !oldAttributeIds?.includes(item._id)
                    );
                    setPost({
                        ...post,
                        product: {
                            ...post.product,
                            product_attributes: [
                                ...(post.product?.product_attributes as any),
                                ...newAttributes?.map((item: any) => ({
                                    attribute_id: item._id,
                                    product_id: post.product_id,
                                    value: null,
                                })),
                            ],
                        } as Product,
                    });
                }
            })
            .catch(() => {
                getNotification(
                    "error",
                    "Đã xảy ra lỗi khi lấy thuộc tính của danh mục"
                );
            })
            .finally(() => {
                setLoadingGetAttributes(false);
            });
    };

    const handleChangeProductImages = (
        info: any,
        index: number | null = null
    ) => {
        getBase64(info.file.originFileObj, (url): void => {
            if (post.product) {
                const newImages =
                    index !== null
                        ? [
                              ...post.product?.images?.slice(0, index),
                              info.file.originFileObj,
                              ...post.product?.images?.slice(index + 1),
                          ]
                        : [...post.product?.images, info.file.originFileObj];

                setPost({
                    ...post,
                    product: {
                        ...post.product,
                        images: newImages,
                    },
                } as Post);
                setImageUrls([...imageUrls, url as string]);
            }
        });
    };

    const handleGetAttributeValue = (attributeId: string) => {
        const attribute:
            | {
                  attribute_id?: string;
                  value?: any;
              }
            | undefined = post.product?.product_attributes?.find(
            (item) => item?.attribute_id === attributeId
        );

        return attribute?.value || null;
    };

    const handleChangePostData = (
        value: string | string[] | null,
        type: string
    ) => {
        if (type === "city" || type === "district") {
            if (type === "city" && value) {
                const city = regions?.find(
                    (item: any): boolean =>
                        Object.keys(item)?.[0] === (value as string)
                );
                setDistrictOptions(
                    handleFormatCityData(
                        city[value as string]?.area,
                        "district"
                    )
                );
            }
            setPost({
                ...post,
                location: {
                    city:
                        type === "city"
                            ? (value as string)
                            : post.location.city,
                    district: type === "district" ? (value as string) : null,
                },
            });
        } else {
            setPost({
                ...post,
                [type]: value,
            });
        }
    };

    const handleChangeProductData = (
        value: string | string[] | null | number,
        type: string
    ) => {
        setPost({
            ...post,
            product: {
                ...post.product,
                [type]: value,
            } as Product,
        });
    };

    const handleGetValueTypeByInputType = (e: any, inputType: string) => {
        if (inputType === ATTRIBUTE_INPUT_TYPE.TEXT.VALUE) {
            return e.target.value;
        }
        if (inputType === ATTRIBUTE_INPUT_TYPE.COLOR_PICKER.VALUE) {
            return e?.toHexString();
        }
        return e;
    };

    const handleChangeAttributeValue = useCallback(
        (e: any, id: string, inputType: string) => {
            let productAttributes = _.cloneDeep(
                post.product?.product_attributes
            );
            let updatedAttributeIndex = productAttributes?.findIndex(
                (item) => item.attribute_id === id
            );

            if (
                updatedAttributeIndex !== null &&
                updatedAttributeIndex !== undefined &&
                updatedAttributeIndex !== -1 &&
                productAttributes
            ) {
                productAttributes[updatedAttributeIndex] = {
                    ...productAttributes?.[updatedAttributeIndex],
                    attribute_id: id,
                    value: handleGetValueTypeByInputType(e, inputType),
                };
            }
            setPost({
                ...post,
                product: {
                    ...post.product,
                    product_attributes: productAttributes,
                } as Product,
            });
        },
        [post]
    );

    const handleSubmitPost = (
        submitPost: Post,
        uploadedImagesUrl: string[],
        isDraftAndNoImages: boolean = false
    ) => {
        const post = {
            ...submitPost,
            product: {
                ...submitPost.product,
                images: uploadedImagesUrl,
            },
        } as Post;
        const updatedPost = {
            ...submitPost,
            product: {
                ...submitPost.product,
                images: uploadedImagesUrl,
            },
        };

        if (id === "create") {
            requestSaveDraftOrPost(post as Post)
                .then((res) => {
                    getNotification(
                        "success",
                        post.is_draft
                            ? "Lưu tin thành công"
                            : "Đăng tin thành công"
                    );
                    router.push("/my-post");
                })
                .catch((err) => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    if (isDraftAndNoImages) {
                        setLoadingSaveDraftOrPost(false);
                    }
                });
        } else {
            requestUpdatePost(id, updatedPost as Post)
                .then((res) => {
                    getNotification("success", "Cập nhật bài đăng thành công");
                    router.push("/my-post");
                })
                .catch((err) => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    if (isDraftAndNoImages) {
                        setLoadingSaveDraftOrPost(false);
                    }
                });
        }
    };

    const [showPopupAlertPendingPost, setShowPopupAlertPendingPost] =
        useState(false);
    const [submitType, setSubmitType] = useState<string | null>(null);
    const handleSubmit = (type: string) => {
        setSubmitType(type);
        if (id === "create") {
            setLoadingSaveDraftOrPost(true);
            const submitPost = {
                ...post,
                product: {
                    ...post.product,
                    category_id: selectedCategoryId,
                    product_attributes: post.product?.product_attributes?.map(
                        (item) => ({
                            ...item,
                            value: !item?.value ? null : item?.value,
                        })
                    ),
                },
                is_draft: type === "draft",
            };

            if (submitPost.product.images?.length > 0) {
                // @ts-ignore
                requestUploadPostImage(submitPost.product.images)
                    .then((res) => {
                        handleSubmitPost(submitPost as Post, res.data);
                    })
                    .catch((err) => {
                        getNotification("error", SERVER_ERROR_MESSAGE);
                    })
                    .finally(() => {
                        setLoadingSaveDraftOrPost(false);
                    });
            } else {
                handleSubmitPost(submitPost as Post, [], true);
            }
        } else if (type === POST_STATUS.PENDING.VALUE) {
            setShowPopupAlertPendingPost(true);
        }
    };

    const handleSubmitPendingPost = () => {
        setLoadingSaveDraftOrPost(true);
        const updatedPost = {
            title: post.title,
            location: {
                city: post.location.city,
                district: post.location.district,
            },
            product: {
                description: post.product?.description,
                images: post.product?.images,
                price: post.product?.price,
                condition: post.product?.condition,
                category_id: post.product?.category_id,
                product_attributes:
                    post.product?.product_attributes?.length &&
                    post.product?.product_attributes?.length > 0
                        ? post.product?.product_attributes?.map((item) => ({
                              _id: item?._id,
                              attribute_id: item?.attribute_id,
                              product_id: post?.product_id,
                              value: !item?.value ? null : item?.value,
                          }))
                        : [],
            },
            status: submitType,
        };

        const newImages = updatedPost.product.images?.filter(
            (item: any) => typeof item !== "string"
        );
        if (newImages?.length > 0) {
            // @ts-ignore
            requestUploadPostImage(newImages)
                .then((res) => {
                    handleSubmitPost(updatedPost as Post, res.data);
                })
                .catch((err) => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    setLoadingSaveDraftOrPost(false);
                });
        } else {
            handleSubmitPost(
                updatedPost as Post,
                updatedPost.product.images,
                true
            );
        }
    };

    const handleCheckDisableSubmitPost = useCallback(() => {
        let hasNoValueForRequiredAttribute: boolean = false;
        const requiredAttributeIds: string[] = attributes
            ?.filter((item: Attribute) => item?.is_required)
            ?.map((item: Attribute) => item?._id)
            ?.filter((id: string | undefined) => id !== undefined);
        post.product?.product_attributes?.forEach(
            (attribute: { attribute_id?: string; value?: any }) => {
                if (
                    requiredAttributeIds?.includes(
                        attribute?.attribute_id as string
                    )
                ) {
                    if (
                        typeof attribute?.value === "string" &&
                        !attribute?.value
                    ) {
                        hasNoValueForRequiredAttribute = true;
                    } else if (
                        typeof attribute?.value === "object" &&
                        _.isEmpty(attribute?.value)
                    ) {
                        hasNoValueForRequiredAttribute = true;
                    }
                }
            }
        );
        if (
            !post.title ||
            !post.location.city ||
            !post.location.district ||
            _.isEmpty(
                post.product?.images?.filter((item: any) => item !== "")
            ) ||
            hasNoValueForRequiredAttribute
        ) {
            setDisableSubmitPost(true);
        } else {
            setDisableSubmitPost(false);
        }
    }, [post, attributes]);

    useEffect(() => {
        dispatch(setPageTitle("Đăng tin"));
    }, [dispatch]);

    /* get regions */
    const {
        data: regionsData,
        error,
        isLoading: loadingGetRegions,
    } = useFetchRegions(() => {
        getNotification("error", "Không thể lấy thông tin địa chỉ các vùng");
    });

    useEffect(() => {
        if (id !== "create") {
            setLoadingGetPost(true);
            requestGetPost(id)
                .then((res) => {
                    if (authUser?._id && res.data.post?.poster_id !== authUser?._id) {
                        router.push("/");
                        getNotification(
                            "error",
                            "Bạn không phải chủ bài đăng này"
                        );
                    }
                    setImageUrls(res.data?.post?.product?.images || []);
                    setSelectedCategoryId(res.data?.post?.product?.category_id);
                    setPost({
                        ...res.data?.post,
                        product: {
                            ...res.data?.post?.product,
                            product_attributes:
                                res.data?.post?.product?.product_attributes?.map(
                                    (item: any) => ({
                                        ...item,
                                        attribute_id: item?.attribute_id?._id,
                                    })
                                ),
                        },
                    });
                })
                .catch((err) => {
                    router.push("/my-post");
                    getNotification("error", err.response?.data?.message);
                })
                .finally(() => {
                    setLoadingGetPost(false);
                });
        }
    }, [id, authUser?._id]);

    useEffect(() => {
        if (regionsData) {
            dispatch(setRegions(regionsData?.regions));
            setCityOptions(handleFormatCityData(regionsData?.regions, "city"));
        }
    }, [dispatch, regionsData]);

    useEffect(() => {
        handleGetCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            handleGetAttributesOfCategory(selectedCategoryId as string);
            if (id === "create") {
                setPost({
                    ...post,
                    product: {
                        ...post.product,
                        category_id: selectedCategoryId,
                        product_attributes: attributes?.map(
                            (item: Attribute) => ({
                                attribute_id: item?._id,
                                value: handleGetInitialValueOfInputType(
                                    item?.input_type
                                ),
                            })
                        ),
                    },
                } as Post);
            }
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        handleCheckDisableSubmitPost();
    }, [post]);

    useEffect(() => {
        if (post.location.city) {
            const city = regions?.find(
                (item: any): boolean =>
                    Object.keys(item)?.[0] === (post.location.city as string)
            );
            setDistrictOptions(
                handleFormatCityData(
                    city?.[post.location.city as string]?.area,
                    "district"
                )
            );
        }
    }, [regions, post.location.city]);

    useEffect(() => {
        if (authUser?._id && authUser?.address?.city && authUser?.address?.district) {
            setPost({
                ...post,
                location: {
                    city: authUser?.address?.city,
                    district: authUser?.address?.district
                }
            })
        }
    }, [authUser?._id])

    if (loadingGetPost || (id !== 'create' && post?.poster_id !== authUser?._id)) {
        return (
            <Flex
                align={"center"}
                justify={"center"}
                className={"w-full h-screen"}
            >
                <Spin />
            </Flex>
        );
    }

    return (
        <>
            <div className={"w-full pt-3"}>
                <BreadcrumbUpdater
                    className={"mb-5"}
                    breadcrumbData={breadcrumbData}
                    title={"Đăng tin"}
                />
                <div
                    className={`bg-[#fff] w-full min-h-[calc(100vh_-_300px)] h-auto rounded-[12px] py-8`}
                >
                    <Flex
                        gap={25}
                        align={"center"}
                        className={"mx-8 main-select h-full"}
                        wrap
                    >
                        {loadingGetCategories ? (
                            <Flex className="h-[calc(100vh_/_2)] w-full" justify="center" align="center">
                                <Spin />
                            </Flex>
                        ) : (
                            <Flex gap={4} vertical className={"w-full"}>
                                <div className={"font-medium text-[17px]"}>
                                    Danh mục bài đăng{" "}
                                    <span className={"required"}>*</span>
                                </div>
                                <Select
                                    placeholder={"Chọn danh mục bài đăng"}
                                    className={"w-full"}
                                    options={categories?.map(
                                        (item: Category) => ({
                                            label: item?.name,
                                            value: item?._id,
                                        })
                                    )}
                                    value={selectedCategoryId}
                                    onChange={(value) =>
                                        setSelectedCategoryId(value)
                                    }
                                />
                            </Flex>
                        )}
                        {selectedCategoryId ? (
                            <div className={"w-full h-full"}>
                                {loadingGetAttributes ? (
                                    <div className={"w-full h-full"}>
                                        <Skeleton loading={true} />
                                    </div>
                                ) : (
                                    <>
                                        <Flex vertical gap={4}>
                                            <div
                                                className={
                                                    "font-medium text-[17px]"
                                                }
                                            >
                                                Ảnh sản phẩm{" "}
                                                <span className={"required"}>
                                                    *
                                                </span>
                                            </div>
                                            <Flex gap={15}>
                                                <div
                                                    className={
                                                        "w-fit border-[3px] rounded-lg h-fit hover:border-dashed hover:border-[#f80] cursor-pointer"
                                                    }
                                                >
                                                    <Upload
                                                        name="avatar"
                                                        customRequest={({
                                                            file,
                                                            onSuccess,
                                                        }) => {
                                                            setTimeout(() => {
                                                                onSuccess &&
                                                                    onSuccess(
                                                                        "ok"
                                                                    );
                                                            }, 0);
                                                        }}
                                                        showUploadList={false}
                                                        beforeUpload={
                                                            beforeUpload
                                                        }
                                                        onChange={(
                                                            info: UploadChangeParam<
                                                                UploadFile<any>
                                                            >
                                                        ) =>
                                                            handleChangeProductImages(
                                                                info
                                                            )
                                                        }
                                                    >
                                                        <Flex
                                                            align={"center"}
                                                            justify={"center"}
                                                            className={
                                                                "w-[170px] h-[170px] hover:text-[#f80]"
                                                            }
                                                        >
                                                            <PlusOutlined
                                                                className={
                                                                    "text-[24px]"
                                                                }
                                                            />
                                                        </Flex>
                                                    </Upload>
                                                </div>

                                                <Flex
                                                    gap={15}
                                                    className={
                                                        "flex-1 overflow-x-auto scrollbar-thin w-full"
                                                    }
                                                    style={{
                                                        scrollbarGutter:
                                                            "stable",
                                                    }}
                                                >
                                                    {imageUrls
                                                        ?.filter(
                                                            (item: string) =>
                                                                item !== ""
                                                        )
                                                        ?.map(
                                                            (
                                                                image: any,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className={
                                                                        "relative w-fit border-[3px] rounded-lg h-fit hover:border-dashed cursor-pointer"
                                                                    }
                                                                >
                                                                    <Upload
                                                                        name="avatar"
                                                                        customRequest={({
                                                                            file,
                                                                            onSuccess,
                                                                        }) => {
                                                                            setTimeout(
                                                                                () => {
                                                                                    onSuccess &&
                                                                                        onSuccess(
                                                                                            "ok"
                                                                                        );
                                                                                },
                                                                                0
                                                                            );
                                                                        }}
                                                                        showUploadList={
                                                                            false
                                                                        }
                                                                        beforeUpload={
                                                                            beforeUpload
                                                                        }
                                                                        onChange={(
                                                                            info: UploadChangeParam<
                                                                                UploadFile<any>
                                                                            >
                                                                        ) =>
                                                                            handleChangeProductImages(
                                                                                info,
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <Image
                                                                            width={
                                                                                170
                                                                            }
                                                                            height={
                                                                                170
                                                                            }
                                                                            alt={
                                                                                ""
                                                                            }
                                                                            src={
                                                                                !image ? (
                                                                                    <PlusOutlined />
                                                                                ) : (
                                                                                    image
                                                                                )
                                                                            }
                                                                        />
                                                                    </Upload>
                                                                    <div
                                                                        className={
                                                                            "absolute z-[999] top-[-2px] right-[-2px] w-[20px] h-[20px] bg-[#f85a5a00] rounded-[50%]"
                                                                        }
                                                                        onClick={() => {
                                                                            setImageUrls(
                                                                                imageUrls?.filter(
                                                                                    (
                                                                                        _,
                                                                                        currentIndex: number
                                                                                    ) =>
                                                                                        currentIndex !==
                                                                                        index
                                                                                )
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CloseCircleOutlined
                                                                            className={
                                                                                "text-[20px]"
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        <Flex
                                            vertical
                                            className={"mt-5"}
                                            gap={20}
                                        >
                                            <Flex
                                                vertical
                                                gap={4}
                                                className={"custom-input"}
                                            >
                                                <div
                                                    className={
                                                        "font-medium text-[17px]"
                                                    }
                                                >
                                                    Tiêu đề bài đăng{" "}
                                                    <span
                                                        className={"required"}
                                                    >
                                                        *
                                                    </span>
                                                </div>
                                                <Input
                                                    value={post.title || ""}
                                                    placeholder={"Nhập tiêu đề"}
                                                    rootClassName={"h-[45px]"}
                                                    onChange={(e) =>
                                                        handleChangePostData(
                                                            e.target.value,
                                                            "title"
                                                        )
                                                    }
                                                />
                                            </Flex>
                                            <Flex
                                                vertical
                                                gap={4}
                                                className={"custom-input"}
                                            >
                                                <div
                                                    className={
                                                        "font-medium text-[17px]"
                                                    }
                                                >
                                                    Mô tả
                                                </div>
                                                <RawInput.TextArea
                                                    placeholder={"Nhập mô tả"}
                                                    rootClassName={
                                                        "!min-h-[45px] max-h-[280px] w-full !pt-[12px] scrollbar-thin"
                                                    }
                                                    value={
                                                        post.product
                                                            ?.description || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChangeProductData(
                                                            e.target.value,
                                                            "description"
                                                        )
                                                    }
                                                />
                                            </Flex>
                                            <Flex
                                                vertical
                                                gap={4}
                                                className={"custom-input mt-1"}
                                            >
                                                <div
                                                    className={
                                                        "font-[600] text-[17px]"
                                                    }
                                                >
                                                    Thông tin sản phẩm
                                                </div>
                                                <Flex vertical>
                                                    <div
                                                        className={
                                                            "font-medium text-[15px] mt-1"
                                                        }
                                                    >
                                                        Tình trạng{" "}
                                                        <span
                                                            className={
                                                                "required"
                                                            }
                                                        >
                                                            *
                                                        </span>
                                                    </div>
                                                    <Flex
                                                        gap={15}
                                                        className={"mt-1"}
                                                        wrap
                                                    >
                                                        {conditionOptions.map(
                                                            (item) => (
                                                                <Tag
                                                                    rootClassName={
                                                                        "h-[35px] text-[15px] font-medium flex items-center rounded-[0.425rem] px-3 cursor-pointer hover:text-[#d46b08] hover:bg-[#fff7e6] hover:border-[#ffd591]"
                                                                    }
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    color={
                                                                        item.value ===
                                                                        post
                                                                            .product
                                                                            ?.condition
                                                                            ? "volcano"
                                                                            : ""
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            item.value !==
                                                                            post
                                                                                .product
                                                                                ?.condition
                                                                        ) {
                                                                            return handleChangeProductData(
                                                                                item.value,
                                                                                "condition"
                                                                            );
                                                                        } else {
                                                                            return;
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.label}
                                                                </Tag>
                                                            )
                                                        )}
                                                    </Flex>
                                                </Flex>
                                                <Flex
                                                    vertical
                                                    className={"mt-3"}
                                                >
                                                    <div
                                                        className={
                                                            "font-medium text-[15px] mt-1"
                                                        }
                                                    >
                                                        Giá sản phẩm{" "}
                                                        <span
                                                            className={
                                                                "required"
                                                            }
                                                        >
                                                            *
                                                        </span>
                                                    </div>
                                                    <Flex
                                                        gap={15}
                                                        className={"mt-1"}
                                                    >
                                                        {priceOptions.map(
                                                            (item) => (
                                                                <Tag
                                                                    rootClassName={
                                                                        "h-[35px] text-[15px] font-medium flex items-center rounded-[0.425rem] px-3 cursor-pointer hover:text-[#d46b08] hover:bg-[#fff7e6] hover:border-[#ffd591]"
                                                                    }
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    color={
                                                                        item.value ===
                                                                        priceOptionValue
                                                                            ? "volcano"
                                                                            : ""
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            item.value ===
                                                                            "free"
                                                                        ) {
                                                                            return handleChangeProductData(
                                                                                null,
                                                                                "price"
                                                                            );
                                                                        } else {
                                                                            return handleChangeProductData(
                                                                                20000,
                                                                                "price"
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.label}
                                                                </Tag>
                                                            )
                                                        )}
                                                        {priceOptionValue ===
                                                        "sell" ? (
                                                            <InputNumber
                                                                className={
                                                                    "main-input-number"
                                                                }
                                                                value={
                                                                    post.product
                                                                        ?.price ||
                                                                    20000
                                                                }
                                                                min={20000}
                                                                formatter={(
                                                                    value
                                                                ) =>
                                                                    value
                                                                        ? `${value}`.replace(
                                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                                              ","
                                                                          )
                                                                        : ""
                                                                }
                                                                parser={(
                                                                    value
                                                                ) =>
                                                                    Number(
                                                                        value?.replace(
                                                                            /\$\s?|(,*)/g,
                                                                            ""
                                                                        ) as string
                                                                    ) || 20000
                                                                }
                                                                onWheel={() => {}}
                                                                addonAfter={
                                                                    "VNĐ"
                                                                }
                                                                rootClassName={
                                                                    "!h-[35px]"
                                                                }
                                                                onChange={(e) =>
                                                                    handleChangeProductData(
                                                                        e,
                                                                        "price"
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            ""
                                                        )}
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                            <Row
                                                gutter={[40, 24]}
                                                className={"mt-2"}
                                            >
                                                {attributes?.map(
                                                    (
                                                        attribute: Attribute,
                                                        index: number
                                                    ) => (
                                                        <Col
                                                            className="gutter-row"
                                                            span={12}
                                                            key={attribute?._id}
                                                        >
                                                            <Element
                                                                attribute={
                                                                    attribute
                                                                }
                                                                setFocusedAttributeId={
                                                                    setFocusedAttributeId
                                                                }
                                                                isFocused={
                                                                    focusedAttributeId ===
                                                                    attribute?._id
                                                                }
                                                                value={handleGetAttributeValue(
                                                                    attribute?._id as string
                                                                )}
                                                                onChange={(
                                                                    e: EventListener
                                                                ) =>
                                                                    handleChangeAttributeValue(
                                                                        e,
                                                                        attribute?._id as string,
                                                                        attribute?.input_type
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                    )
                                                )}
                                            </Row>
                                            <Flex
                                                vertical
                                                gap={4}
                                                className={"custom-input"}
                                            >
                                                <div
                                                    className={
                                                        "font-semibold text-[17px]"
                                                    }
                                                >
                                                    Thông tin địa chỉ người bán{" "}
                                                    <span
                                                        className={"required"}
                                                    >
                                                        *
                                                    </span>
                                                </div>
                                                <Flex
                                                    gap={40}
                                                    className={"main-select"}
                                                >
                                                    <Select
                                                        rootClassName={"w-full"}
                                                        loading={
                                                            loadingGetRegions
                                                        }
                                                        showSearch
                                                        allowClear
                                                        value={
                                                            post.location.city
                                                        }
                                                        onChange={(e) =>
                                                            handleChangePostData(
                                                                e,
                                                                "city"
                                                            )
                                                        }
                                                        placeholder={
                                                            "Chọn tỉnh, thành phố"
                                                        }
                                                        options={cityOptions}
                                                        optionFilterProp={
                                                            "label"
                                                        }
                                                        filterOption={(
                                                            inputValue,
                                                            option
                                                        ) =>
                                                            handleRemoveVietnameseTones(
                                                                option?.label?.toLowerCase()
                                                            ).includes(
                                                                handleRemoveVietnameseTones(
                                                                    inputValue?.toLowerCase()
                                                                )
                                                            )
                                                        }
                                                    />

                                                    <Select
                                                        rootClassName={"w-full"}
                                                        showSearch
                                                        allowClear
                                                        disabled={_.isEmpty(
                                                            post.location.city
                                                        )}
                                                        value={
                                                            post.location
                                                                .district
                                                        }
                                                        onChange={(e) =>
                                                            handleChangePostData(
                                                                e,
                                                                "district"
                                                            )
                                                        }
                                                        placeholder={
                                                            "Chọn quận, huyện, thị xã"
                                                        }
                                                        options={
                                                            districtOptions
                                                        }
                                                        optionFilterProp={
                                                            "label"
                                                        }
                                                        filterOption={(
                                                            inputValue,
                                                            option
                                                        ) =>
                                                            handleRemoveVietnameseTones(
                                                                option?.label?.toLowerCase()
                                                            ).includes(
                                                                handleRemoveVietnameseTones(
                                                                    inputValue?.toLowerCase()
                                                                )
                                                            )
                                                        }
                                                    />
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        <Flex
                                            justify={"end"}
                                            className={"mt-16"}
                                            gap={30}
                                        >
                                            {id !== "create" ? (
                                                <>
                                                    {buttonsText
                                                        ? buttonsText?.map(
                                                              (
                                                                  item: {
                                                                      text: string;
                                                                      status: string;
                                                                  },
                                                                  index: number
                                                              ) => (
                                                                  <Button
                                                                      key={
                                                                          index
                                                                      }
                                                                      size={
                                                                          "large"
                                                                      }
                                                                      rootClassName={`${
                                                                          index %
                                                                              2 !==
                                                                          0
                                                                              ? "!bg-white !text-[#f80]"
                                                                              : ""
                                                                      }`}
                                                                      loading={
                                                                          loadingSaveDraftOrPost
                                                                      }
                                                                      onClick={() =>
                                                                          handleSubmit(
                                                                              item.status
                                                                          )
                                                                      }
                                                                      disabled={
                                                                          item.status ===
                                                                          POST_STATUS
                                                                              .DRAFT
                                                                              .VALUE
                                                                              ? false
                                                                              : disableSubmitPost
                                                                      }
                                                                  >
                                                                      {
                                                                          item.text
                                                                      }
                                                                  </Button>
                                                              )
                                                          )
                                                        : ""}
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size={"large"}
                                                        rootClassName={
                                                            "!bg-white !text-[#f80]"
                                                        }
                                                        loading={
                                                            loadingSaveDraftOrPost
                                                        }
                                                        onClick={() =>
                                                            handleSubmit(
                                                                "draft"
                                                            )
                                                        }
                                                    >
                                                        LƯU BẢN NHÁP
                                                    </Button>
                                                    <Button
                                                        disabled={
                                                            disableSubmitPost
                                                        }
                                                        type={"primary"}
                                                        size={"large"}
                                                        loading={
                                                            loadingSaveDraftOrPost
                                                        }
                                                        onClick={() =>
                                                            handleSubmit("post")
                                                        }
                                                    >
                                                        ĐĂNG TIN
                                                    </Button>
                                                </>
                                            )}
                                        </Flex>
                                    </>
                                )}
                            </div>
                        ) : (
                            ""
                        )}
                    </Flex>
                </div>
            </div>
            <Modal
                title={"Lưu thông tin mới cho bài đăng"}
                open={showPopupAlertPendingPost}
                onClose={() => setShowPopupAlertPendingPost(false)}
                onCancel={() => setShowPopupAlertPendingPost(false)}
                onOk={handleSubmitPendingPost}
                maskClosable={false}
                okText={"Xác nhận"}
                cancelText={"Hủy"}
                okButtonProps={{ loading: loadingSaveDraftOrPost }}
            >
                Sau khi lưu thông tin mới, bài đăng sẽ vào trạng thái chờ duyệt
                từ quản trị viên. Bạn có muốn tiếp tục không?
            </Modal>
        </>
    );
}
