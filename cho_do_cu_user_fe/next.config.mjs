/** @[action] {import('next').NextConfig} */

import { hostname } from "os";

const nextConfig = {
    reactStrictMode: false,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: 'lh3.googleusercontent.com'
            }
        ],
    },
};

export default nextConfig;
