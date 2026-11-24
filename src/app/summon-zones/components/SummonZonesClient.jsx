"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loadFieldSplit } from "@/lib/fieldsplit/grid";
import MapList from "./MapList";
import MapDetail from "./MapDetail";
import { KINDS, KIND_BY_KEY, MAX_SUMMONS } from "@/lib/fieldsplit/summons";
import { LINE_BOUNDARY, LINE_TRANSITION, SAFE_SPOT, STANDING } from "./colors";

// Selection lives in the URL (?map=<id>&summons=<kind>:<x>,<y>;...) so a map and summon layout
// can be linked; kind is y (your character), d (Sol Janus: Dawn) or o (other summon). dusk=1 when
// using Sol Janus: Dusk instead of Dawn. Written with
// history.replaceState, like the Quanah calculators: it changes on every click and needs no
// server round trip.
function parseSummons(v) {
  if (!v) return [];
  return v
    .split(";")
    .map((part) => {
      const [key, xy = ""] = part.split(":");
      const [x, y] = xy.split(",").map(Number);
      const kind = KIND_BY_KEY[key];
      return kind && Number.isFinite(x) && Number.isFinite(y) ? { kind, x, y } : null;
    })
    .filter(Boolean)
    .slice(0, MAX_SUMMONS);
}
const formatSummons = (list) =>
  list.map((s) => `${KINDS[s.kind].key}:${Math.round(s.x)},${Math.round(s.y)}`).join(";");

export default function SummonZonesClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const mapId = Number(searchParams.get("map")) || null;
  const summonsParam = searchParams.get("summons");
  const summons = useMemo(() => parseSummons(summonsParam), [summonsParam]);
  const dusk = searchParams.get("dusk") === "1";

  useEffect(() => {
    let cancelled = false;
    loadFieldSplit().then(
      (d) => !cancelled && setData(d),
      (e) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const setParams = useCallback(
    (patch) => {
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") params.delete(k);
        else params.set(k, String(v));
      }
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname],
  );

  const selectMap = useCallback((id) => setParams({ map: id, summons: null }), [setParams]);
  const setSummons = useCallback(
    (next) => setParams({ summons: formatSummons(next) || null }),
    [setParams],
  );
  const setDusk = useCallback((v) => setParams({ dusk: v ? "1" : null }), [setParams]);

  const map = data && mapId ? data.byId.get(mapId) : null;

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10">
      <article className="max-w-7xl mx-auto">
        <header className="mb-6 pb-6 border-b border-primary/20">
          <h1 className="text-4xl font-bold text-primary-bright">Summon Zones</h1>
          <p className="mt-2 text-primary max-w-3xl">
            Placed summons stop attacking when you're more than one cell away on the map's hidden grid.
          </p>
        </header>

        {error && <p className="text-progress-red">{error}</p>}
        {!data && !error && (
          <p className="flex items-center gap-2 text-primary-dim">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading maps…
          </p>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <MapList data={data} selectedId={mapId} onSelect={selectMap} />
            <div className="min-w-0">
              {map ? (
                <MapDetail key={map.id} map={map} data={data} summons={summons} onSummons={setSummons} dusk={dusk} onDusk={setDusk} />
              ) : (
                <Explainer data={data} />
              )}
            </div>
          </div>
        )}

        {data && map && (
          <div className="mt-10">
            <Explainer data={data} />
          </div>
        )}
      </article>
    </main>
  );
}

function Explainer({ data }) {
  const [cw, ch] = data.cell;
  const [bw, bh] = data.band;
  return (
    <section className="rounded-lg border border-primary-dim/40 bg-background-bright p-5 text-primary space-y-3">
      <h2 className="text-xl font-bold text-primary-bright">How it works</h2>
      <p>
        Cells are {cw}×{ch}, starting from the map's top-left corner. Summons outside the 3×3 block of
        cells around you are paused.
      </p>
      <p>
        You don't change cell right at the <span style={{ color: LINE_BOUNDARY }}>boundary</span>. You
        change at the <span style={{ color: LINE_TRANSITION }}>transition line</span> {bw} units past
        it ({bh} vertically), so each boundary has a line on either side, one per direction. Between
        the two, you still count as being in the cell you came from.
      </p>
      <p>
        That means a summon pauses at one line when you walk away and resumes at a different line when
        you walk back. In the <span style={{ color: STANDING.depends }}>amber</span> areas, a summon is
        active if you walked in from its side and paused if you came from the other. Coming back from
        looting, walk through the amber into the <span style={{ color: SAFE_SPOT }}>green</span> to
        get everything attacking again.
      </p>
      <p className="text-sm text-primary-dim">
        Maps 200+ only. Data from {new Date(data.generated).toLocaleDateString()}.
      </p>
    </section>
  );
}
