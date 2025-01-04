const normalizeSrc = (src) => {
    // If it's already a Cloudfront URL, return it as is
    if (src.includes('cloudfront.net')) {
        return src;
    }
    // Otherwise, handle relative paths
    return src.startsWith('/') ? src.slice(1) : src;
};

export default function imageLoader({ src, width, quality }) {
    // If it's a Cloudfront URL, return it directly
    if (src.includes('cloudfront.net')) {
        return src;
    }

    // For other images, you can still use Cloudflare's optimization
    const params = ['format=auto', `width=${width}`];
    if (quality) params.push(`quality=${quality}`);
    const paramsString = params.join(',');
    return `https://masonym.dev/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
}