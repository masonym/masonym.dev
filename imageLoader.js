const normalizeSrc = (src) => {
    // If it's already a Cloudfront URL, return it as is
    if (src.includes('cloudfront.net')) {
        return src;
    }
    // For local public images, ensure they start with a forward slash
    return src.startsWith('/') ? src : `/${src}`;
};

export default function imageLoader({ src, width, quality }) {
    // If it's a Cloudfront URL, return it directly
    if (src.includes('cloudfront.net')) {
        return src;
    }

    // For local public images, serve directly from the public directory
    const normalizedSrc = normalizeSrc(src);
    return normalizedSrc;
}