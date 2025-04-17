import styles from './styles.module.scss';
import {Button} from "antd";
import Image from "next/image";
import React from "react";

export default function GoogleLogin() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL!
    return <div className={styles.googleLoginWrap}>
        <div className={styles.option}>Hoặc</div>
        <div className={styles.btnLoginWithGoogle}>
            <Button
                onClick={() => {
                    window.open(`${apiUrl}/auth/google`)
                }}
                className={styles.btnGoogleWrap}
            >
                <div className={styles.googleImageWrap}>
                    <Image
                        priority
                        width={80}
                        height={30}
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google Logo"
                        className={styles.googleImage}
                    />
                </div>
                Đăng nhập bằng Google
            </Button>
        </div>
    </div>
}