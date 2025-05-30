import adminRouter from "./admin.route";
import authRouter from "./auth.route";
import emailVerificationRouter from "./emailVerification.router";
import userRouter from "./user.route";
import locationRouter from "./location.route";
import publicRouter from "./public.route";
import babyRouter from "./baby.route";
import postRouter from "./post.route";
import wishlistRouter from "./wishlist.route";
import chatRouter from "./chat.route";
import orderRouter from "./order.route";
import notificationRouter from "./notification.route";
import ratingRouter from "./rating.route";
import stripeRouter from './stripe.route';

const route = (app: any) => {
    app.use("/admin", adminRouter);
    app.use("/auth", authRouter);
    app.use("/public", publicRouter);
    app.use("/verify-email", emailVerificationRouter);
    app.use("/user", userRouter);
    app.use("/location", locationRouter);
    app.use("/baby", babyRouter);
    app.use("/post", postRouter);
    app.use("/wishlist", wishlistRouter);
    app.use("/chat", chatRouter);
    app.use("/order", orderRouter);
    app.use("/notification", notificationRouter);
    app.use("/rating", ratingRouter);
    app.use('/stripe', stripeRouter);
};

export default route;
