import React from "react";
import {Button, ButtonProps} from "antd";
import './styles.scss'

interface IProps extends ButtonProps {
    reverseColor?: boolean
}

const DefaultButton: React.FC<IProps> = ({reverseColor, ...rest}) => {
    return <div className={reverseColor ? 'custom-button-reverse' : 'custom-button'}>
        <Button {...rest}></Button>
    </div>
}

export default DefaultButton
