import React from "react";
import {Empty, Pagination, Table} from "antd";
import './styles.scss'
import {ColumnsType} from "antd/es/table";

interface IProps {
    dataSource: any[] | undefined,
    columns: ColumnsType<any>,
    pagination?: {
        currentPage: number
        totalRecord: number
        perPage: number
    },
    loading: boolean,
    onChange?: (pagination: any, filters: any, sorter: any, extra: any) => void,
    handleSelectPagination?: (page: number) => void,
    extraClassName?: string,
    scroll?: {
        x?: number | string,
        y?: number | string
    },
    hasPagination?: boolean
}

function TableDefault(props: IProps) {
    let {
        dataSource, columns, pagination, loading, hasPagination = true,
        onChange, handleSelectPagination, extraClassName, scroll
    } = props;

    const customEmptyTable = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Không có dữ liệu'}/>

    return (
        <div>
            <Table
                loading={loading}
                className={`main-table mb-[25px] ${!hasPagination ? 'no-pagination' : ''} ${extraClassName ? extraClassName : ''}`}
                rowClassName={`main-row`}
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey={'_id'}
                onChange={onChange}
                scroll={scroll ? scroll : {x: 1000, y: 500}}
                locale={{emptyText: customEmptyTable}}
            />
            {
                hasPagination ?
                    <Pagination
                        className={'flex justify-end general-pagination'}
                        current={pagination?.currentPage}
                        total={pagination?.totalRecord || 0}
                        pageSize={pagination?.perPage}
                        onChange={(e) => handleSelectPagination ? handleSelectPagination(e) : {}}
                        showSizeChanger={false}
                        showLessItems
                    /> : ''
            }
        </div>
    )
}

export default TableDefault

