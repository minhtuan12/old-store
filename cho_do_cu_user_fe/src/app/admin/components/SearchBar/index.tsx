'use client'

import React from "react";
import {SearchOutlined} from "@ant-design/icons";
import {Input, InputProps} from "antd";

export default function SearchBar(props: InputProps) {
    return <Input {...props} prefix={<SearchOutlined className={'mr-1.5 ml-2'}/>}/>
}
