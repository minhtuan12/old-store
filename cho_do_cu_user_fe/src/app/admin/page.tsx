'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setBreadcrumb, setPageTitle } from '@/store/slices/app';
import {
    requestGetActiveConversations,
    requestGetOrerallStats,
    requestGetOrderByStatus,
    requestGetOrderByTime,
    requestGetPostPerCategory,
    requestGetUserGrowth,
    requestGetPostOrderByStatus,
} from '@/api/dashboard';
import { Card, Col, Row, Typography, Spin, Statistic, Select } from 'antd';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';
import { ORDER_STATUS, POST_STATUS } from '../../../utils/constants';
import { handleGetLabelFromValue } from '../../../utils/helper';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
);

const { Title: AntdTitle, Text } = Typography;

const getPostStatusLabels = (statuses: any, labelList: any) => {
    return statuses?.map((item: any) => {
        const status = handleGetLabelFromValue(labelList, item?._id).label;
        return status;
    });
};

const formatLineChartData = (data: any, label: any) => ({
    labels: data?.map((item: any) => item?._id),
    datasets: [
        {
            label,
            data: data?.map((item: any) => item?.count),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
    ],
});

const formatBarChartData = (data: any, label: any) => ({
    labels: data?.map((item: any) => item?.categoryName),
    datasets: [
        {
            label,
            data: data?.map((item: any) => item?.count),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        },
    ],
});

const formatPieChartData = (data: any, labels: any) => ({
    labels,
    datasets: [
        {
            data: data?.map((item: any) => item?.count),
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
        },
    ],
    
});

export default function Admin() {
    const dispatch = useDispatch();
    const [stats, setStats] = useState({ users: 0, posts: 0, orders: 0 });
    const [userRegistrationStats, setUserRegistrationStats] = useState([]);
    const [postsPerCategory, setPostsPerCategory] = useState([]);
    const [postsByStatus, setPostsByStatus] = useState([]);
    const [ordersByStatus, setOrdersByStatus] = useState([]);
    const [ordersByTime, setOrdersByTime] = useState([]);
    const [activeConversations, setActiveConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('month');

    useEffect(() => {
        dispatch(setPageTitle('Tổng quan'));
        dispatch(
            setBreadcrumb([
                {
                    path: '/admin',
                    name: 'Tổng quan',
                },
            ])
        );

        const fetchData = async () => {
            try {
                const statsRes = await requestGetOrerallStats();
                setStats(statsRes.data);

                const userStatsRes = await requestGetUserGrowth(groupBy);
                setUserRegistrationStats(userStatsRes.data || []);

                const postsCategoryRes = await requestGetPostPerCategory();
                setPostsPerCategory(postsCategoryRes.data || []);

                const postsStatusRes = await requestGetPostOrderByStatus();
                setPostsByStatus(postsStatusRes.data || []);

                const ordersStatusRes = await requestGetOrderByStatus();
                setOrdersByStatus(ordersStatusRes.data || []);

                const ordersTimeRes = await requestGetOrderByTime(groupBy);
                setOrdersByTime(ordersTimeRes.data || []);

                const conversationsRes = await requestGetActiveConversations();
                setActiveConversations(conversationsRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch, groupBy]);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <AntdTitle level={1}>Tổng quan</AntdTitle>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col>
                    <Text strong>Thống kê theo:</Text>
                </Col>
                <Col>
                    <Select
                        value={groupBy}
                        onChange={setGroupBy}
                        style={{ width: 200 }}
                    >
                        <Select.Option value="week">Hàng tuần</Select.Option>
                        <Select.Option value="month">Hàng tháng</Select.Option>
                        <Select.Option value="year">Hàng năm</Select.Option>
                    </Select>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Thành Viên" value={stats.users} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Bài Đăng" value={stats.posts} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Đơn Hàng" value={stats.orders} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Thành viên mới">
                        <Line data={formatLineChartData(userRegistrationStats, 'Thành viên mới')} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Danh mục bài đăng">
                        <Bar data={formatBarChartData(postsPerCategory, 'Danh mục bài đăng')} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Trạng thái bài đăng">
                        <Pie
                            data={formatPieChartData(
                                postsByStatus,
                                getPostStatusLabels(postsByStatus, POST_STATUS)
                            )}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Trạng thái đơn hàng">
                        <Doughnut
                            data={formatPieChartData(
                                ordersByStatus,
                                getPostStatusLabels(ordersByStatus, ORDER_STATUS)
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Đơn hàng theo thời gian">
                        <Line data={formatLineChartData(ordersByTime, 'Đơn hàng theo thời gian')} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Cuộc trò chuyện">
                        <Line data={formatLineChartData(activeConversations, 'Cuộc trò chuyện')} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
