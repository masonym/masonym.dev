// 32px game icon. Renders an empty box when the client has no icon for the entry.
export default function Icon({ src, alt }) {
  if (!src) return <div className="w-8 h-8 shrink-0" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={32}
      height={32}
      loading="lazy"
      className="w-8 h-8 shrink-0 object-contain"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
