// An (i) that shows `children` on hover, and on focus so it also works by keyboard and tap.
// `below` opens it downwards, for spots where the space above is clipped (the table header).
// Pure CSS, so it works in server components too.
export default function Tip({ children, below = false }) {
  return (
    <span className="relative inline-flex align-middle group normal-case tracking-normal font-normal">
      <button
        type="button"
        aria-label="More info"
        className="ml-1 inline-flex rounded-full text-primary-dim hover:text-primary-bright focus-visible:outline focus-visible:outline-1 focus-visible:outline-secondary"
      >
        {/* drawn rather than a text "i": the site font sits it off-centre */}
        <svg
          viewBox="0 0 16 16"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.75" />
          <path d="M8 7.25v4" strokeWidth="1.5" />
          <circle cx="8" cy="4.9" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-20 w-60 rounded-md border border-primary/20 bg-background-bright px-3 py-2 text-xs text-primary shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${
          below ? "top-full mt-1.5" : "bottom-full mb-1.5"
        }`}
      >
        {children}
      </span>
    </span>
  );
}
