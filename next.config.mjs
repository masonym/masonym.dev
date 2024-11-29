/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dkxt2zgwekugu.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'msavatar1.nexon.net',
            }
        ],
    },
};

export default nextConfig;
