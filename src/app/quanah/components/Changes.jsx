"use client";

import { useSyncExternalStore } from "react";

// Entries that changed in the latest data update carry a `before` object with the old value
// of each changed field. These components show old -> new, and a page-wide toggle hides the
// old values.

// The toggle lives in localStorage (kept in memory when storage is unavailable), shared by
// every component on the page through useSyncExternalStore. Old values show by default.
const STORAGE_KEY = "quanah-show-before";
let memory = true;
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readShowBefore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? memory : saved === "1";
  } catch {
    return memory;
  }
}

function setShowBefore(value) {
  memory = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
}

export function useChanges() {
  const showBefore = useSyncExternalStore(
    subscribe,
    readShowBefore,
    () => true,
  );
  return { showBefore, setShowBefore };
}

export function ChangesToggle({ floating = false }) {
  const { showBefore, setShowBefore } = useChanges();
  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={showBefore}
      onClick={() => setShowBefore(!showBefore)}
      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-bright"
    >
      <span
        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
          showBefore ? "bg-secondary" : "bg-primary/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
            showBefore ? "translate-x-4 bg-background" : "bg-primary-bright"
          }`}
        />
      </span>
      Show old values
    </button>
  );
  if (!floating) return button;
  return (
    <div className="fixed bottom-4 right-4 z-20 rounded-full border border-primary/20 bg-background-bright/95 px-4 py-2 shadow-lg backdrop-blur">
      {button}
    </div>
  );
}

const changeLabel = (entry) =>
  entry?.added ? "New" : entry?.before ? "Changed" : null;

const dot = "inline-block w-[7px] h-[7px] shrink-0 rounded-full";

// Where the dot sits: a gutter at the left edge of each row, centred on the row's first line.
// The row (or table cell) must be `relative` and have pl-5 so the gutter is empty.
const DOT_AT = {
  cell: "left-[7px] top-[15px]", // table cell: py-2, text-sm (20px line)
  row: "left-[7px] top-[21px]", // list row: p-3, text-base (24px line)
  card: "left-[7px] top-[25px]", // card: p-4, text-base (24px line)
};

// Marks a changed entry with a dot in its row's left gutter, so names and the text under them
// never move. Without `entry` it renders an inline dot, for the legend.
export function ChangedDot({ entry, at = "cell" }) {
  if (entry === undefined)
    return <span className={`${dot} bg-secondary align-middle`} aria-hidden />;
  const label = changeLabel(entry);
  if (!label) return null;
  return (
    <span
      title={label}
      className={`${dot} bg-secondary absolute ${DOT_AT[at]}`}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}

const del = "text-progress-red line-through decoration-1 opacity-80";
const ins = "text-progress-green font-semibold no-underline";

// Word-level diff (LCS over words and whitespace). Returns [{ type: "same"|"del"|"ins", text }].
function diffWords(a, b) {
  const x = a.split(/(\s+)/).filter(Boolean);
  const y = b.split(/(\s+)/).filter(Boolean);
  const n = x.length,
    m = y.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i][j] =
        x[i] === y[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out = [];
  const push = (type, text) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };
  let i = 0,
    j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) {
      push("same", x[i]);
      i++;
      j++;
    } else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) {
      push("ins", y[j]);
      j++;
    } else {
      push("del", x[i]);
      i++;
    }
  }
  // show each replaced stretch as "old new" rather than interleaved words
  const merged = [];
  for (let k = 0; k < out.length; k++) {
    const cur = out[k],
      next = out[k + 1];
    if (cur.type === "ins" && next?.type === "del") {
      merged.push(next, cur);
      k++;
    } else merged.push(cur);
  }
  return merged;
}

// Text that may have changed: old words struck through next to the new ones.
export function DiffText({ before, after }) {
  const { showBefore } = useChanges();
  if (before == null || before === after || !showBefore) return after;
  return diffWords(before, after).map((part, k) =>
    part.type === "same" ? (
      part.text
    ) : part.type === "del" ? (
      <del key={k} className={`${del} mr-1`}>
        {part.text}
      </del>
    ) : (
      <ins key={k} className={ins}>
        {part.text}
      </ins>
    ),
  );
}

const COMPACT = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
];
const FORMATS = {
  // 182567756736 -> "182.57B", with the exact number on hover
  compact: (v) => {
    const [div, suffix] = COMPACT.find(([d]) => Math.abs(v) >= d) ?? [1, ""];
    return (
      <span title={v.toLocaleString("en-US")}>
        {+(v / div).toFixed(2) + suffix}
      </span>
    );
  },
  number: (v) => v.toLocaleString("en-US"),
  percent: (v) => `${v}%`,
  plain: (v) => v,
};

// A single value that may have changed: "old -> new". `kind` picks the number format.
export function DiffValue({ entry, field, kind = "plain" }) {
  const { showBefore } = useChanges();
  const format = (v) => (v == null || v === "" ? "—" : FORMATS[kind](v));
  const value = entry[field];
  if (!entry.before || !(field in entry.before) || !showBefore)
    return format(value);
  return (
    <>
      <del className={del}>{format(entry.before[field])}</del>
      <span className="text-primary-dim mx-1" aria-hidden>
        →
      </span>
      <ins className={ins}>{format(value)}</ins>
    </>
  );
}

// Content that only makes sense next to old values (e.g. a removed list entry).
export function OnlyWithBefore({ children }) {
  const { showBefore } = useChanges();
  return showBefore ? children : null;
}
