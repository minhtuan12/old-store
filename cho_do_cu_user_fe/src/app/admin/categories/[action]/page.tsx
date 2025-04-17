"use client";

import React, { useEffect, useState } from "react";
import { setBreadcrumb } from "@/store/slices/app";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { Attribute, Category } from "../../../../../utils/types";
import _ from "lodash";
import {
    Button,
    Flex,
    Input,
    Popconfirm,
    Select,
    Spin,
    Switch,
    Table,
    TableProps,
} from "antd";
import {
    CaretLeftOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    ADDABLE_INPUT_TYPE,
    ATTRIBUTE_INPUT_TYPE,
    SERVER_ERROR_MESSAGE,
} from "../../../../../utils/constants";
import { submitValidation } from "@/app/admin/categories/[action]/validate";
import ErrorMessage from "@/components/ErrorMessage";
import {
    capitalizeOnlyFirstLetter,
    getNotification,
} from "../../../../../utils/helper";
import {
    requestCreateCategory,
    requestGetCategoryById,
    requestUpdateCategory,
} from "@/api/category";
import { setCurrentCategory } from "@/store/slices/category";
import { useRouter } from "next/navigation";
import ModalAddOptions from "@/app/admin/categories/components/ModalAddOptions";

type DataType = {
    key: number;
    order: number;
    label: string;
    input_type: string;
    initial_value: string[] | null;
    is_required: boolean;
    is_deleted: boolean;
};

interface AttributeWithKey extends Attribute {
    key: number;
}

interface ErrorSubmit {
    name: string;
    attribute: {
        label: string;
        initialValues: string;
    };
}

const Label = ({
    label,
    isRequired = false,
    className = "",
}: {
    label: string;
    isRequired?: boolean;
    className?: string;
}) => (
    <div className={`font-medium text-[16px] mb-1.5 ${className}`}>
        {label} {isRequired ? <span className={"text-[red]"}>*</span> : ""}
    </div>
);

const initialAttribute: Attribute = {
    label: "",
    initial_value: null,
    input_type: ATTRIBUTE_INPUT_TYPE.TEXT.VALUE,
    is_required: true,
    is_deleted: false,
};

const initialCategory: Category = {
    name: "",
    description: "",
    attributes: [],
};

export default function CategoryAction({
    params,
}: {
    params: { action: string };
}) {
    const currentCategory = useSelector(
        (state: RootState) => state.category.currentCategory
    );
    const [category, setCategory] = useState<Category>(initialCategory);
    const inputTypeOptions = Object.values(ATTRIBUTE_INPUT_TYPE).map(
        (item) => ({
            label: item.LABEL,
            value: item.VALUE,
        })
    );
    const [currentAttributeIndex, setCurrentAttributeIndex] =
        useState<number>(-1);
    const [
        currentAttributeToAddInitialValue,
        setCurrentAttributeToAddInitialValue,
    ] = useState<Attribute | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<string[]>([""]);
    const [selectedAttributes, setSelectedAttributes] = useState<
        AttributeWithKey[]
    >([]);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [loadingGetData, setLoadingGetData] = useState<boolean>(false);
    const AddButton = ({
        isAddable,
        order,
        children,
    }: {
        isAddable: boolean;
        order: number;
        children: any;
    }) => (
        <Button
            disabled={!isAddable}
            rootClassName={`w-full border-none h-[64px] text-[#1677ff]`}
            onClick={() => handleOpenModalAddInitialValue(order)}
        >
            {children}
        </Button>
    );
    const attributeTableColumns: TableProps<DataType>["columns"] = [
        {
            title: "Tên thuộc tính",
            dataIndex: "label",
            width: 200,
            render: (text: string, record: DataType) => (
                <Input
                    placeholder={"Nhập tên thuộc tính"}
                    value={text}
                    onChange={(e) =>
                        handleChangeAttribute(
                            e.target.value,
                            "label",
                            record.order
                        )
                    }
                />
            ),
        },
        {
            title: "Kiểu đầu vào",
            dataIndex: "input_type",
            width: 200,
            render: (text: string, record: DataType) => (
                <Select
                    rootClassName={"w-full"}
                    className={"main-select"}
                    options={inputTypeOptions}
                    placeholder={"Nhập tên thuộc tính"}
                    value={text}
                    onChange={(e) =>
                        handleChangeAttribute(e, "input_type", record.order)
                    }
                />
            ),
        },
        {
            title: "Các lựa chọn",
            dataIndex: "initial_value",
            align: "center",
            width: 150,
            render: (text: any, record: DataType) => {
                const currentAttribute: Attribute = category.attributes?.find(
                    (item: Attribute) => item.order === record.order
                ) as Attribute;
                const isAddable: boolean = ADDABLE_INPUT_TYPE?.includes(
                    currentAttribute?.input_type
                );
                const options: string[] | null = currentAttribute?.initial_value
                    ? currentAttribute.initial_value?.filter(
                          (item) => item !== ""
                      )
                    : null;
                return !options || options?.length === 0 ? (
                    <AddButton order={record.order} isAddable={isAddable}>
                        <PlusOutlined />
                    </AddButton>
                ) : (
                    <AddButton order={record.order} isAddable={isAddable}>
                        Bấm để xem
                    </AddButton>
                );
            },
        },
        {
            title: "Bắt buộc",
            dataIndex: "is_required",
            align: "center",
            width: 120,
            render: (text: boolean, record: DataType) => (
                <Switch
                    onChange={(e) =>
                        handleChangeAttribute(e, "is_required", record.order)
                    }
                    className={"main-switch"}
                    checked={text}
                />
            ),
        },
        {
            title: "",
            align: "center",
            width: 80,
            fixed: "right",
            render: (text, record: DataType) => {
                return (
                    <Popconfirm
                        okButtonProps={{ className: "!bg-[#1677ff]" }}
                        title="Xóa thuộc tính này?"
                        onConfirm={() => handleDeleteAttribute(record.order)}
                    >
                        <div className={"text-[red] cursor-pointer"}>Xóa</div>
                    </Popconfirm>
                );
            },
        },
    ];
    const [errorSubmit, setErrorSubmit] = useState<ErrorSubmit>({
        name: "",
        attribute: {
            label: "",
            initialValues: "",
        },
    });
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        let breadcrumb = [
            {
                path: "/admin/categories",
                name: "Quản lý danh mục",
            },
        ];
        if (params.action !== "create") {
            if (!_.isEmpty(currentCategory)) {
                setCategory({
                    ...currentCategory,
                    attributes: currentCategory.attributes?.map(
                        (item: Attribute, index: number): Attribute => ({
                            ...item,
                            order: index,
                        })
                    ),
                });
            } else {
                setLoadingGetData(true);
                requestGetCategoryById(params.action)
                    .then((res) => {
                        const categoryResponse: Category = {
                            ...res.data.category,
                            attributes: res.data.category.attributes?.map(
                                (
                                    item: Attribute,
                                    index: number
                                ): Attribute => ({
                                    ...item,
                                    order: index,
                                })
                            ),
                        };
                        dispatch(setCurrentCategory(categoryResponse));
                        setCategory(categoryResponse);
                    })
                    .catch((err) => {
                        getNotification(
                            "error",
                            "Không lấy được thông tin danh mục"
                        );
                        router.push("/admin/categories");
                    })
                    .finally(() => {
                        setLoadingGetData(false);
                    });
            }
            dispatch(
                setBreadcrumb([...breadcrumb, { name: currentCategory?.name }])
            );
        } else {
            dispatch(setBreadcrumb([...breadcrumb, { name: "Tạo mới" }]));
        }
    }, [currentCategory, dispatch, params.action]);

    const handleResetAttributeErrorSubmit = () => {
        setErrorSubmit({
            ...errorSubmit,
            attribute: {
                label: "",
                initialValues: "",
            },
        });
    };

    const handleOpenModalAddInitialValue = (attributeOrder: number): void => {
        handleResetAttributeErrorSubmit();
        setCurrentAttributeIndex(attributeOrder);
        const selectedAttribute: Attribute = category.attributes?.find(
            (item: Attribute) => item.order === attributeOrder
        ) as Attribute;
        setCurrentAttributeToAddInitialValue(selectedAttribute);
        if (selectedAttribute?.initial_value) {
            setInitialValues(selectedAttribute?.initial_value);
        }
    };

    const handleAddAttribute = () => {
        // @ts-ignore
        setCategory({
            ...category,
            attributes: [
                ...category?.attributes,
                {
                    ...initialAttribute,
                    order: category?.attributes?.length || 0,
                },
            ],
        });
    };

    const handleChangeCategory = (value: string, type: string) => {
        if (type === "name") {
            setErrorSubmit({
                ...errorSubmit,
                name: "",
            });
        }
        setCategory({
            ...category,
            [type]: value,
        });
    };

    const handleDeleteAttribute = (order: number) => {
        handleResetAttributeErrorSubmit();
        let afterCategory: Category = _.cloneDeep(category);
        const currentAttribute: Attribute = afterCategory.attributes?.find(
            (item) => item.order === order
        ) as Attribute;
        const currentIndex: number = afterCategory.attributes?.findIndex(
            (item) => item.order === order
        );
        if (!currentAttribute?._id) {
            afterCategory = {
                ...afterCategory,
                attributes: afterCategory.attributes?.filter(
                    (item: Attribute) => item.order !== order
                ),
            };
        } else {
            afterCategory = {
                ...afterCategory,
                attributes: [
                    ...afterCategory.attributes?.slice(0, currentIndex),
                    {
                        ...currentAttribute,
                        is_deleted: true,
                    },
                    ...afterCategory.attributes?.slice(currentIndex + 1),
                ],
            };
        }
        setCategory(afterCategory);
    };

    const handleChangeAttribute = (
        value: string | boolean,
        type: string,
        order: number
    ) => {
        handleResetAttributeErrorSubmit();
        let initialValue = null;
        if (type === "input_type") {
            initialValue = ADDABLE_INPUT_TYPE.includes(value as string)
                ? [""]
                : null;
            setInitialValues([""]);
        }
        const currentAttribute: Attribute = category.attributes?.find(
            (item: Attribute): boolean => item.order === order
        ) as Attribute;
        const currentIndex: number = category.attributes?.findIndex(
            (item: Attribute): boolean => item.order === order
        );
        setCategory({
            ...category,
            attributes: [
                ...category.attributes?.slice(0, currentIndex),
                {
                    ...currentAttribute,
                    [type]: value,
                    initial_value:
                        type === "input_type"
                            ? initialValue
                            : currentAttribute.initial_value,
                },
                ...category.attributes?.slice(currentIndex + 1),
            ],
        });
    };

    const handleSetInitialValueForAttribute = () => {
        let currentAttribute: Attribute | undefined = _.cloneDeep(
            currentAttributeToAddInitialValue
        );
        const okInitialValues: string[] = initialValues?.filter(
            (item) => item !== ""
        );
        if (currentAttribute && okInitialValues?.length > 0) {
            currentAttribute = {
                ...currentAttribute,
                initial_value: okInitialValues,
            };
            setCategory({
                ...category,
                attributes: [
                    ...category.attributes?.slice(0, currentAttributeIndex),
                    currentAttribute,
                    ...category.attributes?.slice(currentAttributeIndex + 1),
                ],
            });
            setCurrentAttributeToAddInitialValue(undefined);
        }
    };

    const handleSelectMultipleAttribute = (
        _: any,
        selectedRows: DataType[]
    ) => {
        // @ts-ignore
        setSelectedAttributes(selectedRows);
    };

    const handleDeleteMultipleAttribute = () => {
        handleResetAttributeErrorSubmit();
        if (selectedAttributes?.length > 0) {
            let remainingAttributes: Attribute[] = _.cloneDeep(
                category.attributes
            );
            const selectedKeys: number[] = selectedAttributes?.map(
                (item: AttributeWithKey) => item.key
            );
            remainingAttributes = remainingAttributes.map((item: Attribute) => {
                return selectedKeys?.includes(item.order as number)
                    ? {
                          ...item,
                          is_deleted: true,
                      }
                    : item;
            });
            setCategory({
                ...category,
                attributes: remainingAttributes,
            });
        }
    };

    const handleSetErrorFromServerResponse = (errorDetails: any) => {
        setErrorSubmit({
            name: errorDetails?.name || "",
            attribute: {
                label: errorDetails?.label || "",
                initialValues: errorDetails?.initialValues || "",
            },
        });
    };

    const handleCreateCategory = (submitCategory: Category) => {
        requestCreateCategory(submitCategory)
            .then((res) => {
                getNotification("success", "Tạo mới thành công");
                router.push("/admin/categories");
            })
            .catch((err) => {
                getNotification("error", SERVER_ERROR_MESSAGE);
            })
            .finally(() => {
                setIsLoadingSubmit(false);
            });
    };

    const handleUpdateCategory = (submitCategory: Category) => {
        if (submitCategory?._id) {
            requestUpdateCategory(submitCategory?._id, submitCategory)
                .then((res) => {
                    getNotification("success", "Cập nhật thành công");
                    router.push("/admin/categories");
                })
                .catch((err) => {
                    getNotification("error", SERVER_ERROR_MESSAGE);
                })
                .finally(() => {
                    setIsLoadingSubmit(false);
                });
        }
    };

    const handleSubmit = () => {
        const { isError, errorDetail } = submitValidation(category);
        if (isError) {
            setErrorSubmit(errorDetail);
        } else {
            setIsLoadingSubmit(true);
            let submitCategory: Category = _.cloneDeep(category);
            submitCategory = {
                ...submitCategory,
                name: capitalizeOnlyFirstLetter(submitCategory.name),
                description: submitCategory.description
                    ? capitalizeOnlyFirstLetter(submitCategory.description)
                    : "",
                attributes:
                    submitCategory.attributes?.length > 0
                        ? submitCategory.attributes
                              ?.filter((item: Attribute) => {
                                  return item?._id || !item?.is_deleted;
                              })
                              ?.map((item: Attribute): Attribute => {
                                  return {
                                      ...item,
                                      label: capitalizeOnlyFirstLetter(
                                          item.label
                                      ),
                                      initial_value: item.initial_value
                                          ? item.initial_value?.map(
                                                (option: string) =>
                                                    capitalizeOnlyFirstLetter(
                                                        option
                                                    )
                                            )
                                          : null,
                                  };
                              })
                        : [],
            };
            if (params.action === "create") {
                submitCategory = {
                    ...submitCategory,
                    attributes: submitCategory.attributes?.map(
                        (item: Attribute): Attribute => {
                            delete item.is_deleted;
                            delete item.order;
                            return item;
                        }
                    ),
                };
                handleCreateCategory(submitCategory);
            } else {
                submitCategory = {
                    ...submitCategory,
                    attributes: submitCategory.attributes?.map(
                        (item: Attribute): Attribute => {
                            if (!item?._id) {
                                delete item.is_deleted;
                            }
                            delete item.order;
                            return item;
                        }
                    ),
                };
                handleUpdateCategory(submitCategory);
            }
        }
    };

    if (loadingGetData) {
        return (
            <Flex
                justify={"center"}
                align={"center"}
                className={"w-full h-full"}
            >
                <Spin />
            </Flex>
        );
    }

    return (
        <div className={"h-full"}>
            <Flex
                className={"w-full"}
                justify={"space-between"}
                align={"center"}
            >
                <div className={"font-semibold text-[22px]"}>
                    {params.action === "create"
                        ? "Tạo mới danh mục"
                        : `Cập nhật ${currentCategory?.name}`}
                </div>
                <Flex
                    align={"center"}
                    gap={3}
                    onClick={() => router.push("/admin/categories")}
                    className={"text-[#1677ff] cursor-pointer"}
                >
                    <CaretLeftOutlined className={"mt-0.5"} />
                    Quay lại
                </Flex>
            </Flex>
            <Flex vertical className={"h-full"}>
                <Flex className={"mt-8"} gap={50} wrap>
                    <Flex gap={20} vertical>
                        <Flex vertical>
                            <Label label={"Tên danh mục"} isRequired />
                            <Input
                                value={category?.name}
                                onChange={(e) =>
                                    handleChangeCategory(e.target.value, "name")
                                }
                                placeholder={"Nhập tên danh mục"}
                                rootClassName={"h-[40px] w-[300px]"}
                            />
                            {errorSubmit.name ? (
                                <ErrorMessage message={errorSubmit.name} />
                            ) : (
                                ""
                            )}
                        </Flex>
                        <Flex vertical>
                            <Label label={"Mô tả"} />
                            <Input.TextArea
                                value={category?.description}
                                onChange={(e) =>
                                    handleChangeCategory(
                                        e.target.value,
                                        "description"
                                    )
                                }
                                placeholder={"Nhập mô tả"}
                                rootClassName={
                                    "!min-h-[40px] max-h-[280px] w-[300px] pt-[6px] scrollbar-thin "
                                }
                            />
                        </Flex>
                    </Flex>
                    <div
                        className={
                            "flex flex-col py-6 px-8 shadow-[rgba(0,_0,_0,_0.1)_0px_4px_12px] rounded-xl flex-1 max-w-full"
                        }
                    >
                        <Flex align={"center"} justify={"space-between"}>
                            <Label label={"Các thuộc tính"} />
                            <Flex gap={30}>
                                <Flex
                                    align={"center"}
                                    gap={3}
                                    className={`${
                                        !(selectedAttributes?.length > 0)
                                            ? "cursor-not-allowed text-gray-400"
                                            : "cursor-pointer text-[red]"
                                    } text-[14px] mb-1.5 select-none w-fit`}
                                    onClick={handleDeleteMultipleAttribute}
                                >
                                    <DeleteOutlined /> Xóa nhiều
                                </Flex>
                                <Flex
                                    className={
                                        "text-[#1677ff] text-[14px] cursor-pointer mb-1.5 select-none w-fit"
                                    }
                                    align={"center"}
                                    gap={3}
                                    onClick={handleAddAttribute}
                                >
                                    <PlusOutlined style={{ fontSize: "8px" }} />{" "}
                                    Thêm mới
                                </Flex>
                            </Flex>
                        </Flex>
                        {category?.attributes?.length === 0 ? (
                            <i className={"text-gray-500 mt-2"}>
                                Chưa có thuộc tính nào
                            </i>
                        ) : (
                            <Table
                                rowSelection={{
                                    selectedRowKeys: selectedAttributes?.map(
                                        (item) => item.key
                                    ),
                                    onChange: handleSelectMultipleAttribute,
                                }}
                                className={"attribute-table mt-2"}
                                bordered
                                pagination={false}
                                columns={attributeTableColumns}
                                dataSource={category?.attributes
                                    ?.filter(
                                        (item: Attribute) =>
                                            item.is_deleted === false
                                    )
                                    ?.map(
                                        (item: Attribute): DataType =>
                                            ({
                                                label: item?.label,
                                                input_type: item?.input_type,
                                                initial_value:
                                                    item?.initial_value,
                                                is_required: item?.is_required,
                                                is_deleted: item?.is_deleted,
                                                key: item.order,
                                                order: item.order,
                                            } as DataType)
                                    )}
                                scroll={{ y: "calc(100vh - 430px)" }}
                                loading={loadingGetData}
                            />
                        )}
                        <div className={"mt-2"}>
                            {errorSubmit.attribute.initialValues ||
                            errorSubmit.attribute.label
                                ? Object.values(errorSubmit.attribute).map(
                                      (error: string, index: number) => (
                                          <ErrorMessage
                                              message={error}
                                              key={index}
                                              className={`mb-1`}
                                          />
                                      )
                                  )
                                : ""}
                        </div>
                    </div>
                </Flex>
                <div className={"w-fit mt-[22px]"}>
                    <Button
                        size={"large"}
                        className={"!bg-[#1677ff] admin-button"}
                        type={"primary"}
                        onClick={handleSubmit}
                        loading={isLoadingSubmit}
                    >
                        {params.action === "create" ? "Tạo mới" : "Cập nhật"}
                    </Button>
                </div>
            </Flex>

            <ModalAddOptions
                initialValues={initialValues}
                currentAttributeToAddInitialValue={
                    currentAttributeToAddInitialValue
                }
                handleSetInitialValueForAttribute={
                    handleSetInitialValueForAttribute
                }
                setCurrentAttributeIndex={setCurrentAttributeIndex}
                setCurrentAttributeToAddInitialValue={
                    setCurrentAttributeToAddInitialValue
                }
                setInitialValues={setInitialValues}
            />
        </div>
    );
}
