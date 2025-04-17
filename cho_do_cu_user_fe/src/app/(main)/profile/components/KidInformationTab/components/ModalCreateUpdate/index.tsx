import React, {useEffect, useState} from "react";
import {DatePicker, Flex, InputNumber, Modal, Radio} from "antd";
import {Baby, IChildren} from "../../../../../../../../utils/types";
import {GENDER, SERVER_ERROR_MESSAGE} from "../../../../../../../../utils/constants";
import Input from "@/components/Input";
import {capitalizeFirstLetter, getNotification} from "../../../../../../../../utils/helper";
import {requestAddKidInfo} from "@/api/profile";
import dayjs from "dayjs";

interface IProps {
    isOpen: boolean,
    baby: Baby | null,
    handleClose: () => void,
    handleRequestGetBabies: () => void
    handleToggleModalCreateUpdate: (type: string, baby: Baby | null) => void
}

const initialBabyData: Baby = {
    firstname: '',
    lastname: '',
    birthdate: null,
    gender: GENDER.MALE.VALUE,
    weight: null,
    height: null,
}

const InputRow = ({children, classname = ''}: IChildren) =>
    <Flex justify={'space-between'} className={`mt-4 ${classname}`} wrap gap={10}>
        {children}
    </Flex>
const InputWrap = ({children}: IChildren) => <Flex vertical className={'w-[210px] max-xsm:w-full'}>
    {children}
</Flex>

export default function ModalCreateUpdate(
    {
        isOpen, baby,
        handleClose, handleRequestGetBabies, handleToggleModalCreateUpdate
    }: IProps) {
    const [babyData, setBabyData] = useState<Baby>(initialBabyData)
    const [isErrorSubmit, setIsErrorSubmit] = useState<boolean>(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const isCreate: boolean = !baby

    const handleChangeData = (value: string | number | null, type: string) => {
        let formattedValue: string | number | null = value
        if (typeof value === 'string' && value && (type === 'firstname' || type === 'lastname')) {
            formattedValue = value ? capitalizeFirstLetter(value) as string : ''
        }
        setBabyData({
            ...babyData,
            [type]: formattedValue
        })
    }

    const handleChangeBirthDate = (value: any) => {
        setBabyData({
            ...babyData,
            birthdate: value
        })
    }

    const handleSubmit = () => {
        setLoadingSubmit(true)
        if (isCreate) {
            requestAddKidInfo(babyData)
                .then(() => {
                    handleRequestGetBabies()
                    handleToggleModalCreateUpdate('close', null)
                    setBabyData(initialBabyData)
                    getNotification('success', 'Thêm thông tin bé thành công')
                })
                .catch(err => {
                    getNotification('error', SERVER_ERROR_MESSAGE)
                })
                .finally(() => {
                    setLoadingSubmit(false)
                })
        } else {

        }
    }

    useEffect(() => {
        if (baby) {
            setBabyData({
                ...baby,
                birthdate: dayjs(baby?.birthdate)
            })
        } else {
            setBabyData(initialBabyData)
        }
    }, [baby])

    useEffect(() => {
        if (!babyData.firstname || !babyData.lastname || !babyData.birthdate) {
            setIsErrorSubmit(true)
        } else {
            setIsErrorSubmit(false)
        }
    }, [babyData])

    return <Modal
        title={
            <div className={'text-[17px]'}>
                {isCreate ? 'Thêm thông tin con' : 'Cập nhật thông tin - '}&nbsp;
                {
                    !isCreate ? <span className={'text-danger-700'}>
                        {baby?.firstname + " " + baby?.lastname}
                    </span> : ''
                }
            </div>
        }
        open={isOpen}
        onOk={handleSubmit}
        onCancel={handleClose}
        okButtonProps={{disabled: isErrorSubmit, className: 'main-btn', loading: loadingSubmit}}
        okText={isCreate ? 'Tạo mới' : 'Lưu'}
        width={500}
        maskClosable={false}
    >
        <Flex vertical className={'mt-3 mb-8 main-date-picker'}>
            <Flex vertical>
                <div className={'font-medium'}>Họ và tên <span className={'required'}>*</span></div>
                <InputRow classname={'!mt-1.5'}>
                    <Input
                        placeholder={'Nhập họ'} rootClassName={'h-[36px] !pl-[5px]'}
                        extraClassname={'!w-[210px] max-xsm:!w-full'}
                        value={babyData.firstname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeData(e.target.value, 'firstname')}
                    />
                    <Input
                        placeholder={'Nhập tên'} rootClassName={'h-[36px] !pl-[5px]'}
                        extraClassname={'!w-[210px] max-xsm:!w-full'}
                        value={babyData.lastname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeData(e.target.value, 'lastname')}
                    />
                </InputRow>
            </Flex>
            <InputRow>
                <InputWrap>
                    <div className={'font-medium'}>Ngày sinh <span className={'required'}>*</span></div>
                    <DatePicker
                        placeholder={'Chọn ngày sinh'}
                        className={'mt-1.5'}
                        rootClassName={'h-[36px]'}
                        onChange={handleChangeBirthDate}
                        value={babyData.birthdate}
                        format={'DD/MM/YYYY'}
                        disabledDate={(current: dayjs.Dayjs) => current && current.isAfter(new Date())}
                    />
                </InputWrap>
                <InputWrap>
                    <div className={'font-medium'}>Giới tính <span className={'required'}>*</span></div>
                    <Radio.Group
                        className={'mt-2.5 main-radio'} value={babyData.gender}
                        onChange={e => handleChangeData(e.target.value, 'gender')}
                    >
                        <Radio value={GENDER.MALE.VALUE}>{GENDER.MALE.LABEL}</Radio>
                        <Radio value={GENDER.FEMALE.VALUE} className={'ml-8'}>{GENDER.FEMALE.LABEL}</Radio>
                    </Radio.Group>
                </InputWrap>
            </InputRow>
            <InputRow>
                <InputWrap>
                    <div className={'font-medium'}>Chiều cao</div>
                    <InputNumber
                        min={46}
                        max={100}
                        onWheel={() => {
                        }}
                        addonAfter={'cm'}
                        placeholder={'Chiều cao (46 - 100)'}
                        value={babyData.height || ''}
                        className={'mt-1.5 main-input-number'}
                        rootClassName={'h-[35px]'}
                        onChange={(value: number | "" | null) => handleChangeData(value, 'height')}
                    />
                </InputWrap>
                <InputWrap>
                    <div className={'font-medium'}>Cân nặng</div>
                    <InputNumber
                        min={2.5}
                        max={25}
                        onWheel={() => {
                        }}
                        addonAfter={'kg'}
                        placeholder={'Cân nặng (2.5 - 25)'}
                        value={babyData.weight || ''}
                        className={'mt-1.5 main-input-number'}
                        rootClassName={'h-[35px]'}
                        onChange={(value: number | "" | null) => handleChangeData(value, 'weight')}
                    />
                </InputWrap>
            </InputRow>
        </Flex>
    </Modal>
}
