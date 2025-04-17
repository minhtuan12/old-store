import {NextRequest, NextResponse} from 'next/server'
import {PATHNAME, SERVER_AUTH_TOKEN, SERVER_REFRESH_TOKEN, SERVER_USER_PROFILE} from "../utils/cookie/constants";
import {AUTH_ROUTES, PROTECTED_ROUTES} from "../utils/constants";
import {RequestCookies} from "next/dist/compiled/@edge-runtime/cookies";
import { handleGetNewTokens, handleGetNewTokensInMiddleware } from './actions/auth';

const isValidPathname = (pathname: string): boolean => {
    return pathname?.startsWith('/')
}

export async function middleware(request: NextRequest): Promise<NextResponse<any> | undefined> {
    const requestCookies: RequestCookies = request.cookies
    const response: NextResponse = NextResponse.next()

    const accessToken: string | undefined = requestCookies.get(SERVER_AUTH_TOKEN)?.value || ''
    const refreshToken: string | undefined = requestCookies.get(SERVER_REFRESH_TOKEN)?.value || ''
    const authUserProfile: any = (requestCookies.has(SERVER_USER_PROFILE) && requestCookies.get(SERVER_USER_PROFILE)?.value) ?
        JSON.parse(<string>requestCookies.get(SERVER_USER_PROFILE)?.value) : ''

    /* Redirect if user has logged in */
    const currentPathname: string = request.nextUrl.pathname
    const previousPathname: string = requestCookies.get(PATHNAME)?.value || '/'

    if (accessToken && (authUserProfile && Object.keys(authUserProfile).length > 0)) {
        if (authUserProfile?.username && (!currentPathname?.includes('/admin') || currentPathname?.includes('/admin/login'))) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        if (AUTH_ROUTES.includes(currentPathname.split('?')[0])) {
            if (isValidPathname(previousPathname)) {
                return NextResponse.redirect(new URL(previousPathname, request.url))
            }
            return NextResponse.redirect(new URL('/', request.url))
        }
    } else if (!accessToken) {
        if (refreshToken) {
            const tokens = await handleGetNewTokensInMiddleware()
            response.cookies.set(SERVER_AUTH_TOKEN, tokens?.accessToken);
            response.cookies.set(SERVER_REFRESH_TOKEN, tokens?.refreshToken);
        } else {
            if (PROTECTED_ROUTES.includes(currentPathname)) {
                return NextResponse.redirect(new URL(`/login?redirect=${currentPathname?.substring(1)}`, request.url))
            }
            if (currentPathname?.includes('/admin') && !currentPathname?.includes('/login')) {
                return NextResponse.redirect(new URL('/admin/login', request.url))
            }
        }
    }

    /* Set the current url */
    response.cookies.set(PATHNAME, currentPathname)

    return response
    // return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
    ],
}
