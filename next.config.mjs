import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        loader: 'custom',
        loaderFile: './imageLoader.js',
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
    pageExtensions: ['js', 'jsx', 'mdx'],
    experimental: {
        runtime: true
    },
    turbopack: {
    }
};

const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: [],
    },
});

export default withMDX(nextConfig);
