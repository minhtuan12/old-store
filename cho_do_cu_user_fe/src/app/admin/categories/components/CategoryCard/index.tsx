import {Category} from "../../../../../../utils/types";
import React, {useState} from "react";
import {Collapse, Flex, Switch, Table, Tag, Tooltip} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {getNotification, handleGetLabelFromValue} from "../../../../../../utils/helper";
import {ATTRIBUTE_INPUT_TYPE, CATEGORY_VISIBLE_ACTION, SERVER_ERROR_MESSAGE} from "../../../../../../utils/constants";
import Link from "next/link";
import {setCurrentCategory} from "@/store/slices/category";
import {store} from "@/store/configureStore";
import {requestHideOrShowCategory} from "@/api/category";

export default function CategoryCard({category, handleRefreshCategories}: {
    category: Category,
    handleRefreshCategories: () => void
}) {
    const [loadingHideOrShow, setLoadingHideOrShow] = useState<boolean>(false)
    const isHidden = category?.is_deleted
    const attributeColumns: any = [
        {
            title: 'Tên thuộc tính',
            key: 'label',
            dataIndex: 'label',
            width: 170
        },
        {
            title: 'Kiểu đầu vào',
            key: 'input_type',
            dataIndex: 'input_type',
            width: 170,
            align: 'center',
            render: (text: string) => {
                const {label, color} = handleGetLabelFromValue(ATTRIBUTE_INPUT_TYPE, text)
                return <Tag color={color}>{label}</Tag>
            }
        }
    ]

    const handleHideOrShowCategory = (status: boolean) => {
        setLoadingHideOrShow(true)
        const type: string = status ? CATEGORY_VISIBLE_ACTION.SHOW : CATEGORY_VISIBLE_ACTION.HIDE
        requestHideOrShowCategory(category?._id as string, type)
            .then(() => {
                getNotification(
                    'success',
                    `${type === CATEGORY_VISIBLE_ACTION.HIDE ? 'Ẩn' : 'Hiện'} danh mục thành công`
                )
                handleRefreshCategories()
            })
            .catch(() => {
                getNotification('error', SERVER_ERROR_MESSAGE)
            })
            .finally(() => {
                setLoadingHideOrShow(false)
            })
    }

    return <Collapse
        collapsible="header"
        items={[
            {
                key: category?._id,
                label: <div className={'font-semibold'}>{category?.name}</div>,
                children: <div>
                    {
                        category?.attributes?.length === 0 ?
                            <i className={'text-gray-500 ml-1'}>Chưa có thuộc tính tùy chỉnh</i>
                            : <Table
                                key={'_id'}
                                className={'admin-small-table'}
                                dataSource={category?.attributes}
                                columns={attributeColumns}
                                pagination={false}
                                scroll={{y: 170}}
                            />
                    }
                </div>,
                extra: <Flex gap={15} justify={'space-between'} align={'center'}>
                    <Tooltip title={isHidden ? 'Bấm để hiện danh mục' : 'Bấm để ẩn danh mục'}>
                        <Switch
                            loading={loadingHideOrShow}
                            checked={!isHidden}
                            className={'main-switch'}
                            onChange={handleHideOrShowCategory}
                        />
                    </Tooltip>
                    <div className={isHidden ? 'cursor-not-allowed' : ''}>
                        <Link
                            className={isHidden ? 'disabled-link' : ''}
                            href={`/admin/categories/${category?._id}`}
                            onClick={() => store.dispatch(setCurrentCategory(category))}
                        >
                            <EditOutlined
                                style={{fontSize: '16px', cursor: isHidden ? 'not-allowed' : 'pointer'}}
                                disabled={isHidden}
                            />
                        </Link>
                    </div>
                </Flex>
            },
        ]}
    />
}
