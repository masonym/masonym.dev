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

    // For local public images
    const normalizedSrc = normalizeSrc(src);
    const params = ['format=auto', `width=${width}`];
    if (quality) params.push(`quality=${quality}`);
    const paramsString = params.join(',');
    return `${process.env.NEXT_PUBLIC_SITE_URL || ''}/cdn-cgi/image/${paramsString}${normalizedSrc}`;
}