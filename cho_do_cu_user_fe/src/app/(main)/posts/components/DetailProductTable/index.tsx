"use client";

import React, { useMemo } from "react";
import { ColorPicker, Divider, Flex, Table } from "antd";
import { ATTRIBUTE_INPUT_TYPE } from "../../../../../../utils/constants";

export default function DetailProductTable({
    productAttributes,
}: {
    productAttributes: any;
}) {
    const detailProductValues: any = useMemo(() => {
        return productAttributes?.map((productAttribute: any) => ({
            type: productAttribute?.attribute_id?.input_type,
            title: productAttribute?.attribute_id?.label,
            value: productAttribute?.value,
        }));
    }, [productAttributes?.length]);

    return (
        <Flex vertical className="w-fullh-fit border-[1px] rounded-lg mt-2">
            {detailProductValues?.map(
                (
                    item: { title: string; value: string; type: string },
                    index: number
                ) => (
                    <Flex key={index} className="border-b-[1px]">
                        <div className="text-[#8c8c8c] bg-[#f4f4f4] font-medium w-1/3 p-3">
                            <Flex
                                className="w-full overflow-hidden text-ellipsis text-[15px]"
                                align="center"
                            >
                                {item.title}
                            </Flex>
                        </div>
                        <div className="min-w-[200px] py-3 px-5">
                            {item.type !==
                            ATTRIBUTE_INPUT_TYPE.COLOR_PICKER.VALUE ? (
                                <Flex
                                    className="w-full overflow-hidden text-ellipsis text-[15px]"
                                    align="center"
                                >
                                    {item.value}
                                </Flex>
                            ) : (
                                <ColorPicker value={item.value} disabled />
                            )}
                        </div>
                    </Flex>
                )
            )}
        </Flex>
    );
}
