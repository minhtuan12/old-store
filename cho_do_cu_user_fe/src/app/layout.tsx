import React from "react";
import "./global.scss";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import { StoreProvider } from "@/store/StoreProvider";
import AddStyledComponentRegistry from "@/components/AddStyledComponentsRegistry";

export const metadata = {
    title: "Chợ đồ cũ",
    description: "Chợ đồ cũ",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StoreProvider>
            <html lang="en">
                <head>
                    <meta
                        name="google-site-verification"
                        content="WrMLArTYh9O6DDKmtiQbnMpHvgiBcnRX12NQhf3cOeU"
                    />
                </head>
                <body className={"scrollbar-light"}>
                    <AddStyledComponentRegistry>
                        {children}
                    </AddStyledComponentRegistry>
                </body>
            </html>
        </StoreProvider>
    );
}
