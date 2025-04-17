"use client";

import { Flex, Select } from "antd";
import {
    handleFormatCityData,
    handleRemoveVietnameseTones,
} from "../../../../../utils/helper";
import "../../../global.scss";
import { CompassOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/configureStore";
import { useRouter, useSearchParams } from "next/navigation";
import { setFilter } from "@/store/slices/app";

export default function FilterByRegions({
    regions = null,
    setOpenFilterDrawer,
}: {
    regions: any;
    setOpenFilterDrawer?: (isOpen: boolean) => void;
}) {
    const filter = useSelector((state: RootState) => state.app.filter);
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChangeRegion = (region: { city: string }) => {
        const params = new URLSearchParams(searchParams as any);
        dispatch(setFilter({ ...filter, city: region.city }));
        if (region.city) {
            params.set("city", region.city);
        } else {
            params.delete("city");
        }
        setOpenFilterDrawer && setOpenFilterDrawer(false);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className={"main-select"}>
            <Select
                className={"w-full"}
                rootClassName={"text-[20px]"}
                placeholder={
                    <Flex gap={5}>
                        <CompassOutlined />
                        Lọc theo vị trí
                    </Flex>
                }
                options={handleFormatCityData(regions, "city")}
                showSearch
                allowClear
                value={filter.city}
                onChange={(e) => handleChangeRegion({ city: e })}
                optionFilterProp={"label"}
                filterOption={(inputValue, option) =>
                    handleRemoveVietnameseTones(
                        option?.label?.toLowerCase()
                    ).includes(
                        handleRemoveVietnameseTones(inputValue?.toLowerCase())
                    )
                }
            />
        </div>
    );
}
