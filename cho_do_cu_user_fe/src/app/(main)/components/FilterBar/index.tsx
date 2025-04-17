"use client";

import React, { useEffect, useState } from "react";
import { Category } from "../../../../../utils/types";
import { Checkbox, Empty, Flex, Radio, Slider } from "antd";
import "../../../global.scss";
import { handleFormatCurrency } from "../../../../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { setFilter } from "@/store/slices/app";
import { PRODUCT_CONDITION } from "../../../../../utils/constants";
import { useRouter, useSearchParams } from "next/navigation";
import _ from "lodash";

export default function FilterBar({
    categories,
    setOpenFilterDrawer,
}: {
    categories: Category[];
    setOpenFilterDrawer?: (isOpen: boolean) => void;
}) {
    const filter = useSelector((state: RootState) => state.app.filter);
    const [isPriceless, setIsPriceless] = useState(true);
    const [price, setPrice] = useState<{
        from: null | number;
        to: null | number;
    }>({
        from: null,
        to: null,
    });
    const [resetPrice, setResetPrice] = useState(true);
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelectPriceFilter = (isFree: boolean) => {
        setResetPrice(false);
        setIsPriceless(isFree);
        dispatch(
            setFilter({
                ...filter,
                priceFrom: isFree ? null : 20000,
                priceTo: isFree ? null : 50000000,
            })
        );
        setPrice({
            from: isFree ? null : 20000,
            to: isFree ? null : 50000000,
        });
        if (searchParams) {
            if (isFree) {
                const params = new URLSearchParams(searchParams);
                params.set("priceFrom", "none");
                params.set("priceTo", "none");
                setOpenFilterDrawer && setOpenFilterDrawer(false);
                router.push(`?${params.toString()}`);
            } else {
                const params = new URLSearchParams(searchParams);
                params.set("priceFrom", "20000");
                params.set("priceTo", "50000000");
                router.push(`?${params.toString()}`);
            }
        }
    };

    useEffect(() => {
        if (searchParams) {
            const params = new URLSearchParams(searchParams);
            let existingFilter = _.cloneDeep(filter);

            if (params.get("priceFrom") && params.get("priceTo")) {
                const from = params.get("priceFrom");
                const to = params.get("priceTo");
                if (from !== "none" && to !== "none") {
                    existingFilter = {
                        ...existingFilter,
                        priceFrom: Number(params.get("priceFrom")),
                        priceTo: Number(params.get("priceTo")),
                    };
                    setPrice({
                        from: Number(params.get("priceFrom")),
                        to: Number(params.get("priceTo")),
                    });
                    setIsPriceless(false);
                } else {
                    existingFilter = {
                        ...existingFilter,
                        priceFrom: params.get("priceFrom"),
                        priceTo: params.get("priceTo"),
                    };
                    setPrice({
                        from: null,
                        to: null,
                    });
                    setIsPriceless(true);
                }
                setResetPrice(false);
            }
            if (params.getAll("categoryIds")?.length > 0) {
                existingFilter = {
                    ...existingFilter,
                    categoryIds: params.getAll("categoryIds"),
                };
            }
            if (params.get("city")) {
                existingFilter = {
                    ...existingFilter,
                    city: params.get("city"),
                };
            }
            if (params.getAll("condition")?.length > 0) {
                existingFilter = {
                    ...existingFilter,
                    condition: params.getAll("condition"),
                };
            }

            dispatch(setFilter(existingFilter));
        }
    }, [searchParams]);

    return (
        <>
            <div className={"max-h-[calc(100%_-_388px)]"}>
                <div className={"text-[17px] mb-2"}>Theo danh mục</div>
                {categories?.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có danh mục nào"
                    />
                ) : (
                    <Checkbox.Group
                        className={
                            "flex flex-col gap-1 scrollbar-thin overflow-hidden hover:overflow-auto h-[calc(100%_-_38px)] custom-checkbox"
                        }
                        style={{ scrollbarGutter: "stable" }}
                        onChange={(e) => {
                            if (searchParams) {
                                const params = new URLSearchParams(
                                    searchParams
                                );
                                if (e?.length > 0) {
                                    dispatch(
                                        setFilter({ ...filter, categoryIds: e })
                                    );
                                    params.delete("categoryIds");
                                    e?.forEach((id: any) =>
                                        params.append("categoryIds", id)
                                    );
                                } else {
                                    dispatch(
                                        setFilter({
                                            ...filter,
                                            categoryIds: null,
                                        })
                                    );
                                    params.delete("categoryIds");
                                }
                                setOpenFilterDrawer &&
                                    setOpenFilterDrawer(false);
                                router.push(`?${params.toString()}`);
                            }
                        }}
                        value={filter.categoryIds}
                        options={categories?.map((item: Category) => ({
                            label: item?.name,
                            value: item?._id,
                        }))}
                    />
                )}
            </div>
            <div>
                <div
                    className={
                        "text-[17px] mb-2 flex justify-between items-center"
                    }
                >
                    Theo giá sản phẩm
                    <div
                        className={"cursor-pointer text-[#f80]"}
                        onClick={() => {
                            setResetPrice(true);
                            dispatch(
                                setFilter({
                                    ...filter,
                                    priceFrom: null,
                                    priceTo: null,
                                })
                            );
                            setPrice({
                                from: null,
                                to: null,
                            });
                            if (searchParams) {
                                const params = new URLSearchParams(
                                    searchParams
                                );
                                params.delete("priceFrom");
                                params.delete("priceTo");
                                setOpenFilterDrawer &&
                                    setOpenFilterDrawer(false);
                                router.push(`?${params.toString()}`);
                            }
                        }}
                    >
                        Xóa
                    </div>
                </div>
                <Radio.Group
                    value={resetPrice ? null : isPriceless}
                    className={"w-full justify-between"}
                >
                    <Radio
                        onClick={() => handleSelectPriceFilter(true)}
                        value={true}
                        className={"!text-base"}
                    >
                        Đồ cho tặng
                    </Radio>
                    <Radio
                        onClick={() => handleSelectPriceFilter(false)}
                        value={false}
                        className={"!text-base"}
                    >
                        Đồ trả phí
                    </Radio>
                </Radio.Group>
                {!isPriceless && price.to && price.from ? (
                    <>
                        <Slider
                            range={{ draggableTrack: true }}
                            defaultValue={[20000, 50000000]}
                            max={50000000}
                            min={20000}
                            onChange={(value: number[]) => {
                                setPrice({
                                    from: value[0],
                                    to: value[1],
                                });
                            }}
                            onChangeComplete={(value: number[]) => {
                                if (searchParams) {
                                    dispatch(
                                        setFilter({
                                            ...filter,
                                            priceFrom: value[0],
                                            priceTo: value[1],
                                        })
                                    );
                                    const params = new URLSearchParams(
                                        searchParams
                                    );
                                    params.delete("priceFrom");
                                    params.delete("priceTo");
                                    params.set(
                                        "priceFrom",
                                        value[0].toString()
                                    );
                                    params.set("priceTo", value[1].toString());
                                    setOpenFilterDrawer &&
                                        setOpenFilterDrawer(false);
                                    router.push(`?${params.toString()}`);
                                }
                            }}
                        />
                        <Flex justify={"space-between"} className={"w-full"}>
                            <div>{handleFormatCurrency(price.from)}</div>
                            <div>{handleFormatCurrency(price.to)}</div>
                        </Flex>
                    </>
                ) : (
                    ""
                )}
            </div>
            <div>
                <div className={"text-[17px] mb-2"}>
                    Theo tình trạng sản phẩm
                </div>
                <Checkbox.Group
                    value={filter.condition}
                    onChange={(e) => {
                        if (searchParams) {
                            dispatch(
                                setFilter({
                                    ...filter,
                                    condition: e?.length > 0 ? e : null,
                                })
                            );
                            const params = new URLSearchParams(searchParams);
                            params.delete("condition");
                            if (e?.length > 0) {
                                e?.forEach((id: any) => {
                                    params.append("condition", id);
                                });
                            }
                            setOpenFilterDrawer && setOpenFilterDrawer(false);
                            router.push(`?${params.toString()}`);
                        }
                    }}
                >
                    {Object.values(PRODUCT_CONDITION).map((condition: any) => (
                        <Checkbox
                            key={condition.LABEL}
                            value={condition.VALUE}
                            className={"!text-base"}
                        >
                            {condition.LABEL}
                        </Checkbox>
                    ))}
                </Checkbox.Group>
            </div>
        </>
    );
}
