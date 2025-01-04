/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        loader: 'custom',
        loaderFile: '/imageLoader.js',
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
