"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumb } from "@/store/slices/app";
import SearchBar from "@/app/admin/components/SearchBar";
import { Button, Col, Empty, Flex, Pagination, Row, Spin } from "antd";
import { Category, Filter, PaginationType } from "../../../../utils/types";
import { requestGetCategoriesForAdmin } from "@/api/category";
import { initialFilter } from "../../../../utils/initialValues";
import { getNotification } from "../../../../utils/helper";
import { PER_PAGE } from "../../../../utils/constants";
import CategoryCard from "@/app/admin/categories/components/CategoryCard";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";

export default function CategoryManagementPage() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[] | undefined>([]);
    const [filter, setFilter] = useState<Filter>(initialFilter);
    const [pagination, setPagination] = useState<PaginationType>({
        currentPage: 1,
        perPage: PER_PAGE,
        totalRecord: 0,
    });

    const handleGetCategories = () => {
        setLoading(true);
        requestGetCategoriesForAdmin(filter)
            .then((res) => {
                const metadata = res.data.metadata;
                setCategories(res.data?.categories);
                setPagination({
                    currentPage: metadata?.page,
                    perPage: metadata?.pageSize,
                    totalRecord: metadata?.total,
                });
            })
            .catch((err) => {
                getNotification("error", "Không thể lấy dữ liệu danh mục");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const debounceValue = useDebounce(filter.q, 600);

    const handleSearch = useCallback(() => {
        handleGetCategories();
    }, [debounceValue]);

    useEffect(() => {
        handleSearch();
    }, [debounceValue]);

    useEffect(() => {
        dispatch(
            setBreadcrumb([
                {
                    path: "/admin/users",
                    name: "Quản lý danh mục",
                },
            ])
        );
    }, []);

    const handleSelectPagination = (page: number) => {};

    const handleChangeSearchInput = (e: any) => {
        setFilter({
            ...filter,
            q: e.target.value,
        });
    };

    return (
        <Flex vertical gap={20}>
            <Flex justify={"space-between"} align={"center"}>
                <SearchBar
                    className={"w-2/5"}
                    value={filter.q}
                    placeholder={"Tìm kiếm theo tên danh mục"}
                    size={"large"}
                    onChange={handleChangeSearchInput}
                />
                <Link href={"/admin/categories/create"}>
                    <Button
                        className={"!bg-[#1677ff] admin-button"}
                        size={"large"}
                        type={"primary"}
                    >
                        <PlusOutlined /> Tạo mới
                    </Button>
                </Link>
            </Flex>

            <div
                style={{ scrollbarGutter: "stable" }}
                className={
                    "h-[calc(100vh_-_284px)] overflow-y-hidden hover:overflow-y-auto mt-3 scrollbar-thin"
                }
            >
                {loading ? (
                    <div
                        className={
                            "w-full h-full flex justify-center items-center"
                        }
                    >
                        <Spin />
                    </div>
                ) : (
                    <Row gutter={[32, 24]} style={{ marginRight: "0px" }}>
                        {categories?.length === 0 ? (
                            <Flex
                                className={"w-full mt-[calc(100vh_-_550px)]"}
                                justify={"center"}
                                align={"center"}
                            >
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </Flex>
                        ) : (
                            categories?.map((item: Category) => (
                                <Col
                                    key={item?._id}
                                    xl={8}
                                    lg={12}
                                    md={12}
                                    sm={24}
                                    xs={24}
                                >
                                    <CategoryCard
                                        category={item}
                                        handleRefreshCategories={
                                            handleGetCategories
                                        }
                                    />
                                </Col>
                            ))
                        )}
                    </Row>
                )}
            </div>

            <Pagination
                className={"flex justify-end general-pagination"}
                current={pagination?.currentPage}
                total={pagination?.totalRecord || 0}
                pageSize={pagination?.perPage}
                onChange={(e) => handleSelectPagination(e)}
                showSizeChanger={false}
                showLessItems
            />
        </Flex>
    );
}
