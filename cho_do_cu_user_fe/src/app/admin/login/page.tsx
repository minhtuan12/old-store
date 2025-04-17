"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import Logo from "../../../../public/logo.png";
import InputWithLabel from "@/components/InputWithLabel";
import { Button } from "antd";
import "../../(auth)/styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/configureStore";
import { setErrorAdminLogin, setErrorLogin } from "@/store/slices/auth";
import ErrorMessage from "@/components/ErrorMessage";
import {
    getNotification,
    handleCheckValidateConfirm,
    IValidationResult,
} from "../../../../utils/helper";
import { handleLoginResult } from "@/actions/auth";
import { SERVER_ERROR_MESSAGE } from "../../../../utils/constants";

export default function AdminLogin(): JSX.Element {
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
        account_role: "admin",
    });
    const [isLoadingRequestLogin, setIsLoadingRequestLogin] =
        useState<boolean>(false);
    const errorLogin = useSelector(
        (state: RootState) => state.auth.errorAdminLogin
    );
    const dispatch: AppDispatch = useDispatch();

    const handleChangeInput = (value: string, type: string): void => {
        dispatch(
            setErrorAdminLogin({
                ...errorLogin,
                [type]: "",
            })
        );

        setLoginData({
            ...loginData,
            [type]: value,
        });
    };

    const handleRequestLogin = (): void => {
        const formValidation: IValidationResult = handleCheckValidateConfirm(
            loginData,
            errorLogin
        );
        if (formValidation.isError) {
            dispatch(setErrorAdminLogin(formValidation.errorData));
        } else {
            setIsLoadingRequestLogin(true);
            handleLoginResult(loginData, 'admin')
                .then((res) => {
                    setIsLoadingRequestLogin(false);
                    switch (res.status) {
                        case 200:
                            getNotification("success", "Đăng nhập thành công");
                            window.location.href = "/admin";
                            break;
                        case 401:
                            getNotification(
                                "error",
                                "Tên tài khoản hoặc mật khẩu không đúng"
                            );
                            break;
                        case 403:
                            getNotification(
                                "error",
                                "Tài khoản của bạn đã bị khóa"
                            );
                            break;
                        case 400:
                            getNotification(
                                "error",
                                "Tài khoản quản trị viên không tồn tại"
                            );
                            break;
                        case 500:
                            getNotification("error", SERVER_ERROR_MESSAGE);
                            break;
                        default:
                            getNotification("error", SERVER_ERROR_MESSAGE);
                            break;
                    }
                })
                .catch((err) => {
                    setIsLoadingRequestLogin(false);
                    getNotification("error", SERVER_ERROR_MESSAGE);
                });
        }
    };

    useEffect(() => {
        dispatch(
            setErrorLogin({
                username: "",
                password: "",
            })
        );
    }, [dispatch]);

    return (
        <div className={styles.loginWrap}>
            <div className={styles.imageWrap}>
                <Image src={Logo} alt={"logo"} width={220} priority />
            </div>
            <div className={styles.title}>Đăng nhập</div>
            <div className={styles.loginFormContent}>
                <div className={styles.inputWrap}>
                    <InputWithLabel
                        onPressEnter={handleRequestLogin}
                        isRequired
                        label={"Tên tài khoản"}
                        value={loginData.username}
                        onChange={(e) =>
                            handleChangeInput(e.target.value, "username")
                        }
                    />
                    {errorLogin.username ? (
                        <ErrorMessage message={errorLogin.username} />
                    ) : (
                        ""
                    )}
                </div>
                <div className={styles.inputWrap}>
                    <InputWithLabel
                        onPressEnter={handleRequestLogin}
                        isRequired
                        isPasswordInput
                        label={"Mật khẩu"}
                        value={loginData.password}
                        onChange={(e) =>
                            handleChangeInput(e.target.value, "password")
                        }
                    />
                    {errorLogin.password ? (
                        <ErrorMessage message={errorLogin.password} />
                    ) : (
                        ""
                    )}
                </div>
            </div>
            <div className={`${styles.btnWrap} w-full`}>
                <Button
                    className={"w-full"}
                    type={"primary"}
                    size={"large"}
                    onClick={handleRequestLogin}
                    loading={isLoadingRequestLogin}
                >
                    Đăng nhập
                </Button>
            </div>
        </div>
    );
}
