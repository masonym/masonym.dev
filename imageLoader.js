const normalizeSrc = src => src.startsWith('/') ? src.slice(1) : src;

export default function cloudflareLoader({ src, width, quality }) {
    const params = ['format=auto', `width=${width}`];
    if (quality) params.push(`quality=${quality}`);

    const paramsString = params.join(',');

    return `https://masonym.dev/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`
}