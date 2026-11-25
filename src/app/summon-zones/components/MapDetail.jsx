"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cellBox, cellIndex, geometry, safeSummonCells } from "@/lib/fieldsplit/grid";
import {
  KINDS,
  MAX_SUMMONS,
  approachFrom,
  bodyBox,
  coveredSpawns,
  isPlaced,
  labels as summonLabels,
  pausePlan,
  rangeBoxes,
  spacingIssues,
  statusesAt,
  summonZones,
} from "@/lib/fieldsplit/summons";
import {
  DUSK_COLOR,
  KIND_COLOR,
  LINE_BOUNDARY,
  LINE_TRANSITION,
  SAFE_SPOT,
  SPAWN,
  STANDING,
  STATUS,
  ZONE_FILL,
  rangeColor,
  tint,
} from "./colors";

const STATUS_TEXT = { visible: "active", depends: "depends on direction", hidden: "paused" };
const cellList = (cells) => cells.map((c) => `${c.c},${c.r}`).join(", ");
const nameList = (names) =>
  names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

export default function MapDetail({ map, data, summons: saved, onSummons, dusk, onDusk }) {
  // largeSplit maps use a bigger grid than we can draw; the standard one is only shown on request
  const nonStandard = map.largeSplit != null;
  const [showGrid, setShowGrid] = useState(!nonStandard);
  const [showSpawns, setShowSpawns] = useState(true);
  const [showHitboxes, setShowHitboxes] = useState(true);
  const [kind, setKind] = useState("dawn");
  const [hover, setHover] = useState(null);
  // while dragging a marker, the layout lives here and goes to the URL on release
  const [draft, setDraft] = useState(null);
  const all = draft ?? saved;
  // Dusk and Dawn can't be active together: with Dusk on, the Dawn rings are kept (in the URL too)
  // but set aside until it's turned off. Everything below works on the entries in play.
  const { summons, playIdx, setAside } = useMemo(() => {
    const inPlay = (s) => !(dusk && s.kind === "dawn");
    const idx = all.flatMap((s, i) => (inPlay(s) ? [i] : []));
    return { summons: idx.map((i) => all[i]), playIdx: idx, setAside: all.filter((s) => !inPlay(s)) };
  }, [all, dusk]);
  // set-aside entries are all Dawn rings, and there are no Dawn rings in play while they're aside,
  // so putting them first keeps the rings' cast order
  const setSummons = (next) => onSummons([...setAside, ...next]);
  const me = summons.find((s) => s.kind === "you");
  const toggleDusk = (v) => {
    onDusk(v);
    if (v && kind === "dawn") setKind(me ? "other" : "you");
  };

  const g = useMemo(() => geometry(map, data), [map, data]);
  const safe = useMemo(() => safeSummonCells(g), [g]);
  // only "hides" maps can pause a summon, so zones and loot warnings only apply there
  const hides = map.status === "hides";

  const names = useMemo(() => summonLabels(summons), [summons]);
  const boxes = useMemo(() => rangeBoxes(summons, { dusk }), [summons, dusk]);
  const bodies = useMemo(() => map.mobs.map((id) => bodyBox(data.hitboxes[id])), [map, data]);
  const covered = useMemo(
    () => coveredSpawns(summons, boxes, map.spawnPts, bodies),
    [summons, boxes, map, bodies],
  );
  const anyPlaced = summons.some(isPlaced);
  // each placed summon's state from where your character idles
  const standing = me && hides && anyPlaced ? statusesAt(g, summons, me.x, me.y) : null;
  const plan = useMemo(() => (hides && anyPlaced ? pausePlan(g, summons) : null), [g, summons, hides, anyPlaced]);
  const spacing = useMemo(() => spacingIssues(summons), [summons]);

  const mobCounts = useMemo(() => {
    const c = new Array(map.mobs.length).fill(0);
    for (const [, , i] of map.spawnPts) c[i]++;
    return map.mobs.map((id, i) => ({ id, name: data.mobs[id]?.[0] ?? `Mob ${id}`, lv: data.mobs[id]?.[1], n: c[i] }));
  }, [map, data]);

  // a click adds a summon of the picked kind, or when that kind is at its limit, moves the nearest
  // one of that kind there
  const place = (p) => {
    const same = summons.flatMap((s, i) => (s.kind === kind ? [i] : []));
    if (same.length < KINDS[kind].max && summons.length < MAX_SUMMONS) return setSummons([...summons, { kind, ...p }]);
    if (!same.length) return;
    const dist = (i) => Math.hypot(summons[i].x - p.x, summons[i].y - p.y);
    const k = same.reduce((a, b) => (dist(b) < dist(a) ? b : a));
    setSummons(summons.map((s, i) => (i === k ? { ...s, ...p } : s)));
  };
  const drag = {
    // i indexes the entries in play; the draft holds the whole layout
    move: (i, p) => setDraft((d) => (d ?? saved).map((s, j) => (j === playIdx[i] ? { ...s, ...p } : s))),
    end: () => {
      if (draft) onSummons(draft);
      setDraft(null);
    },
  };

  return (
    <section className="space-y-4">
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-2xl font-bold text-primary-bright">{map.name}</h2>
          <span className="text-primary-dim text-sm">#{map.id}</span>
        </div>
        <p className="text-primary">
          {map.street} · {map.region}
          {map.minLv != null && ` · Lv ${map.minLv}${map.maxLv !== map.minLv ? `–${map.maxLv}` : ""}`}
        </p>
      </header>

      <Verdict map={map} safe={safe} />

      <SummonPicker
        summons={summons}
        names={names}
        onSummons={setSummons}
        kind={kind}
        onKind={setKind}
        dusk={dusk}
        onDusk={toggleDusk}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary">
        {nonStandard && (
          <Toggle checked={showGrid} onChange={setShowGrid}>
            Show standard grid
          </Toggle>
        )}
        <Toggle checked={showSpawns} onChange={setShowSpawns}>
          Monster spawns
        </Toggle>
        <Toggle checked={showHitboxes} onChange={setShowHitboxes}>
          Monster hitboxes
        </Toggle>
      </div>

      <Viewer
        map={map}
        g={g}
        gridOn={showGrid}
        hides={hides}
        showSpawns={showSpawns}
        showHitboxes={showHitboxes}
        bodies={bodies}
        safe={safe}
        summons={summons}
        names={names}
        boxes={boxes}
        standing={standing}
        covered={covered}
        onClick={place}
        drag={drag}
        onHover={setHover}
      />

      <Readout g={g} gridOn={showGrid} hides={hides} hover={hover} summons={summons} names={names} />
      <LootNotes g={g} map={map} summons={summons} names={names} boxes={boxes} covered={covered} plan={plan} spacing={spacing} />
      <Legend gridOn={showGrid} hides={hides} showHitboxes={showHitboxes} summons={summons} boxes={boxes} safe={!!safe} />

      <div className="text-sm text-primary">
        <h3 className="mb-1 font-bold text-primary-bright">Monsters</h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {mobCounts.map((m) => (
            <li key={m.id}>
              {m.name}
              {m.lv != null && <span className="text-primary-dim"> Lv {m.lv}</span>}
              <span className="text-primary-dim"> ×{m.n}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Verdict({ map, safe }) {
  let note = null;
  if (map.status === "unknown") note = "This map's larger grid hasn't been worked out, so its zones can't be shown.";
  else if (map.status === "safe" && map.largeSplit != null) note = "Uses a larger grid than usual.";
  else if (map.status === "hides" && !safe) note = "No single spot covers the whole map.";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 text-primary">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS[map.status].dot}`} />
      <span className="font-bold text-primary-bright">{STATUS[map.status].label}</span>
      {note && <span>{note}</span>}
    </div>
  );
}

/**
 * What looting does to the placed summons. Below the map rather than above it, so placing a summon
 * doesn't push the map down under the cursor.
 */
function LootNotes({ g, map, summons, names, boxes, covered, plan, spacing }) {
  const me = summons.find((s) => !isPlaced(s));
  const anyRange = boxes.some(Boolean);
  if (!plan && !anyRange && !spacing.length) return null;
  const cells = (list) => `cell${list.length > 1 ? "s" : ""} ${cellList(list)}`;

  return (
    <div className="rounded-lg border border-primary-dim/40 bg-background-bright p-4 text-primary space-y-1.5 text-sm">
      {plan && !plan.home.length && (
        <p className="font-bold text-primary-bright">No spot keeps every summon active.</p>
      )}
      {plan && plan.home.length > 0 && !plan.pauses.length && <p>All active everywhere.</p>}
      {plan && plan.home.length > 0 && plan.pauses.length > 0 && (
        <>
          <p>
            <span style={{ color: SAFE_SPOT }}>All active</span>: {cells(plan.home)}
          </p>
          {plan.pauses.map((p) => (
            <p key={p.summons.join()}>
              {nameList(p.summons.map((i) => names[i]))} paused: {cells(p.cells)}
            </p>
          ))}
        </>
      )}
      {me && plan && <StandingCheck g={g} summons={summons} names={names} me={me} />}
      {anyRange && (
        <p className="text-primary-dim">
          {covered.size}/{map.spawnPts.length} spawns in range
        </p>
      )}
      {spacing.map((s) => (
        <p key={`${s.i}-${s.j}`} className="text-progress-orange">
          {names[s.i]} and {names[s.j]} are {Math.round(s.dist)} apart (
          {s.kind === "close" ? `min ${KINDS.dawn.minGap}` : `max ${KINDS.dawn.maxGap}`})
        </p>
      ))}
    </div>
  );
}

/** Which summons keep attacking while your character idles where it's placed. */
function StandingCheck({ g, summons, names, me }) {
  const st = statusesAt(g, summons, me.x, me.y);
  const hidden = st.flatMap((v, i) => (v === "hidden" ? [i] : []));
  const depends = st.flatMap((v, i) => (v === "depends" ? [i] : []));
  return (
    <p>
      <strong className="text-primary-bright">At your character: </strong>
      {!hidden.length && !depends.length && "all active"}
      {hidden.length > 0 && (
        <span className="text-progress-red">{nameList(hidden.map((i) => names[i]))} paused. </span>
      )}
      {depends.map((i) => (
        <span key={i} className="text-progress-orange">
          {names[i]} only active coming from {nameList(approachFrom(g, summons[i], me.x, me.y))}.{" "}
        </span>
      ))}
    </p>
  );
}

/** Which kind of summon a click places, and the summons placed so far. Fixed height. */
function SummonPicker({ summons, names, onSummons, kind, onKind, dusk, onDusk }) {
  const count = (k) => summons.filter((s) => s.kind === k).length;
  return (
    <div className="rounded-lg border border-primary-dim/40 bg-background-bright p-4 text-primary space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-primary-bright mr-1">Place</span>
        {Object.entries(KINDS).map(([k, v]) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => onKind(k)}
            disabled={dusk && k === "dawn"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
              kind === k ? "border-secondary bg-background text-primary-bright" : "border-primary-dim/50 enabled:hover:border-secondary"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {v.name}
            <span className="text-primary-dim text-xs">
              {count(k)}/{v.max}
            </span>
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={dusk} onChange={(e) => onDusk(e.target.checked)} />
        Sol Janus: Dusk
      </label>
      {/* always rendered at the same height, so the map doesn't move under the cursor */}
      <div className="flex flex-wrap items-center gap-2 min-h-[1.75rem]">
        {summons.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full border border-primary-dim/60 pl-2.5 pr-1 py-0.5 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[s.kind] }} />
            {names[i]}
            <button
              type="button"
              aria-label={`Remove ${names[i]}`}
              onClick={() => onSummons(summons.filter((_, j) => j !== i))}
              className="rounded-full p-0.5 hover:bg-background"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {summons.length > 0 && (
          <button type="button" className="text-sm text-primary-dim hover:text-primary-bright underline" onClick={() => onSummons([])}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

/**
 * The game's minimap with an SVG overlay in map units: minimap pixel = (map coord + center) /
 * 2^mag, so a viewBox of (-centerX, -centerY, width, height) lines the two up.
 */
function Viewer({ map, g, gridOn, hides, showSpawns, showHitboxes, bodies, safe, summons, names, boxes, standing, covered, onClick, drag, onHover }) {
  const svgRef = useRef(null);
  const dragging = useRef(null); // { i, moved }
  const justDragged = useRef(false);
  const [cx, cy, , w, h] = map.miniMap;
  const [fl, ft, fr, fb] = map.fh;
  const unit = w / 1000; // marker sizes scale with the map so they read the same on any map
  const anyRange = boxes.some(Boolean);
  const clamp = (p) => ({ x: Math.min(Math.max(p.x, fl), fr), y: Math.min(Math.max(p.y, ft - 200), fb) });

  const toMap = (e) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const zoneRects = useMemo(
    () => (gridOn && hides && summons.some(isPlaced) ? summonZones(g, summons) : []),
    [g, gridOn, hides, summons],
  );
  const safeBox = gridOn && hides && !summons.some(isPlaced) && safe ? cellBox(g, safe.cols, safe.rows) : null;

  const cellLabels = [];
  if (gridOn) {
    for (let c = 0; c < g.x.n; c++)
      for (let r = 0; r < g.y.n; r++)
        cellLabels.push({ c, r, x: g.x.start + c * g.x.size, y: g.y.start + r * g.y.size });
  }

  return (
    <div
      className="relative w-full mx-auto overflow-hidden rounded-lg border border-primary-dim/40 bg-background-dim"
      // tall maps would fill several screens at full width, so cap the height and keep the ratio
      style={{ aspectRatio: `${w} / ${h}`, maxWidth: `calc(70vh * ${w / h})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static minimap, sized by the overlay */}
      <img
        src={`/fieldsplit/minimap/${map.id}.png`}
        alt={`${map.name} minimap`}
        className="absolute inset-0 w-full h-full select-none"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox={`${-cx} ${-cy} ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onPointerMove={(e) => {
          const p = toMap(e);
          onHover(p);
          const d = dragging.current;
          if (d && p) {
            d.moved = true;
            drag.move(d.i, clamp(p));
          }
        }}
        onPointerUp={() => {
          const d = dragging.current;
          if (!d) return;
          dragging.current = null;
          justDragged.current = d.moved;
          drag.end();
        }}
        onPointerLeave={() => onHover(null)}
        onClick={(e) => {
          // the click that ends a drag (or lands on a marker) doesn't place anything
          if (justDragged.current || e.target.closest("[data-marker]")) {
            justDragged.current = false;
            return;
          }
          const p = toMap(e);
          // summons go where you stand, or a little above when cast mid-jump
          if (p) onClick(clamp(p));
        }}
      >
        {zoneRects.map((z, i) => (
          <rect
            key={i}
            x={z.x0}
            y={z.y0}
            width={z.x1 - z.x0}
            height={z.y1 - z.y0}
            fill={ZONE_FILL[z.hidden.length ? "hidden" : z.depends.length ? "depends" : "visible"]}
          />
        ))}

        {safeBox && (
          <rect
            x={safeBox.x0}
            y={safeBox.y0}
            width={safeBox.x1 - safeBox.x0}
            height={safeBox.y1 - safeBox.y0}
            fill="hsla(126, 60%, 50%, 0.18)"
            stroke={SAFE_SPOT}
            strokeWidth={2}
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {gridOn &&
          g.x.bounds.map((b) => (
            <g key={`x${b}`}>
              <Line x1={b - g.x.band} y1={-cy} x2={b - g.x.band} y2={h - cy} color={LINE_TRANSITION} />
              <Line x1={b + g.x.band} y1={-cy} x2={b + g.x.band} y2={h - cy} color={LINE_TRANSITION} />
              <Line x1={b} y1={-cy} x2={b} y2={h - cy} color={LINE_BOUNDARY} />
            </g>
          ))}
        {gridOn &&
          g.y.bounds.map((b) => (
            <g key={`y${b}`}>
              <Line x1={-cx} y1={b - g.y.band} x2={w - cx} y2={b - g.y.band} color={LINE_TRANSITION} />
              <Line x1={-cx} y1={b + g.y.band} x2={w - cx} y2={b + g.y.band} color={LINE_TRANSITION} />
              <Line x1={-cx} y1={b} x2={w - cx} y2={b} color={LINE_BOUNDARY} />
            </g>
          ))}

        {cellLabels.map((l) => (
          <Label key={`${l.c},${l.r}`} x={Math.max(l.x, -cx) + 8 * unit} y={Math.max(l.y, -cy) + 22 * unit} size={18 * unit}>
            {l.c},{l.r}
          </Label>
        ))}

        {/* attack ranges under the spawn dots, so you can see which spawns they reach */}
        {summons.map((s, i) => {
          const box = boxes[i];
          if (!box) return null;
          // a summon paused where your character idles does nothing, so its range fades
          const paused = standing?.[i] === "hidden";
          return (
            <rect
              key={`range${i}`}
              x={s.x + box.l}
              y={s.y + box.t}
              width={box.r - box.l}
              height={box.b - box.t}
              fill={tint(rangeColor(s), paused ? 0.04 : 0.12)}
              stroke={rangeColor(s)}
              strokeOpacity={paused ? 0.35 : 1}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
              className="pointer-events-none"
            />
          );
        })}

        {/* what a range has to overlap to hit the monster; the dot is only where its feet are */}
        {showHitboxes &&
          map.spawnPts.map(([x, y, m], i) => {
            const body = bodies[m];
            const out = anyRange && !covered.has(i);
            return (
              <rect
                key={`hitbox${i}`}
                x={x + body.l}
                y={y + body.t}
                width={body.r - body.l}
                height={body.b - body.t}
                fill={out ? "none" : tint(SPAWN, 0.18)}
                stroke={out ? "white" : SPAWN}
                strokeOpacity={out ? 0.6 : 1}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-none"
              />
            );
          })}

        {showSpawns &&
          map.spawnPts.map(([x, y], i) => {
            const mine = anyRange && !covered.has(i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y - 6 * unit}
                r={5 * unit}
                fill={mine ? "white" : SPAWN}
                stroke={mine ? SPAWN : "black"}
                strokeWidth={mine ? 2 : 1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

        {summons.map((s, i) => (
          <g
            key={`summon${i}`}
            data-marker
            className="cursor-grab"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              e.preventDefault();
              svgRef.current?.setPointerCapture(e.pointerId);
              dragging.current = { i, moved: false };
            }}
          >
            {s.kind === "you" ? (
              <rect
                x={s.x - 10 * unit}
                y={s.y - 36 * unit}
                width={20 * unit}
                height={36 * unit}
                rx={6 * unit}
                fill={KIND_COLOR.you}
                stroke="black"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <circle cx={s.x} cy={s.y - 14 * unit} r={11 * unit} fill={KIND_COLOR[s.kind]} stroke="black" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            )}
            {standing?.[i] && (
              <circle
                cx={s.x}
                cy={s.y - 14 * unit}
                r={17 * unit}
                fill="none"
                stroke={STANDING[standing[i]]}
                strokeWidth={4}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* a bigger invisible target, so markers are easy to grab on a phone */}
            <circle cx={s.x} cy={s.y - 16 * unit} r={28 * unit} fill="transparent" />
            <Label x={s.x} y={s.y - (s.kind === "you" ? 44 : 32) * unit} size={17 * unit} anchor="middle">
              {names[i]}
            </Label>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Label({ x, y, size, anchor, children }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill="white"
      stroke="black"
      strokeWidth={size / 6}
      paintOrder="stroke"
      className="pointer-events-none select-none"
    >
      {children}
    </text>
  );
}

function Line({ color, ...p }) {
  return <line {...p} stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />;
}

function Readout({ g, gridOn, hides, hover, summons, names }) {
  let text = summons.length ? "" : "Click the map to place.";
  if (hover && gridOn) {
    const cell = `${cellIndex(hover.x, g.x)},${cellIndex(hover.y, g.y)}`;
    if (summons.some(isPlaced) && hides) {
      const st = statusesAt(g, summons, hover.x, hover.y);
      text = `Cell ${cell}: ${st
        .flatMap((s, i) => (s ? [`${names[i]} ${STATUS_TEXT[s]}`] : []))
        .join(" · ")}`;
    } else {
      text = `Cell ${cell}`;
    }
  }
  return <p className="min-h-[1.5rem] text-sm text-primary">{text}</p>;
}

function Legend({ gridOn, hides, showHitboxes, summons, boxes, safe }) {
  const items = [];
  if (gridOn) {
    items.push(
      { swatch: <LineSwatch color={LINE_BOUNDARY} />, label: "Cell boundary" },
      { swatch: <LineSwatch color={LINE_TRANSITION} />, label: "Transition line" },
    );
  }
  const ranges = new Map();
  summons.forEach((s, i) => {
    if (!boxes[i]) return;
    if (s.kind === "you") ranges.set("dusk", { color: DUSK_COLOR, label: "Dusk range" });
    else ranges.set(s.kind, { color: KIND_COLOR[s.kind], label: "Dawn range" });
  });
  for (const r of ranges.values()) {
    items.push({ swatch: <Box fill={tint(r.color, 0.12)} border={r.color} />, label: r.label });
  }
  if (ranges.size) {
    items.push(
      { swatch: <Dot color={SPAWN} />, label: "Spawn in range" },
      { swatch: <Dot color="white" border={SPAWN} />, label: "Spawn out of range" },
    );
  } else {
    items.push({ swatch: <Dot color={SPAWN} />, label: "Monster spawn" });
  }
  if (showHitboxes) {
    items.push({
      swatch: <span className="inline-block w-3 h-4" style={{ background: tint(SPAWN, 0.18), border: `1px solid ${SPAWN}` }} />,
      label: "Monster hitbox",
    });
  }
  if (gridOn && hides && summons.some(isPlaced)) {
    items.push(
      { swatch: <Box fill={ZONE_FILL.visible} />, label: "All active" },
      { swatch: <Box fill={ZONE_FILL.depends} />, label: "Depends on direction" },
      { swatch: <Box fill={ZONE_FILL.hidden} />, label: "A summon is paused" },
    );
  } else if (gridOn && hides && safe) {
    items.push({ swatch: <Box fill="hsla(126, 60%, 50%, 0.3)" border={SAFE_SPOT} />, label: "Covers the whole map" });
  }
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-primary">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.swatch}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

const LineSwatch = ({ color }) => <span className="inline-block w-4 h-0.5" style={{ background: color }} />;
const Dot = ({ color, border }) => (
  <span
    className="inline-block w-2.5 h-2.5 rounded-full"
    style={{ background: color, border: border ? `2px solid ${border}` : undefined }}
  />
);
const Box = ({ fill, border }) => (
  <span
    className="inline-block w-4 h-3 rounded-sm"
    style={{ background: fill, border: border ? `1px dashed ${border}` : undefined }}
  />
);
