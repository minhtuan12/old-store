'use client'

import React, {useEffect, useState} from "react";
import {Button, Result, Spin} from "antd";
import '../../styles.scss'
import Link from "next/link";
import styles from './styles.module.scss'
import {requestVerifyEmail} from "@/api/auth";

type VerifyResult = {
    status: string,
    message: string
}

export default function VerifyEmail({params}: { params: { token: string } }): JSX.Element {
    const [result, setResult] = useState<VerifyResult>({
        status: '',
        message: ''
    })
    const [redirectBtn, setRedirectBtn] = useState({
        content: '',
        url: ''
    })
    const [isLoadingRequest, setIsLoadingRequest] = useState<boolean>(false)

    useEffect(() => {
        const handleRequestVerifyEmail = async () => {
            setIsLoadingRequest(true)
            await requestVerifyEmail(params?.token)
                .then(res => {
                    setIsLoadingRequest(false)
                    setResult({
                        status: 'success',
                        message: "Kích hoạt tài khoản thành công!"
                    })
                    setRedirectBtn({
                        content: 'Đăng nhập ngay',
                        url: '/login'
                    })
                })
                .catch(err => {
                    const responseStatus = err.response.status
                    if (responseStatus === 400) {
                        setResult({
                            status: `400`,
                            message: 'Mã xác thực đã hết hạn, vui lòng đăng ký lại'
                        })
                        setRedirectBtn({
                            content: 'Đăng ký ngay',
                            url: '/register'
                        })
                    } else if (responseStatus === 401) {
                        setResult({
                            status: `401`,
                            message: 'Bạn đã kích hoạt tài khoản trước đó'
                        })
                        setRedirectBtn({
                            content: 'Đăng nhập ngay',
                            url: '/login'
                        })
                    } else {
                        setResult({
                            status: `500`,
                            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
                        })
                        setRedirectBtn({
                            content: 'Về trang chủ',
                            url: '/'
                        })
                    }
                    setIsLoadingRequest(false)
                })
        }

        handleRequestVerifyEmail()
    }, [params?.token])

    return <>
        {
            isLoadingRequest ? <Spin size={"large"}/> :
                <Result
                    status={result.status !== 'success' ? 'error' : "success"}
                    title={result.message}
                    extra={[
                        <div key="console" className={styles.redirectBtnWrap}>
                            <Link href={redirectBtn.url} className={`auth-button redirect-btn`}>
                                <Button type="primary" size={"large"}>
                                    {redirectBtn.content}
                                </Button>
                            </Link>
                        </div>
                    ]}
                />
        }
    </>
}
