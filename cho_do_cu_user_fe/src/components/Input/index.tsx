import {Input, InputProps} from "antd";
import './styles.scss'
import React from "react";

interface IProps extends InputProps {
    password?: boolean,
    extraClassname?: string
}

const DefaultInput: React.FC<IProps> = ({password = false, extraClassname = '', ...rest}) => {
    return <div className={`custom-input ${extraClassname}`}>
        {
            password ? <Input.Password {...rest}/> :
                <Input {...rest}/>
        }
    </div>
}

export default DefaultInput
