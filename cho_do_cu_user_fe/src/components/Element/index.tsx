import React, { memo, useEffect, useRef } from "react";
import { ATTRIBUTE_INPUT_TYPE } from "../../../utils/constants";
import Input from "@/components/Input";
import {
    Checkbox,
    ColorPicker,
    DatePicker,
    Flex,
    Select,
    TimePicker,
} from "antd";
import "../../app/global.scss";

// eslint-disable-next-line react/display-name
const Element = memo(
    ({ attribute, isFocused, setFocusedAttributeId, ...rest }: any) => {
        const { label, input_type, initial_value, is_required } = attribute;
        const inputRef: React.MutableRefObject<any> = useRef(null);

        useEffect(() => {
            if (isFocused && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isFocused]);

        const ElementTag = () => {
            if (input_type === ATTRIBUTE_INPUT_TYPE.TEXT.VALUE) {
                return (
                    <Input
                        {...rest}
                        ref={inputRef}
                        rootClassName={"h-[45px]"}
                        placeholder={`Nhập ${label}`}
                        autoFocus={isFocused}
                        onFocus={() => {
                            if (inputRef.current) {
                                const length = rest.value?.length;
                                inputRef.current?.setSelectionRange(
                                    length,
                                    length
                                );
                            }
                            setFocusedAttributeId(attribute?._id as string);
                        }}
                    />
                );
            } else if (input_type === ATTRIBUTE_INPUT_TYPE.CHECKBOX.VALUE) {
                return (
                    <Checkbox.Group {...rest}>
                        {initial_value?.map((option: string) => (
                            <Checkbox key={option} value={option}>
                                {option}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                );
            } else if (input_type === ATTRIBUTE_INPUT_TYPE.DROPDOWN.VALUE) {
                return (
                    <Select
                        {...rest}
                        allowClear={!is_required}
                        placeholder={`Chọn ${label}`}
                        options={initial_value?.map((item: string) => ({
                            label: item,
                            value: item,
                        }))}
                    />
                );
            } else if (input_type === ATTRIBUTE_INPUT_TYPE.DATE.VALUE) {
                return <DatePicker {...rest} format={"DD/MM/YYYY"} />;
            } else if (input_type === ATTRIBUTE_INPUT_TYPE.COLOR_PICKER.VALUE) {
                return <ColorPicker {...rest} format="hex" />;
            } else if (input_type === ATTRIBUTE_INPUT_TYPE.TIME.VALUE) {
                return <TimePicker {...rest} />;
            }
        };

        return (
            <Flex
                vertical
                gap={3}
                className={"custom-input main-select custom-upload"}
            >
                <div className={"font-medium text-[15px]"}>
                    {label}{" "}
                    {is_required ? <span className={"required"}>*</span> : ""}
                </div>
                <ElementTag />
            </Flex>
        );
    }
);

export default Element;
