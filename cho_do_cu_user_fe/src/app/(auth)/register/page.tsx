'use client'

import React, {useEffect, useState} from "react";
import styles from './styles.module.scss'
import Image from "next/image";
import Logo from '../../../../public/logo.png'
import InputWithLabel from "@/components/InputWithLabel";
import {Button, Checkbox} from "antd";
import '../styles.scss'
import Link from "next/link";
import {
    capitalizeFirstLetter,
    getNotification,
    handleCheckValidateConfirm,
    IValidationResult
} from "../../../../utils/helper";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/configureStore";
import ErrorMessage from "@/components/ErrorMessage";
import {setErrorRegister} from "@/store/slices/auth";
import {IRegister, requestRegister} from "@/api/auth";
import {SERVER_ERROR_MESSAGE} from "../../../../utils/constants";
import GoogleLogin from "@/app/(auth)/components/GoogleLogin";

export default function Register() {
    const [termsCheckbox, setTermCheckbox] = useState(true)
    const [termsError, setTermsError] = useState('')
    const [registerData, setRegisterData] = useState<IRegister>({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    })
    const [isLoadingRequestRegister, setIsLoadingRequestRegister] = useState(false)
    const errorRegister = useSelector((state: RootState) => state.auth.errorRegister)
    const dispatch = useDispatch()

    const handleChangeInput = (value: string, type: string): void => {
        dispatch(setErrorRegister({
            ...errorRegister,
            [type]: ''
        }))

        setRegisterData({
            ...registerData,
            [type]: (type === 'firstname' || type === 'lastname') ? capitalizeFirstLetter(value) : value
        })
    }

    const handleChangeCheckbox = (e: any): void => {
        setTermsError('')
        setTermCheckbox(e.target.checked)
    }

    const handleRequestRegister = async () => {
        if (!termsCheckbox) {
            setTermsError('Bạn phải đồng ý với điều khoản trước khi đăng ký')
        }

        const formValidation: IValidationResult = handleCheckValidateConfirm(registerData, errorRegister)
        if (formValidation.isError) {
            dispatch(setErrorRegister(formValidation.errorData))
        } else if (termsCheckbox) {
            setIsLoadingRequestRegister(true)
            const formattedData: IRegister = {
                ...registerData,
                firstname: registerData.firstname?.trim(),
                lastname: registerData.lastname?.trim(),
                email: registerData.email?.trim()
            }

            await requestRegister(formattedData)
                .then(res => {
                    setIsLoadingRequestRegister(false)
                    setRegisterData({
                        firstname: '',
                        lastname: '',
                        email: '',
                        password: ''
                    })
                    getNotification('success', 'Vui lòng kiểm tra email để kích hoạt tài khoản')
                })
                .catch(err => {
                    setIsLoadingRequestRegister(false)
                    switch (err.response.status) {
                        case 400:
                            dispatch(setErrorRegister({
                                ...errorRegister,
                                email: err.response.data
                            }))
                            break;
                        case 500:
                            getNotification('error', SERVER_ERROR_MESSAGE)
                            break;
                        default:
                            getNotification('error', SERVER_ERROR_MESSAGE)
                            break;
                    }
                })
        }
    }

    useEffect(() => {
        dispatch(setErrorRegister({
            firstname: '',
            lastname: '',
            email: '',
            password: ''
        }))
    }, [dispatch])

    return <div className={styles.registerWrap}>
        <div className={styles.imageWrap}>
            <Image src={Logo} alt={'logo'} width={220} priority/>
        </div>
        <div className={styles.title}>
            Đăng ký tài khoản
        </div>
        <div className={styles.registerFormContent}>
            <div className={styles.nameInput}>
                <div className={styles.halfInput}>
                    <InputWithLabel
                        isRequired
                        label={'Họ'}
                        value={registerData.firstname}
                        onChange={e => handleChangeInput(e.target.value, 'firstname')}
                    />
                    {errorRegister.firstname ? <ErrorMessage message={errorRegister.firstname}/> : ''}
                </div>
                <div className={styles.halfInput}>
                    <InputWithLabel
                        isRequired
                        label={'Tên'}
                        value={registerData.lastname}
                        onChange={e => handleChangeInput(e.target.value, 'lastname')}
                    />
                    {errorRegister.lastname ? <ErrorMessage message={errorRegister.lastname}/> : ''}
                </div>
            </div>
            <div className={styles.inputWrap}>
                <InputWithLabel
                    isRequired
                    label={'Email'}
                    value={registerData.email}
                    onChange={e => handleChangeInput(e.target.value, 'email')}
                />
                {errorRegister.email ? <ErrorMessage message={errorRegister.email}/> : ''}
            </div>
            <div className={styles.inputWrap}>
                <InputWithLabel
                    isRequired
                    isPasswordInput
                    label={'Mật khẩu'}
                    value={registerData.password}
                    onChange={e => handleChangeInput(e.target.value, 'password')}
                />
                {errorRegister.password ? <ErrorMessage message={errorRegister.password}/> : ''}
            </div>
        </div>
        <div className={`${styles.termsOfUse} custom-checkbox`}>
            <Checkbox checked={termsCheckbox} onChange={handleChangeCheckbox}>
                Đồng ý với <Link href={'/terms-of-use'} target={'_blank'}>Điều khoản sử dụng</Link>
            </Checkbox>
            {termsError ? <ErrorMessage message={termsError}/> : ''}
        </div>
        <div className={`auth-button ${styles.btnWrap}`}>
            <Button type={'primary'} loading={isLoadingRequestRegister} size={'large'}
                    onClick={handleRequestRegister}>
                Đăng ký
            </Button>
        </div>

        <GoogleLogin/>

        <div className={styles.hasAccountOption}>
            Bạn đã có tài khoản? <Link href={'/login'}>Đăng nhập ngay</Link>
        </div>
    </div>
}
