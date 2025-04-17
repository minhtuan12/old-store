'use client'

import React, {useState} from "react";
import styles from './styles.module.scss'
import Image from "next/image";
import Logo from '../../../../public/logo.png'
import InputWithLabel from "@/components/InputWithLabel";
import {Button} from "antd";
import '../styles.scss'
import {requestForgotPassword} from "@/api/auth";
import {getNotification, isValidEmail} from "../../../../utils/helper";
import {SERVER_ERROR_MESSAGE} from "../../../../utils/constants";
import ErrorMessage from "@/components/ErrorMessage";

export default function ForgotPassword(): JSX.Element {
    const [email, setEmail] = useState<string>('')
    const [errorForgotPassword, setErrorForgotPassword] = useState<string>('')
    const [isLoadingSubmitForgotPassword, setIsLoadingSubmitForgotPassword] = useState<boolean>(false)

    const handleChangeInput = (value: string): void => {
        setErrorForgotPassword('')
        setEmail(value)
    }

    const handleRequestForgotPassword = async () => {
        if (!email) {
            setErrorForgotPassword('Email không được bỏ trống!')
            return
        } else if (!isValidEmail(email)) {
            setErrorForgotPassword('Email không đúng định dạng!')
            return
        }

        setIsLoadingSubmitForgotPassword(true)
        await requestForgotPassword(email)
            .then(res => {
                setIsLoadingSubmitForgotPassword(false)
                getNotification('success', 'Yêu cầu thành công. Vui lòng kiểm tra email')
            })
            .catch(err => {
                setIsLoadingSubmitForgotPassword(false)
                const responseStatus = err.response.status
                switch (responseStatus) {
                    case 404:
                        getNotification('error', 'Tài khoản không tồn tại')
                        break;
                    case 500:
                        getNotification('error', SERVER_ERROR_MESSAGE)
                        break;
                }
            })
    }

    return <div className={styles.forgotWrap}>
        <div className={styles.imageWrap}>
            <Image src={Logo} alt={'logo'} width={220} priority/>
        </div>
        <div className={styles.title}>
            Yêu cầu đặt lại mật khẩu
        </div>
        <div className={styles.forgotFormContent}>
            <div className={styles.inputWrap}>
                <InputWithLabel
                    isRequired
                    label={'Email'}
                    value={email}
                    onChange={e => handleChangeInput(e.target.value)}
                />
            </div>
            {errorForgotPassword ? <ErrorMessage message={errorForgotPassword}/> : ''}
        </div>
        <div className={`auth-button ${styles.btnWrap}`}>
            <Button onClick={handleRequestForgotPassword} type={'primary'}
                    size={'large'} loading={isLoadingSubmitForgotPassword}
            >
                Tiếp tục
            </Button>
        </div>
    </div>
}
