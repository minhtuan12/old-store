import { Types } from "mongoose";
import Order, { IOrder } from "../models/order";
import { ORDER_STATUS } from "../utils/enum";

const { ObjectId } = Types;

class OrderRepo {
    async getOrder(orderId: string): Promise<any> {
        try {
            return await Order.findById(orderId, { is_deleted: false })
                .populate({
                    path: "customer_id",
                    select: "-password",
                })
                .populate({
                    path: "post_id",
                    populate: [
                        {
                            path: "product_id",
                            model: "Product",
                        },
                        {
                            path: "poster_id",
                            model: "User",
                        },
                    ],
                });
        } catch (err) {
            throw err;
        }
    }

    async getMyByingOrders(
        userId: string,
        status: string,
        searchKey: string = "",
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        try {
            let searchQuery: any = {
                customer_id: new ObjectId(userId),
                is_deleted: false,
            };

            if (searchKey)
                searchQuery = {
                    ...searchQuery,
                    _id: { $regex: searchKey, $options: "i" },
                };
            if (status) searchQuery.status = status;

            const result = await Order.aggregate([
                {
                    $lookup: {
                        from: "posts",
                        localField: "post_id",
                        foreignField: "_id",
                        as: "post",
                    },
                },
                { $unwind: "$post" },
                {
                    $lookup: {
                        from: "products",
                        localField: "post.product_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },
                { $match: { ...searchQuery } },
                {
                    $addFields: {
                        code: { $concat: ["ORD-", { $toString: "$_id" }] },
                    },
                },
                {
                    $facet: {
                        totalRecords: [{ $count: "total" }],
                        orders: [
                            {
                                $addFields: {
                                    code: {
                                        $concat: [
                                            "ORD-",
                                            { $toString: "$_id" },
                                        ],
                                    },
                                },
                            },
                            { $skip: (page - 1) * 10 },
                            { $limit: 10 },
                            { $sort: { createdAt: -1 } },
                        ],
                    },
                },
                {
                    $project: {
                        total: { $arrayElemAt: ["$totalRecords.total", 0] },
                        orders: 1,
                    },
                },
            ]);

            return result?.[0] || { total: 0, orders: [] };
        } catch (err) {
            throw err;
        }
    }

    async getMySellingOrders(
        userId: string,
        status: string,
        searchKey: string = "",
        page: number
    ): Promise<any> {
        try {
            let searchQuery: any = {
                "post.poster_id": new ObjectId(userId),
                is_deleted: false,
            };

            if (searchKey)
                searchQuery = {
                    ...searchQuery,
                    _id: { $regex: searchKey, $options: "i" },
                };
            if (status) searchQuery.status = status;

            const result = await Order.aggregate([
                {
                    $lookup: {
                        from: "posts",
                        localField: "post_id",
                        foreignField: "_id",
                        as: "post",
                    },
                },
                { $unwind: "$post" },
                {
                    $lookup: {
                        from: "products",
                        localField: "post.product_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },
                { $match: { ...searchQuery } },
                {
                    $addFields: {
                        code: { $concat: ["ORD-", { $toString: "$_id" }] },
                    },
                },
                {
                    $facet: {
                        totalRecords: [{ $count: "total" }],
                        orders: [
                            {
                                $addFields: {
                                    code: {
                                        $concat: [
                                            "ORD-",
                                            { $toString: "$_id" },
                                        ],
                                    },
                                },
                            },
                            { $skip: (page - 1) * 10 },
                            { $limit: 10 },
                            { $sort: { createdAt: -1 } },
                        ],
                    },
                },
                {
                    $project: {
                        total: { $arrayElemAt: ["$totalRecords.total", 0] },
                        orders: 1,
                    },
                },
            ]);

            return result?.[0] || { total: 0, orders: [] };
        } catch (err) {
            throw err;
        }
    }

    async newOrder(order: Partial<IOrder>): Promise<any> {
        try {
            const result = await Order.create(order);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async updateStatusOrder(orderId: string, status: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(
                orderId,
                { status },
                { runValidators: true }
            );

            return !!result;
        } catch (err) {
            throw err;
        }
    }
    async updateStripePaymentIntentId(
        orderId: string,
        paymentIntentId: string
    ): Promise<void> {
        try {
            await Order.findByIdAndUpdate(orderId, {
                stripe_payment_intent_id: paymentIntentId
            });
        } catch (err) {
            throw err;
        }
    }
    async deleteOrder(orderId: string): Promise<boolean> {
        try {
            const result = await Order.findByIdAndUpdate(orderId, {
                is_deleted: true,
            });

            return !!result;
        } catch (err) {
            throw err;
        }
    }
    async postIsOrdering(postId: string): Promise<boolean> {
        try {
            const orderExists = await Order.exists({
                post_id: postId,
                status: { $ne: ORDER_STATUS.CANCELLED },
            });
            return !!orderExists;
        } catch (err) {
            throw err;
        }
    }
}

export default new OrderRepo();
