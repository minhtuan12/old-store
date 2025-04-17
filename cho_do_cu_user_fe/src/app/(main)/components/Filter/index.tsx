"use client";

import { Drawer, Flex } from "antd";
import FilterByRegions from "../FilterByRegions";
import FilterBar from "../FilterBar";
import { FilterOutlined } from "@ant-design/icons";
import useWindowSize from "@/hooks/useWindowSize";
import { useState } from "react";

export default function Filter({
    regions,
    categories,
}: {
    regions: any;
    categories: any;
}) {
    const { width } = useWindowSize();
    const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

    return !!(width && width > 1024) ? (
        <Flex
            vertical
            gap={15}
            className={
                "rounded-lg bg-white h-[calc(100vh_-_140px)] w-[280px] p-5 fixed"
            }
        >
            <Flex
                gap={8}
                className={"font-semibold text-[18px] tracking-[0.7px]"}
            >
                <FilterOutlined />
                Bộ lọc tìm kiếm
            </Flex>
            <FilterByRegions regions={regions} />
            <FilterBar categories={categories} />
        </Flex>
    ) : (
        <>
            <Flex
                gap={8}
                className={
                    "font-semibold text-[18px] tracking-[0.7px] mb-[-40px] text-[#f80]"
                }
                onClick={() => setOpenFilterDrawer(true)}
            >
                <FilterOutlined />
                Bộ lọc tìm kiếm
            </Flex>
            <Drawer
                closable
                destroyOnClose
                title={<p className="flex items-center">Bộ lọc tìm kiếm</p>}
                placement="left"
                open={openFilterDrawer}
                onClose={() => setOpenFilterDrawer(false)}
            >
                <Flex vertical gap={20} className={"p-2"}>
                    <FilterByRegions regions={regions} setOpenFilterDrawer={setOpenFilterDrawer}/>
                    <FilterBar categories={categories} setOpenFilterDrawer={setOpenFilterDrawer}/>
                </Flex>
            </Drawer>
        </>
    );
}
