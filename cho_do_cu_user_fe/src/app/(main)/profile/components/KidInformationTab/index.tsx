import React, {useEffect, useState} from "react";
import {Flex, Modal, Table, TableProps, Tag} from "antd";
import {requestGetKidsInfo} from "@/api/profile";
import {getNotification, handleGetLabelFromValue} from "../../../../../../utils/helper";
import {Baby} from "../../../../../../utils/types";
import {GENDER} from "../../../../../../utils/constants";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import Button from "@/components/Button";
import ModalCreateUpdate from "@/app/(main)/profile/components/KidInformationTab/components/ModalCreateUpdate";
import moment from "moment";

type DataType = {
    firstname: string,
    lastname: string
}

const ActionWrap: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({children, ...rest}) =>
    <Flex
        {...rest}
        align={'center'} justify={'center'}
        className={'bg-[#ededed] h-8 w-8 rounded-md text-[16px] cursor-pointer'}
    >
        {children}
    </Flex>

export default function KidInformationTab() {
    const [babies, setBabies] = useState<Baby[]>()
    const loadingTab = false
    const [loadingTable, setLoadingTable] = useState(false)
    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Họ tên',
            width: 180,
            render: (text: string, record: DataType) => <div className={'font-semibold'}>
                {record.firstname + " " + record.lastname}
            </div>
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birthdate',
            width: 120,
            render: (text: string) => {
                return <div>{moment(text).format('DD-MM-YYYY')}</div>
            }
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            align: 'center',
            width: 100,
            render: (text: string) => {
                const gender: { label: string, color: string } = handleGetLabelFromValue(GENDER, text)
                return <Flex justify={'center'}><Tag color={gender.color}>{gender.label}</Tag></Flex>
            }
        },
        {
            title: 'Chiều cao (cm)',
            dataIndex: 'height',
            align: 'center',
            width: 100,
            render: (text: number) => text ? <div>{text}</div> :
                <i className={'text-gray-500'}>Chưa cập nhật</i>
        },
        {
            title: 'Cân nặng (kg)',
            dataIndex: 'weight',
            align: 'center',
            width: 100,
            render: (text: number) => text ? <div>{text}</div> :
                <i className={'text-gray-500'}>Chưa cập nhật</i>
        },
        {
            title: '',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (_, record: DataType) => <Flex justify={'center'} gap={15}>
                <ActionWrap
                    onClick={() => {
                        handleToggleModalCreateUpdate('open', record as Baby)
                    }}
                    className={'hover:text-[#1677ff]'}
                >
                    <EditOutlined/>
                </ActionWrap>
                <ActionWrap
                    onClick={() => {
                        setSelectedBaby(record as Baby)
                        setIsOpenModalDelete(true)
                    }}
                    className={'hover:text-[red]'}
                >
                    <DeleteOutlined/>
                </ActionWrap>
            </Flex>
        }
    ]
    const [isOpenModalCreateUpdate, setIsOpenModalCreateUpdate] = useState<boolean>(false)
    const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null)
    const [isOpenModalDelete, setIsOpenModalDelete] = useState(false)
    const [loadingDeleteBtn, setLoadingDeleteBtn] = useState(false)

    const handleToggleModalCreateUpdate = (type: string, baby: Baby | null) => {
        if (type === 'open') {
            setIsOpenModalCreateUpdate(true)
            setSelectedBaby(baby)
        } else if (type === 'close') {
            setIsOpenModalCreateUpdate(false)
            setSelectedBaby(null)
        }
    }

    const handleRequestGetBabies = () => {
        setLoadingTable(true)
        requestGetKidsInfo()
            .then(res => {
                setBabies(res.data)
            })
            .catch(err => {
                getNotification('error', 'Đã xảy ra lỗi khi lấy thông tin con của bạn')
            })
            .finally(() => {
                setLoadingTable(false)
            })
    }

    const handleDeleteKidInfo = () => {
        setLoadingDeleteBtn(true)
    }

    useEffect(() => {
        handleRequestGetBabies()
    }, [])

    return <div style={{fontFamily: 'Helvetica, Arial, Roboto, sans-serif'}}>
        <Flex className={'font-semibold text-[19px] tracking-wide'} align={'center'} justify={'space-between'}>
            Thông tin về con
            <Button onClick={() => handleToggleModalCreateUpdate('open', null)}>
                Thêm thông tin bé
            </Button>
        </Flex>
        <div className={'mt-5'}>
            <Table
                columns={columns}
                dataSource={babies}
                loading={loadingTable}
                scroll={{x: 100}}
                className={'custom-table'}
            />
        </div>
        <ModalCreateUpdate
            isOpen={isOpenModalCreateUpdate}
            baby={selectedBaby}
            handleClose={() => handleToggleModalCreateUpdate('close', null)}
            handleRequestGetBabies={handleRequestGetBabies}
            handleToggleModalCreateUpdate={handleToggleModalCreateUpdate}
        />
        <Modal
            title={
                <div className={'text-[17px]'}>
                    Xóa thông tin bé <span className={'text-danger-700'}>
                        {selectedBaby?.firstname + " " + selectedBaby?.lastname}
                    </span>
                </div>
            }
            open={isOpenModalDelete}
            onOk={handleDeleteKidInfo}
            onCancel={() => {
                setIsOpenModalDelete(false)
                setSelectedBaby(null)
            }}
            okButtonProps={{className: 'main-delete-btn', loading: loadingDeleteBtn}}
            okText={'Xóa'}
            width={400}
        >
            <div className={'text-[14px]'}>
                Thông tin của bé sẽ không được khôi phục, bạn có chắc chắn muốn xóa không?
            </div>
        </Modal>
    </div>
}
