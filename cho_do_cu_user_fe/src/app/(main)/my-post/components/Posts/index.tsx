'use client'

import React, {useState} from "react";
import {useFetchMyPosts} from "@/api/post";
import {Post} from "../../../../../../utils/types";
import {getNotification} from "../../../../../../utils/helper";
import {Empty, Flex, Spin} from "antd";
import PostItem from "@/app/(main)/my-post/components/PostItem";

interface IPostsData {
    total: number,
    posts: Post[]
}

const Center = ({children}: { children: React.ReactNode }) =>
    <Flex className={'w-full h-[calc(100vh_-_400px)]'} align={'center'} justify={'center'}>
        {children}
    </Flex>

export default function Posts({status}: { status: string }) {
    const [filter, setFilter] = useState({
        search: '',
        page: 1,
        column: 'createdAt',
        sort_order: -1
    })

    const onErrorFetchPosts = () => {
        getNotification('error', 'Đã xảy ra lỗi khi lấy thông tin các bài đăng')
    }

    const {
        data: postsData,
        isLoading: loadingGetPosts,
        mutate: getMyPosts
    } = useFetchMyPosts(status, filter, onErrorFetchPosts)

    if (loadingGetPosts) {
        return <Center><Spin size={'default'}/></Center>
    }

    if (postsData?.posts?.length === 0) {
        return <Center><Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/></Center>
    }

    return <Flex className={'min-h-[calc(100vh_-_400px)] p-4'} gap={20} vertical>
        {
            postsData?.posts?.map((post: Post) => (
                <PostItem post={post} key={post?._id} reFetchMyPosts={getMyPosts}/>
            ))
        }
    </Flex>
}
