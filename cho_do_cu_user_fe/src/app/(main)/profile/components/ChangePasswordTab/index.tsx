import React, {useEffect, useState} from "react";
import {Flex} from "antd";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {getNotification, isValidPassword} from "../../../../../../utils/helper";
import ErrorMessage from "@/components/ErrorMessage";
import {IChangePasswordData} from "@/app/(main)/profile/type";
import {requestChangePassword} from "@/api/profile";
import {SERVER_ERROR_MESSAGE} from "../../../../../../utils/constants";

const initialData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
}

export default function ChangePasswordTab() {
    const [data, setData] = useState<IChangePasswordData>(initialData)
    const [error, setError] = useState<IChangePasswordData>(initialData)
    const [disableBtnSubmit, setDisableBtnSubmit] = useState(true)
    const [isLoadingBtn, setIsLoadingBtn] = useState(false)

    useEffect(() => {
        let isError: boolean = false
        Object.keys(data).forEach((key: string) => {
            // @ts-ignore
            if (data[key] === '' || error[key] !== '') {
                isError = true
            }
        })
        setDisableBtnSubmit(isError)
    }, [data, error])

    const handleChangeInput = (value: string, key: string) => {
        setData({
            ...data,
            [key]: value
        })
        setError({
            ...error,
            [key]: ''
        })
        if (value) {
            if (key === 'newPassword') {
                setError({
                    ...error,
                    newPassword: !isValidPassword(value) ? 'Mật khẩu ít nhất 8 kí tự, chứa kí tự viết hoa, số, kí tự đặc biệt và không có khoảng trống!' : '',
                    confirmPassword: data.confirmPassword && data.confirmPassword !== value ? 'Mật khẩu xác nhận không trùng khớp!' : ''
                })
            } else if (key === 'confirmPassword') {
                setError({
                    ...error,
                    confirmPassword: data.newPassword !== value ? 'Mật khẩu xác nhận không trùng khớp!' : ''
                })
            }
        }
    }

    const handleSubmitChangePassword = () => {
        setIsLoadingBtn(true)
        requestChangePassword(data)
            .then(res => {
                setData(initialData)
                setError(initialData)
                getNotification('success', 'Đổi mật khẩu thành công')
            })
            .catch(err => {
                if (err.response.status === 400) {
                    setError({
                        ...error,
                        currentPassword: err.response.data
                    })
                } else {
                    getNotification('error', SERVER_ERROR_MESSAGE)
                }
            })
            .finally(() => {
                setIsLoadingBtn(false)
            })
    }

    return <div style={{fontFamily: 'Helvetica, Arial, Roboto, sans-serif'}}>
        <div className={'font-semibold text-[19px] tracking-wide'}>Đổi mật khẩu</div>
        <Flex gap={12} className={'mt-5'} vertical>
            <Flex vertical className={'w-full'} gap={20}>
                <div className={'input-wrap'}>
                    <div className={'label-wrap !text-[16px]'}>
                        Mật khẩu hiện tại <span className={'text-[red]'}>*</span>
                    </div>
                    <Input
                        password
                        className={'h-[45px] w-[350px]'}
                        size={'large'}
                        placeholder={'Nhập mật khẩu hiện tại'}
                        onChange={e => handleChangeInput(e.target.value, 'currentPassword')}
                        value={data.currentPassword}
                    />
                    {error.currentPassword ? <ErrorMessage message={error.currentPassword}/> : ''}
                </div>
                <div className={'input-wrap'}>
                    <div className={'label-wrap !text-[16px]'}>
                        Mật khẩu mới <span className={'text-[red]'}>*</span>
                    </div>
                    <Input
                        password
                        className={'h-[45px] w-[350px]'}
                        size={'large'}
                        placeholder={'Nhập mật khẩu mới'}
                        onChange={e => handleChangeInput(e.target.value, 'newPassword')}
                        value={data.newPassword}
                    />
                    {error.newPassword ? <ErrorMessage message={error.newPassword}/> : ''}
                </div>
                <div className={'input-wrap'}>
                    <div className={'label-wrap !text-[16px]'}>
                        Xác nhận mật khẩu mới <span className={'text-[red]'}>*</span>
                    </div>
                    <Input
                        password
                        className={'h-[45px] w-[350px]'}
                        size={'large'}
                        placeholder={'Nhập mật khẩu xác nhận'}
                        onChange={e => handleChangeInput(e.target.value, 'confirmPassword')}
                        value={data.confirmPassword}
                    />
                    {error.confirmPassword ? <ErrorMessage message={error.confirmPassword}/> : ''}
                </div>
            </Flex>
            <div className={'mt-5'}>
                <Button
                    size={'large'}
                    disabled={disableBtnSubmit}
                    onClick={handleSubmitChangePassword}
                    loading={isLoadingBtn}
                >
                    Đổi mật khẩu
                </Button>
            </div>
        </Flex>
    </div>
}
