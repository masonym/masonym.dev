"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Calculator inputs live in the URL so a setup can be linked, and are mirrored to localStorage so
// your own progress is still there next visit (restored only when the URL carries none of the
// calculator's keys).
//
// Writes go through history.replaceState, which Next keeps in sync with useSearchParams, rather
// than router.replace: these change on every click and need no server round trip. Each write
// starts from window.location so two calculators writing back to back don't drop each other's
// keys, and the section browser's ?section= is left alone.
export default function useParamState(keys, storageKey) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const set = useCallback(
    (patch) => {
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined || v === "" || v === 0 || v === "0")
          params.delete(k);
        else params.set(k, String(v));
      }
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
      try {
        const saved = {};
        for (const k of keys) if (params.has(k)) saved[k] = params.get(k);
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch {
        // storage unavailable: the URL still holds everything
      }
    },
    // keys is a module-level constant at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, storageKey],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (keys.some((k) => params.has(k))) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved && Object.keys(saved).length) set(saved);
    } catch {
      // nothing saved, or storage unavailable
    }
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const get = useCallback((k) => searchParams.get(k), [searchParams]);
  return [get, set];
}
