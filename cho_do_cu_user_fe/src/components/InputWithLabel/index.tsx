'use client'

import {Input, InputProps, InputRef} from "antd";
import './styles.scss'
import React, {useEffect, useRef, useState} from "react";
import styles from './styles.module.scss'

interface IProps extends InputProps {
    width?: string,
    label: string,
    isPasswordInput?: boolean,
    isRequired?: boolean,
    small?: boolean
}

const InputWithLabel: React.FC<IProps> = (
    {
        width = '',
        label,
        isPasswordInput= false,
        isRequired= false,
        small = false,
        ...rest
    }
) => {
    const [isInputActive, setIsInputActive] = useState<boolean>(false)
    const inputRef = useRef<InputRef>(null)

    useEffect(() => {
        if (isInputActive && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isInputActive])

    return <div className={`custom-input-with-label ${width} ${small ? 'small-input' : ''}`}>
        {
            isPasswordInput ?
                <Input.Password
                    {...rest}
                    ref={inputRef}
                    onFocus={() => setIsInputActive(true)}
                    onBlur={() => setIsInputActive(false)}
                /> :
                <Input
                    {...rest}
                    ref={inputRef}
                    onFocus={() => setIsInputActive(true)}
                    onBlur={() => setIsInputActive(false)}
                />
        }
        <div className={(isInputActive || rest.value) ? 'active-label' : 'custom-label'}
             onClick={() => setIsInputActive(true)}
             onBlur={() => setIsInputActive(false)}
        >
            {label} {isRequired ? <span className={styles.required}>*</span> : ''}
        </div>
    </div>
}

export default InputWithLabel
