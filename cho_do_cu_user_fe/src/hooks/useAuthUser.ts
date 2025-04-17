'use client'

import {useEffect, useState} from "react";
import {AdminProfile, UserProfile} from "../../utils/types";
import {getCookieValue} from "../../utils/cookie/server";
import {SERVER_REFRESH_TOKEN, SERVER_USER_PROFILE} from "../../utils/cookie/constants";
import {handleGetProfile, handleLogout} from "@/actions/auth";
import {useRouter} from "next/navigation";

export const useAuthUser = (type = 'user') => {
    const [authUser, setAuthUser] = useState<UserProfile | AdminProfile | null>(null)
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCookieValue(SERVER_USER_PROFILE).then(async (res) => {
            if (res) {
                setLoading(false)
                setAuthUser(JSON.parse(res))
            } else {
                const hasRefreshToken = await getCookieValue(SERVER_REFRESH_TOKEN)
                if (hasRefreshToken) {
                    handleGetProfile(type)
                        .then(user => {
                            setLoading(false)
                            setAuthUser(user)
                        })
                        .catch(() => {
                            handleLogout()
                            router.push('/login')
                        })
                } else {
                    setLoading(false)
                    setAuthUser(null)
                }
            }
        })
    }, [])

    return {loading, authUser}
}
