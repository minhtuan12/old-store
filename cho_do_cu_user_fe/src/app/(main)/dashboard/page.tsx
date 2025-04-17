"use client";

import React, { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import { Select, Row, Col, Typography, Card, Flex, Spin } from "antd";
import {
    requestRevenue,
    requestExpenses,
    requestRatings,
    requestOrdersStatus,
} from "@/api/dashboard";
import "chart.js/auto";
import BreadcrumbUpdater from "@/components/BreadcrumbUpdater";
import { handleGetLabelFromValue } from "../../../../utils/helper";
import { ORDER_STATUS } from "../../../../utils/constants";

const { Title, Text } = Typography;

const Dashboard = () => {
    const breadcrumbData = [
        {
            path: "/",
            name: "Trang chủ",
        },
        {
            name: "Thống kê",
        },
    ];

    const [revenueData, setRevenueData] = useState<ChartData<"bar">>({
        labels: [],
        datasets: [],
    });

    const [expensesData, setExpensesData] = useState<ChartData<"bar">>({
        labels: [],
        datasets: [],
    });

    const [ratingsData, setRatingsData] = useState<ChartData<"doughnut">>({
        labels: [],
        datasets: [],
    });

    const [ordersStatusData, setOrdersStatusData] = useState<ChartData<"pie">>({
        labels: [],
        datasets: [],
    });

    const [loadingGetRevenue, setLoadingGetRevenue] = useState(true);
    const [loadingGetExpense, setLoadingGetExpense] = useState(true);
    const [loadingGetRatings, setLoadingGetRatings] = useState(true);
    const [loadingGetOrdersStatus, setLoadingGetOrdersStatus] = useState(true);

    const [groupBy, setGroupBy] = useState("month");

    const fetchRevenueData = async () => {
        try {
            const response = await requestRevenue(groupBy);
            const labels = response?.data?.map((item: any) => item?._id);
            const data = response?.data?.map((item: any) => item?.totalRevenue);

            setRevenueData({
                labels,
                datasets: [
                    {
                        label: "Thu nhập (VND)",
                        data,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            });
            setLoadingGetRevenue(false);
        } catch (err) {
            setLoadingGetRevenue(false);
        }
    };

    const fetchExpensesData = async () => {
        try {
            const response = await requestExpenses(groupBy);
            const labels = response?.data?.map((item: any) => item?._id);
            const data = response?.data?.map(
                (item: any) => item?.totalExpenses
            );

            setExpensesData({
                labels,
                datasets: [
                    {
                        label: "Chi tiêu (VND)",
                        data,
                        backgroundColor: "rgba(255, 159, 64, 0.6)",
                        borderColor: "rgba(255, 159, 64, 1)",
                        borderWidth: 1,
                    },
                ],
            });
            setLoadingGetExpense(false);
        } catch (err) {
            setLoadingGetExpense(false);
        }
    };

    const fetchRatingsData = async () => {
        try {
            const response = await requestRatings();
            const { averageStars, totalRatings } = response?.data[0];

            setRatingsData({
                labels: ["Trung bình", "Tổng lượt đánh giá"],
                datasets: [
                    {
                        label: "Đánh giá",
                        data: [averageStars, totalRatings],
                        backgroundColor: [
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 99, 132, 0.6)",
                        ],
                    },
                ],
            });
            setLoadingGetRatings(false);
        } catch (err) {
            setLoadingGetRatings(false);
        }
    };

    const fetchOrdersStatusData = async () => {
        try {
            const response = await requestOrdersStatus();
            const labels = response?.data?.map((item: any) => {
                const status = handleGetLabelFromValue(
                    ORDER_STATUS,
                    item?._id
                ).label;
                return status;
            });
            const data = response?.data?.map((item: any) => item?.count);

            setOrdersStatusData({
                labels,
                datasets: [
                    {
                        label: "Số lượng đơn hàng",
                        data,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                        ],
                    },
                ],
            });
            setLoadingGetOrdersStatus(false);
        } catch (err) {
            setLoadingGetOrdersStatus(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
        fetchRatingsData();
        fetchOrdersStatusData();
    }, [groupBy]);

    return (
        <div style={{ padding: "20px" }}>
            <BreadcrumbUpdater
                className={"mb-5"}
                breadcrumbData={breadcrumbData}
                title={"Thống kê"}
            />
            <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
                <Col>
                    <Text strong>Thống kê theo:</Text>
                </Col>
                <Col>
                    <Select
                        value={groupBy}
                        onChange={(value) => setGroupBy(value)}
                        style={{ width: 200 }}
                    >
                        <Select.Option value="week">Hàng tuần</Select.Option>
                        <Select.Option value="month">Hàng tháng</Select.Option>
                        <Select.Option value="year">Hàng năm</Select.Option>
                    </Select>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={12}>
                    <Card
                        title="Thu nhập"
                        hoverable
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {loadingGetRevenue ? (
                            <Flex
                                className="h-full w-full"
                                justify="center"
                                align="center"
                            >
                                <Spin />
                            </Flex>
                        ) : revenueData?.labels &&
                          revenueData?.labels?.length > 0 ? (
                            <Bar data={revenueData} />
                        ) : (
                            <Flex
                                className="h-full w-full text-[#8c8c8c]"
                                justify="center"
                                align="center"
                            >
                                Không có dữ liệu
                            </Flex>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={12}>
                    <Card
                        title="Chi tiêu"
                        hoverable
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {loadingGetExpense ? (
                            <Flex
                                className="h-full w-full"
                                justify="center"
                                align="center"
                            >
                                <Spin />
                            </Flex>
                        ) : expensesData?.labels &&
                          expensesData?.labels?.length > 0 ? (
                            <Bar data={expensesData} />
                        ) : (
                            <Flex
                                className="h-full w-full text-[#8c8c8c]"
                                justify="center"
                                align="center"
                            >
                                Không có dữ liệu
                            </Flex>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={12}>
                    <Card
                        title="Đánh giá"
                        hoverable
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {loadingGetRatings ? (
                            <Flex
                                className="h-full w-full"
                                justify="center"
                                align="center"
                            >
                                <Spin />
                            </Flex>
                        ) : ratingsData?.labels &&
                          ratingsData?.labels?.length > 0 ? (
                            <Doughnut data={ratingsData} />
                        ) : (
                            <Flex
                                className="h-full w-full text-[#8c8c8c]"
                                justify="center"
                                align="center"
                            >
                                Không có dữ liệu
                            </Flex>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={12}>
                    <Card
                        title="Trạng thái đơn hàng"
                        hoverable
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {loadingGetOrdersStatus ? (
                            <Flex
                                className="h-full w-full"
                                justify="center"
                                align="center"
                            >
                                <Spin />
                            </Flex>
                        ) : ordersStatusData?.labels &&
                          ordersStatusData?.labels?.length > 0 ? (
                            <Pie data={ordersStatusData} />
                        ) : (
                            <Flex
                                className="h-full w-full text-[#8c8c8c]"
                                justify="center"
                                align="center"
                            >
                                Không có dữ liệu
                            </Flex>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
