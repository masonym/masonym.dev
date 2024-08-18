/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dkxt2zgwekugu.cloudfront.net',
            },
        ],
    },
};

export default nextConfig;
