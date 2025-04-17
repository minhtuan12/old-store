import {Flex, Input, Modal} from "antd";
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import _ from "lodash";
import React, {memo, useEffect, useState} from "react";
import {Attribute} from "../../../../../../utils/types";
import {countDuplicateValue} from "../../../../../../utils/helper";
import ErrorMessage from "@/components/ErrorMessage";

interface IProps {
    initialValues: string[]
    currentAttributeToAddInitialValue: Attribute | undefined,
    setCurrentAttributeToAddInitialValue: React.Dispatch<React.SetStateAction<Attribute | undefined>>,
    setCurrentAttributeIndex: React.Dispatch<React.SetStateAction<number>>,
    setInitialValues: React.Dispatch<React.SetStateAction<string[]>>,
    handleSetInitialValueForAttribute: () => void,
}

const ModalAddOptions = memo(function ModalAddOption(
    {
        currentAttributeToAddInitialValue,
        handleSetInitialValueForAttribute,
        setCurrentAttributeIndex,
        setCurrentAttributeToAddInitialValue,
        setInitialValues,
        initialValues
    }: IProps) {
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (initialValues?.length === 0) {
            setError(`Các lựa chọn không được bỏ trống!`)
        } else {
            const duplicateOptions = countDuplicateValue(initialValues)
            if (duplicateOptions?.length > 0) {
                setError(`Giá trị ${duplicateOptions?.join(', ')} đang bị lặp lại!`)
            } else {
                setError('')
            }
        }
    }, [initialValues])

    return <Modal
        title={<div className={'text-[17px]'}>
            Thêm các lựa chọn cho thuộc tính&nbsp;
            <span className={'text-danger-700'}>{currentAttributeToAddInitialValue?.label || '...'}</span>
        </div>
        }
        open={currentAttributeToAddInitialValue !== undefined}
        onOk={handleSetInitialValueForAttribute}
        onCancel={() => {
            setCurrentAttributeIndex(-1)
            setCurrentAttributeToAddInitialValue(undefined)
        }}
        okButtonProps={{className: 'bg-[#1677ff]', disabled: !!error}}
        okText='Xong'
        width={400}
    >
        <Flex className={'py-3'} vertical>
            <Flex className={'w-full'} justify={'space-between'}>
                <Flex
                    className={'text-[green] text-[14px] cursor-pointer mb-1.5 select-none w-fit'}
                    align={'center'} gap={4}
                    onClick={() => {
                        setInitialValues([''])
                    }}
                >
                    <ReloadOutlined style={{fontSize: '10px', marginTop: '1px'}}/> Làm mới
                </Flex>
                <Flex
                    className={'text-[#1677ff] text-[14px] cursor-pointer mb-1.5 select-none w-fit'}
                    align={'center'} gap={3}
                    onClick={() => {
                        setInitialValues([...initialValues, ''])
                    }}
                >
                    <PlusOutlined style={{fontSize: '8px'}}/> Thêm giá trị
                </Flex>
            </Flex>
            <Flex
                style={{scrollbarGutter: 'stable'}}
                className={'max-h-[300px] overflow-hidden hover:overflow-y-auto scrollbar-thin mr-[-23px]'}
                vertical
                gap={10}
            >
                {
                    initialValues.map((value: string, index: number) => (
                        <Flex key={index}>
                            <Input
                                value={value}
                                placeholder={'Nhập giá trị'}
                                onChange={(e) => {
                                    let newInitialValues: string[] = _.cloneDeep(initialValues)
                                    newInitialValues[index] = e.target.value
                                    setInitialValues(newInitialValues)
                                }}
                            />
                            {
                                initialValues?.length > 1 ? <DeleteOutlined
                                    style={{color: 'red', fontSize: '15px'}}
                                    className={'cursor-pointer ml-3 mr-3'}
                                    onClick={() => {
                                        setInitialValues(initialValues.filter((_: string, currentIndex: number) => currentIndex !== index))
                                    }}
                                /> : ''
                            }
                        </Flex>
                    ))
                }
            </Flex>
            <div className={'mt-2'}>
                {error ? <ErrorMessage message={error}/> : ''}
            </div>
        </Flex>
    </Modal>
})

export default ModalAddOptions
