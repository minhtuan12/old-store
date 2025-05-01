import { Request, Response } from "express";
import PostRepo from "../repositories/post.repository";
import OrderRepo from "../repositories/order.repository";
import UserRepo from "../repositories/user.repository";
import {
    NOTIFICATION_TITLE,
    NOTIFICATION_TYPE,
    ORDER_STATUS,
    PAYMENT_METHOD,
    POST_STATUS,
} from "../utils/enum";
import notificationRepo from "../repositories/notification.repository";
import mail from "../services/mail";
import { compileTemplate } from "../utils/helpers";
import { readFileSync } from "fs";
import path from "path";
import moment from "moment";
import productRepository from "../repositories/product.repository";

interface CustomRequest extends Request {
    account?: any;
}

class OrderController {
    async getOrder(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { id } = req.params;

        try {
            const order = await OrderRepo.getOrder(id);

            if (
                order.customer_id._id !== account._id &&
                order.post_id.poster_id !== account._id
            ) {
                res.status(400).send("Bạn không có quyền truy cập order này");
                return;
            }
            res.status(200).send(order);
        } catch {
            res.status(500).send("Lỗi server");
        }
    }

    async getMySellingOrders(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { status, search_key, page } = req.query;

        try {
            try {
                const { total, orders } = await OrderRepo.getMySellingOrders(
                    account._id,
                    status as string,
                    search_key as string,
                    Number(page) || 1
                );

                res.status(200).send({ total, orders });
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send("Lỗi server");
        }
    }

    async getMyBuyingOrders(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { status, search_key, page, limit } = req.query;
        try {
            try {
                const { total, orders } = await OrderRepo.getMyBuyingOrders(
                    account._id,
                    status as string,
                    search_key as string,
                    Number(page),
                    Number(limit)
                );

                res.status(200).send({ total, orders });
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch {
            res.status(500).send("Lỗi server");
        }
    }

    async createOrder(req: CustomRequest, res: Response): Promise<void> {
        const user = req.account;
        const order = req.body.order;
        try {
            if (!order.customer_id) {
                res.status(400).send("Thiếu thông tin người mua");
                return;
            }
            const post = await PostRepo.getPost(String(order.post_id));
            const [product, customer] = await Promise.all([
                productRepository.getProduct(String(post.product_id)),
                UserRepo.getUserById(String(order.customer_id)),
            ]);

            //order validation
            if (customer.is_deleted) {
                res.status(403).send(
                    "Bạn không thể tạo đơn hàng với người dùng đã bị xóa"
                );
                return;
            }

            if (!post) {
                res.status(404).send("Post không tồn tại");
                return;
            }

            if (String(post.poster_id) !== String(user._id)) {
                res.status(403).send("Bạn không phải chủ sở hữu bài post");
                return;
            }

            if (String(post.poster_id) === String(order.customer_id)) {
                res.status(400).send("Không thể order post của chính mình");
                return;
            }

            if (post.is_ordering) {
                res.status(400).send(
                    "Bạn đã tạo đơn cho bài post này, nếu muốn tạo lại, hãy hủy đơn cũ"
                );
                return;
            }

            if (!order.receiver_stripe_account_id) {
                res.status(400).send("Thiếu tài khoản nhận tiền");
                return;
            }

            let notification_title, notification_type, order_status;
            // if (order.payment_method === PAYMENT_METHOD.COD) {
            //     notification_title = NOTIFICATION_TITLE.PAYMENT_COD;
            //     order_status = ORDER_STATUS.PROCESSING;
            //     notification_type = NOTIFICATION_TYPE.PAYMENT_COD
            // }
            // if (order.payment_method === PAYMENT_METHOD.CREDIT) {
            if (!order.total || order.total < 20000) {
                res.status(400).send(
                    `Chọn payment_method là ${PAYMENT_METHOD.CREDIT} total phải >= 20000`
                );
                return;
            }

            notification_title = NOTIFICATION_TITLE.PAYMENT_CREDIT;
            order_status = ORDER_STATUS.WAITING_FOR_PAYMENT;
            notification_type = NOTIFICATION_TYPE.PAYMENT_CREDIT;
            // };

            const newOrder = await OrderRepo.newOrder({
                ...order,
                status: order_status,
                total: order.total ? order.total : null,
            });

            const formattedPrice = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(product?.price)
            const orderData = {
                customerName: newOrder.customer_name,
                sellerName: user.firstname + " " + user.lastname,
                customerEmail: customer?.email,
                customerPhone: newOrder.customer_phone,
                customerAddress: newOrder.customer_address,
                sellerEmail: user.email,
                sellerPhone: user.phone,
                paymentMethod: "Thanh toán bằng thẻ",
                orderId: newOrder?._id,
                createdAt: moment(newOrder?.createdAt).format(
                    "HH:mm DD/MM/YYYY"
                ),
                productImage: product?.images?.[0] || '',
                productName: post?.title,
                productPrice: formattedPrice,
                total: formattedPrice,
                paymentLink: `${process.env.FE_ACCESS}/order?tab=buying-order&status=waiting_for_payment`,
            };

            await Promise.all([
                PostRepo.updatePost(post._id, { is_ordering: true }),
                notificationRepo.sendNotification({
                    order_id: newOrder._id,
                    title: notification_title,
                    type: notification_type,
                    receiver_id: order.customer_id,
                    post_id: null,
                }),
                mail.sendMail({
                    email: customer?.email,
                    subject: 'Bạn có một đơn hàng mới từ Chợ Đồ Cũ',
                    htmlTemplate: compileTemplate("./src/templates/order-confirmation.html", orderData)
                })
            ]);

            res.status(201).send("Tạo mới thành công");
        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }

    async updateOrderStatus(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { order_id, status } = req.body.order;
        try {
            if (
                status === ORDER_STATUS.RECEIVED ||
                status === ORDER_STATUS.WAITING_FOR_PAYMENT
            ) {
                res.status(400).send(
                    "Bạn không có quyền thay đổi trạng thái này"
                );
                return;
            }

            const order = await OrderRepo.getOrder(order_id);

            if (!order) {
                res.status(404).send("Đơn hàng không tồn tại");
                return;
            }

            if (String(order?.post_id.poster_id._id) !== String(account._id)) {
                res.status(400).send(
                    "Bạn không có quyền thay đổi trạng thái bài đăng này"
                );
                return;
            }

            if (order.customer_id.is_deleted) {
                res.status(400).send(
                    "Bạn không thể cập nhật trạng thái bởi người dùng đã bị xóa"
                );
                return;
            }

            try {
                const updated = await OrderRepo.updateStatusOrder(
                    null,
                    order_id,
                    status
                );

                if (
                    status !== order.status &&
                    status === ORDER_STATUS.DELIVERED &&
                    updated
                ) {
                    await notificationRepo.sendNotification({
                        order_id: order._id,
                        title: NOTIFICATION_TITLE.DELIVERED_ORDER,
                        type: NOTIFICATION_TYPE.DELIVERED_ORDER,
                        receiver_id: order.customer_id,
                        post_id: null,
                    });
                }

                res.status(200).send("Thay đổi trạng thái thành công");
            } catch (err: any) {
                res.status(400).send(err.message);
            }
        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }

    async cancelOrder(req: CustomRequest, res: Response): Promise<void> {
        const account = req.account;
        const { order_id } = req.body.order;
        try {
            const order = await OrderRepo.getOrder(order_id);
            const createrOrderId = String(order.post_id.poster_id._id);
            const buyerOrderId = String(order.customer_id._id);
            if (
                String(account._id) !== createrOrderId &&
                String(account._id) !== buyerOrderId
            ) {
                res.status(400).send("Bạn không có quyền thay đổi đơn này");
                return;
            }

            if (
                order.status !== ORDER_STATUS.WAITING_FOR_PAYMENT &&
                order.status !== ORDER_STATUS.PROCESSING
            ) {
                res.status(400).send(
                    "Đơn ở trạng thái này không được phép hoàn lại"
                );
                return;
            }

            await Promise.all([
                PostRepo.updatePost(order.post_id._id, { is_ordering: false }),
                OrderRepo.updateStatusOrder(
                    String(account._id),
                    order._id,
                    ORDER_STATUS.CANCELLED
                ),
                notificationRepo.sendNotification({
                    order_id,
                    post_id: order?.post_id,
                    receiver_id:
                        String(account.id) === createrOrderId
                            ? buyerOrderId
                            : createrOrderId,
                    title: `Đơn hàng mã ORD-${order.id} đã bị hủy. Nhấn vào để kiểm tra`,
                    type: NOTIFICATION_TYPE.CANCELLED_ORDER,
                }),
            ]);

            res.status(200).send("Hủy đơn thành công");
        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }
}

export default new OrderController();
