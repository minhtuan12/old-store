"use client";

import React from "react";
import { EditOutlined, MessageOutlined } from "@ant-design/icons";
import Link from "next/link";
import Button from "@/components/Button";
import { requestCreateConversation } from "@/api/chat";
import { setLocalStorageItem } from "../../../../../utils/helper";
import { LOCALSTORAGE_DEFAULT_CHAT_USER } from "../../../../../utils/constants";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function ChatButton({
    posterId,
    mentionedPostId,
}: {
    posterId: string;
    mentionedPostId: string | null;
}) {
    const { authUser: user } = useAuthUser();

    return (
        <>
            {user?._id === posterId ? (
                <Link href={`/post/${mentionedPostId}`}>
                    <Button size={"large"} className={"w-[200px]"}>
                        <EditOutlined />
                        Sửa bài đăng
                    </Button>
                </Link>
            ) : (
                <Link
                    href={"/chat"}
                    onClick={() => {
                        setLocalStorageItem(
                            LOCALSTORAGE_DEFAULT_CHAT_USER,
                            posterId
                        );
                        requestCreateConversation(posterId, mentionedPostId);
                    }}
                >
                    <Button size={"large"} className={"w-[200px]"}>
                        <MessageOutlined />
                        Nhắn tin
                    </Button>
                </Link>
            )}
        </>
    );
}
