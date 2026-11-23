"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ModifierIcon from "./ModifierIcon";

// The page opens on a menu of section tiles. Picking one shows just that section; "Everything"
// shows them all on one page so the browser's find works across the lot. The view lives in
// ?section= so it can be linked.
//
// The sections are server-rendered children, each a <section id=...>. They all stay mounted and
// the ones not being viewed are hidden with CSS, so nothing reloads when switching.
//
// `showAll={false}` drops the "Everything" view (the calculators page has no use for it).
//
// Keys: 1-9 open a section, A opens everything. Esc, Backspace or right-click go back to the
// menu (shift+right-click, or right-clicking a link, form field or selected text, still opens
// the browser's own menu).

const ALL = "all";

const isTyping = (el) =>
  el?.closest?.("input, textarea, select, [contenteditable='true']");

function TileIcon({ section }) {
  if (section.icon === ALL) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden
      >
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (section.backing)
    return (
      <ModifierIcon icon={section.icon} backing={section.backing} zoom={1.6} />
    );
  if (!section.icon)
    return (
      <div className="w-16 h-16 rounded-lg border border-dashed border-primary/20" />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={section.icon}
      alt=""
      className="w-16 h-16 object-contain"
      // game icons are 32px: scale them up crisply. Monster sprites are large and get scaled down.
      style={section.sprite ? undefined : { imageRendering: "pixelated" }}
    />
  );
}

const keyHint =
  "absolute top-2 left-2.5 text-xs text-primary-dim font-sans hidden [@media(hover:hover)]:block";

// The tile grid. Without `onOpen` it renders inert, as the Suspense fallback.
export function SectionMenu({
  sections,
  intro,
  onOpen,
  tileRefs,
  showAll = true,
}) {
  const tiles = [
    ...sections.map((s, i) => ({ ...s, key: String(i + 1) })),
    ...(showAll
      ? [
          {
            id: ALL,
            title: "Everything",
            sub: "One page (for Ctrl+F)",
            icon: ALL,
            key: "A",
          },
        ]
      : []),
  ];
  return (
    <>
      {intro}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {tiles.map((s) => (
          <button
            key={s.id}
            type="button"
            ref={(el) => tileRefs && (tileRefs.current[s.id] = el)}
            onClick={onOpen && (() => onOpen(s.id))}
            className="relative aspect-square flex flex-col items-center justify-center gap-3 p-3 rounded-xl border border-primary/20 bg-background-bright/30 text-center transition hover:-translate-y-0.5 hover:border-primary-bright/50 hover:bg-background-bright/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary"
          >
            <kbd className={keyHint}>{s.key}</kbd>
            {s.changed > 0 && (
              <span
                title={`${s.changed} changed in the latest update`}
                className="absolute top-2 right-2.5 inline-flex items-center gap-1 text-xs text-secondary font-sans"
              >
                <span className="w-[7px] h-[7px] rounded-full bg-secondary" />
                {s.changed}
              </span>
            )}
            <TileIcon section={s} />
            <span className="font-semibold text-primary-bright leading-tight sm:text-lg">
              {s.title}
              {s.sub && (
                <span className="block text-xs font-normal text-primary-dim mt-1">
                  {s.sub}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

const pill =
  "px-3 py-1 rounded-full border text-sm transition-colors whitespace-nowrap";
const pillIdle =
  "border-primary/20 text-primary hover:text-primary-bright hover:border-primary-bright/40";
const pillOn = "border-secondary text-primary-bright bg-secondary/15";

export default function SectionBrowser({
  sections,
  intro,
  toggle,
  showAll = true,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get("section");
  const view =
    (showAll && param === ALL) || sections.some((s) => s.id === param)
      ? param
      : null;

  // true when opening a section pushed a history entry over the menu, so going back can pop
  // it (and the browser's back button agrees). Otherwise going back replaces the URL.
  const pushedFromMenu = useRef(false);
  const lastOpened = useRef(null);
  const tileRefs = useRef({});

  const hrefFor = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("section", next);
      else params.delete("section");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const open = useCallback(
    (next) => {
      if (next === view) return;
      lastOpened.current = next;
      if (view === null) {
        pushedFromMenu.current = true;
        router.push(hrefFor(next), { scroll: false });
      } else {
        router.replace(hrefFor(next), { scroll: false });
      }
    },
    [view, router, hrefFor],
  );

  const back = useCallback(() => {
    if (view === null) return;
    if (pushedFromMenu.current) {
      pushedFromMenu.current = false;
      router.back();
    } else {
      router.replace(hrefFor(null), { scroll: false });
    }
  }, [view, router, hrefFor]);

  // old links pointed at #section anchors: open that section instead
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!param && sections.some((s) => s.id === id))
      router.replace(hrefFor(id), { scroll: false });
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // each view starts at the top; back on the menu, focus the tile we came from
  useEffect(() => {
    window.scrollTo(0, 0);
    if (view === null && lastOpened.current)
      tileRefs.current[lastOpened.current]?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e.target)) return;
      if (view !== null && (e.key === "Escape" || e.key === "Backspace")) {
        e.preventDefault();
        back();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= sections.length) {
        e.preventDefault();
        open(sections[n - 1].id);
      } else if (showAll && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        open(ALL);
      }
    };
    const onContextMenu = (e) => {
      if (view === null || e.shiftKey || e.defaultPrevented) return;
      // only a real mouse: a long-press on a touch screen also fires contextmenu
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (window.matchMedia("(hover: none)").matches) return;
      if (e.target.closest?.("a, input, textarea, select")) return;
      if (String(window.getSelection() ?? "").trim()) return;
      e.preventDefault();
      back();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  }, [view, sections, open, back, showAll]);

  // hide the sections not being viewed (all of them on the menu)
  const hide =
    view === null
      ? ".quanah-sections > section { display: none; }"
      : view === ALL
        ? ""
        : `.quanah-sections > section:not(#${view}) { display: none; }`;

  return (
    <>
      {view === null ? (
        <SectionMenu
          sections={sections}
          intro={intro}
          onOpen={open}
          tileRefs={tileRefs}
          showAll={showAll}
        />
      ) : (
        <nav className="mb-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={back}
            className={`${pill} ${pillIdle} mr-1`}
          >
            ← Sections
          </button>
          <span className="hidden [@media(hover:hover)]:inline text-xs text-primary-dim font-sans mr-3">
            Esc or right-click
          </span>
          {view === ALL ? (
            // everything is on the page: jump to it
            sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={`${pill} ${pillIdle}`}>
                {s.title}
              </a>
            ))
          ) : (
            <>
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => open(s.id)}
                  aria-current={s.id === view ? "page" : undefined}
                  className={`${pill} ${s.id === view ? pillOn : pillIdle}`}
                >
                  {s.title}
                </button>
              ))}
              {showAll && (
                <button
                  type="button"
                  onClick={() => open(ALL)}
                  className={`${pill} ${pillIdle}`}
                >
                  Everything
                </button>
              )}
            </>
          )}
        </nav>
      )}
      {view !== null && toggle}
      {hide && <style>{hide}</style>}
      <div className="quanah-sections">{children}</div>
    </>
  );
}
