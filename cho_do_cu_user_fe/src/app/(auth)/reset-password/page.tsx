'use client'

import React, {Suspense, useEffect, useState} from "react";
import styles from './styles.module.scss'
import Image from "next/image";
import Logo from '../../../../public/logo.png'
import InputWithLabel from "@/components/InputWithLabel";
import {Button} from "antd";
import '../styles.scss'
import {requestResetPassword} from "@/api/auth";
import {getNotification, isPositiveInteger, isValidPassword} from "../../../../utils/helper";
import {SERVER_ERROR_MESSAGE} from "../../../../utils/constants";
import ErrorMessage from "@/components/ErrorMessage";
import {ReadonlyURLSearchParams, redirect, useSearchParams} from "next/navigation";
import Loading from "@/components/Loading";

function ResetPasswordSuspense() {
    const searchParams: ReadonlyURLSearchParams = useSearchParams() as ReadonlyURLSearchParams
    const resetToken: string | null = searchParams.get('token')
    const expiryTime: string | null = searchParams.get('expired_within')
    const [minutes, setMinutes] = useState<string>('')
    const [seconds, setSeconds] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const [isLoadingRequestResetPassword, setIsLoadingRequestResetPassword] = useState<boolean>(false)
    const [errorResetPassword, setErrorResetPassword] = useState<string>('')
    const [isTimeOut, setIsTimeOut] = useState<boolean>(false)

    const handleChangeInput = (value: string): void => {
        setErrorResetPassword('')
        setNewPassword(value)
    }

    const handleSubmitBtn = async () => {
        if (!isTimeOut) {
            if (!newPassword) {
                setErrorResetPassword('Mật khẩu mới không được bỏ trống!')
                return
            } else if (!isValidPassword(newPassword)) {
                setErrorResetPassword('Mật khẩu ít nhất 8 kí tự, chứa kí tự viết hoa, số, kí tự đặc biệt và không có khoảng trống!')
                return
            }

            if (!errorResetPassword) {
                setIsLoadingRequestResetPassword(true)
                await requestResetPassword(resetToken as string, newPassword)
                    .then(res => {
                        setIsLoadingRequestResetPassword(false)
                        getNotification('success', 'Đặt lại mật khẩu thành công')
                    })
                    .catch(err => {
                        setIsLoadingRequestResetPassword(false)
                        const errorStatus = err.response.status
                        switch (errorStatus) {
                            case 500:
                                getNotification('error', SERVER_ERROR_MESSAGE)
                        }
                    })
            }
        } else {
            // TODO: request reset password
        }
    }

    const handleFormatTime = (time: string): string => {
        return parseInt(time) < 10 ? `0${time}` : String(time)
    }

    useEffect(() => {
        if (expiryTime) {
            const expiry = parseInt(expiryTime)
            setMinutes(String(Math.floor(expiry / 60)))
            setSeconds(String(expiry % 60))
        }
    }, [expiryTime])

    useEffect(() => {
        if (parseInt(minutes) === 0 && parseInt(seconds) === 0) {
            setIsTimeOut(true)
            return
        }
        if (!minutes || parseInt(minutes) < 0 || !seconds) {
            return
        }

        let tmpSeconds = parseInt(seconds);
        const timer = setInterval(function () {
            tmpSeconds--
            if (tmpSeconds < 0) {
                const latestMinutes = parseInt(minutes) - 1
                setMinutes(prev => prev && String(latestMinutes > 0 ? latestMinutes : 0))
                setSeconds(String(latestMinutes > 0 ? 59 : 0))
            } else {
                setSeconds(String(tmpSeconds))
            }
        }, 1000);

        return () => clearInterval(timer)
    }, [minutes, seconds])

    return (!resetToken || !expiryTime || !isPositiveInteger(expiryTime)) ? redirect('/404') :
        <div className={styles.forgotWrap}>
            <div className={styles.imageWrap}>
                <Image src={Logo} alt={'logo'} width={220} priority/>
            </div>
            <div className={styles.title}>
                Đặt lại mật khẩu
            </div>
            <div className={styles.forgotFormContent}>
                <div className={styles.inputWrap}>
                    <InputWithLabel
                        disabled={isTimeOut}
                        isRequired
                        isPasswordInput
                        label={'Mật khẩu mới'}
                        value={newPassword}
                        onChange={e => handleChangeInput(e.target.value)}
                    />
                    {errorResetPassword ? <ErrorMessage message={errorResetPassword}/> : ''}
                </div>
            </div>
            <div className={`auth-button ${styles.btnWrap}`}>
                <Button
                    type={'primary'} loading={isLoadingRequestResetPassword}
                    size={'large'} onClick={handleSubmitBtn}
                    rootClassName={isTimeOut ? styles.disabledBtn : ''}
                >
                    {isTimeOut ? 'Hết thời gian, gửi lại yêu cầu' : 'Xác nhận'} <span>
                    {
                        isTimeOut ? '' :
                            `(${(!minutes || !seconds) ? '--:--' :
                                `${handleFormatTime(minutes)}:${handleFormatTime(seconds)}`})`
                    }
                </span>
                </Button>
            </div>
        </div>
}

export default function ResetPassword(): JSX.Element {
    return <Suspense fallback={<Loading/>}>
        <ResetPasswordSuspense/>
    </Suspense>
}
