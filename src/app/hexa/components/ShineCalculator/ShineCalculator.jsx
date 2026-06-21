"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import erdaLinkData from "@/data/erda-link-data.json";
import solErda from "../../assets/sol_erda.png";
import solErdaFragment from "../../assets/sol_erda_fragment.png";

const SHINE_CLASSES = new Set(["Sia Astelle", "Erel Light"]);
const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 1440;
const NODE_SIZE = 48;
const STORAGE_PREFIX = "erdaLinkBuild";

const STAT_LABELS = {
  nbdR: "Normal Damage",
  expR: "EXP Obtained",
  mesoR: "Meso Obtained",
  dropR: "Item Drop Rate",
  bufftimeR: "Buff Duration",
  allR: "All Stats",
  intFX: "INT",
  lukFX: "LUK",
  strFX: "STR",
  dexFX: "DEX",
  madX: "Magic ATT",
  padX: "ATT",
  damR: "Damage",
  bdR: "Boss Damage",
  incCrDam: "Critical Damage",
  ignoreMobpdpR: "Ignore DEF",
};

// Stats whose stored value is in 0.01% units (rate stats); everything else is flat.
const isPercentStat = (key) => key.endsWith("R") || key === "incCrDam";
const formatStatValue = (key, value) =>
  isPercentStat(key)
    ? `${(value / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
    : `+${value.toLocaleString()}`;

const formatMeso = (value) => {
  const n = Math.round(value);
  if (n >= 1e12) return `${(n / 1e12).toLocaleString(undefined, { maximumFractionDigits: 2 })}T`;
  if (n >= 1e9) return `${(n / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  return n.toLocaleString();
};

const formatCost = (cost = {}) => ({
  solErda: cost.solErda || 0,
  fragments: cost.fragments || 0,
  meso: cost.meso || 0,
});

const addCost = (total, cost) => ({
  solErda: total.solErda + (cost.solErda || 0),
  fragments: total.fragments + (cost.fragments || 0),
  meso: total.meso + (cost.meso || 0),
});

const clampLevel = (value, maxLevel, minLevel = 0) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return minLevel;
  return Math.max(minLevel, Math.min(maxLevel, parsed));
};

// The origin node is granted for free at level 1 and can never be deactivated.
const isFreeOrigin = (stone) => stone?.costType === "origin";
const minLevelFor = (stone) => (isFreeOrigin(stone) ? 1 : 0);

const getStoneIconPath = (stone, treeId, disabled = false) => {
  const file = disabled ? "iconDisabled.png" : "icon.png";
  return `/erda-link/stones/${treeId}/${stone.category}/${stone.id}/${file}`;
};

const getStoneLabelPath = (stone) => {
  const label = stone.costType === "rushEnd" ? "rushEnd" : stone.category === "SHINE" ? "shine" : stone.category;
  return `/erda-link/labels/${label}.png`;
};

const parseDesc = (desc) =>
  desc.split(/(\\n|#c[^#]*#)/).map((part, i) => {
    if (part === '\\n') return <br key={i} />;
    if (part.startsWith('#c')) {
      const lines = part.slice(2, -1).split('\\n');
      return (
        <span key={i} style={{ color: '#c84b00' }}>
          {lines.flatMap((line, j) => j === 0 ? [line] : [<br key={j} />, line])}
        </span>
      );
    }
    return part;
  });

const isNodeUnlockable = (node, nodeLevels) => {
  const andMet = node.prereqAnd.every((nodeIndex) => (nodeLevels[nodeIndex] || 0) > 0);
  const orMet = node.prereqOr.length === 0 || node.prereqOr.some((nodeIndex) => (nodeLevels[nodeIndex] || 0) > 0);
  return andMet && orMet;
};

const getStatsAtLevel = (stone, level) => {
  const groups = stone.passives || [];
  const merged = {};
  groups.forEach((group) => {
    const stats = group?.[level] || group?.[String(level)] || {};
    Object.entries(stats).forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
  });
  return merged;
};

const getTransitionCost = (stone, fromLevel) => {
  const costType = stone.costType || "default";
  if (fromLevel === 0) {
    // Origin starts unlocked at level 1, so its activation is free.
    if (isFreeOrigin(stone)) return formatCost();
    return formatCost(erdaLinkData.costs.activation?.[stone.category]?.[costType]);
  }
  return formatCost(erdaLinkData.costs.enforcement?.[stone.category]?.[fromLevel]?.[costType]);
};

const calculateCostToLevel = (stone, targetLevel) => {
  let total = { solErda: 0, fragments: 0, meso: 0 };
  for (let level = 0; level < targetLevel; level += 1) {
    total = addCost(total, getTransitionCost(stone, level));
  }
  return total;
};

const calculateDeltaCost = (stone, currentLevel, targetLevel) => {
  let total = { solErda: 0, fragments: 0, meso: 0 };
  for (let level = currentLevel; level < targetLevel; level += 1) {
    total = addCost(total, getTransitionCost(stone, level));
  }
  return total;
};

// ─── SHINE stone (RNG) cost model ─────────────────────────────────────────────
// Enforcing a SHINE stone is random: each attempt can succeed, fail (no change),
// or downgrade a level. We report the *expected* (average) material cost.

const getShineAttemptCost = (level) => {
  // Level 0 → 1 is the one-time activation (Sol Erda + fragments); every higher
  // level is a meso + fragment enforcement attempt.
  if (level === 0) return formatCost(erdaLinkData.costs.activation?.SHINE?.default);
  return formatCost(erdaLinkData.costs.enforcement?.SHINE?.[level]?.default);
};

const getShineProb = (shineStone, level) =>
  shineStone.enforceProbs?.[level] || { successRate: 100, failRate: 0, downgradeRate: 0 };

// steps[L] = expected cost to advance from level L to L+1 for the first time.
// A failed attempt repeats level L; a downgrade drops to L-1, forcing a re-climb:
//   C_L = (attemptCost_L + downgradeRate · C_{L-1}) / successRate
const calcShineStepCosts = (shineStone) => {
  const steps = [];
  for (let level = 0; level < shineStone.maxLevel; level += 1) {
    const attempt = getShineAttemptCost(level);
    const { successRate, downgradeRate } = getShineProb(shineStone, level);
    const success = successRate / 100;
    const downgrade = downgradeRate / 100;
    const prev = level > 0 ? steps[level - 1] : { solErda: 0, fragments: 0, meso: 0 };
    steps[level] = success > 0
      ? {
          solErda: (attempt.solErda + downgrade * prev.solErda) / success,
          fragments: (attempt.fragments + downgrade * prev.fragments) / success,
          meso: (attempt.meso + downgrade * prev.meso) / success,
        }
      : { solErda: 0, fragments: 0, meso: 0 };
  }
  return steps;
};

const sumShineCost = (steps, fromLevel, toLevel) => {
  let total = { solErda: 0, fragments: 0, meso: 0 };
  for (let level = fromLevel; level < toLevel; level += 1) {
    if (steps[level]) total = addCost(total, steps[level]);
  }
  return total;
};

// SHINE stones carry no name in the WZ data, so label them by the stats they grant.
const getShineStoneTitle = (shineStone) =>
  shineStone.passives
    .map((group) => {
      const key = Object.keys(group?.[1] || group?.[shineStone.maxLevel] || {})[0];
      return STAT_LABELS[key] || key || "Stat";
    })
    .join(" / ");

const formatShineConditions = (conditions = []) =>
  conditions
    .map((cond) => {
      switch (cond.type) {
        case "stone":
          return `${cond.count}× ${cond.stoneType} stone${cond.count > 1 ? "s" : ""}`;
        case "stonelevel":
          return `${cond.stoneType} stone Lv ${cond.lv}`;
        case "skill":
          return `Skill ${cond.skillId ?? ""} Lv ${cond.lv}`.trim();
        case "level":
          return `Character Lv ${cond.level}`;
        case "endstone":
          return `${cond.count}× end stone`;
        case "all":
          return "All stones activated";
        default:
          return cond.type;
      }
    })
    .join(", ");

const CostPill = ({ label, value, formatValue }) => (
  <div className="rounded-lg border border-primary-dim bg-primary-dark px-3 py-2 text-center min-w-[110px]">
    <div className="flex h-8 items-center justify-center">
      {label === "Sol Erda" && <img src={solErda.src} alt="Sol Erda" className="h-8 w-8" />}
      {label === "Fragments" && <img src={solErdaFragment.src} alt="Sol Erda Fragment" className="h-8 w-8" />}
      {label !== "Sol Erda" && label !== "Fragments" && <span className="text-xs uppercase tracking-wide text-primary-dim">{label}</span>}
    </div>
    <div className="text-lg font-semibold text-primary-bright">
      {formatValue ? formatValue(value) : Math.round(value).toLocaleString()}
    </div>
  </div>
);

// Compact inline cost readout (icons + values on a single row).
const CostInline = ({ cost, usesMeso }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
    {cost.solErda > 0 && (
      <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
        <img src={solErda.src} alt="Sol Erda" className="h-5 w-5" />
        {Math.round(cost.solErda).toLocaleString()}
      </span>
    )}
    <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
      <img src={solErdaFragment.src} alt="Fragments" className="h-5 w-5" />
      {Math.round(cost.fragments).toLocaleString()}
    </span>
    {usesMeso && (
      <span className="text-sm font-semibold text-primary-bright">{Math.round(cost.meso).toLocaleString()} meso</span>
    )}
  </div>
);

// Hoverable chip that reveals the per-level cost breakdown for a stone.
const CostTableTooltip = ({ stone, usesMeso }) => {
  const rows = [];
  let total = { solErda: 0, fragments: 0, meso: 0 };
  for (let level = 0; level < stone.maxLevel; level += 1) {
    const cost = getTransitionCost(stone, level);
    total = addCost(total, cost);
    rows.push({ to: level + 1, cost });
  }

  return (
    <div className="group relative">
      <span className="flex cursor-help items-center gap-1 rounded border border-primary-dim px-2 py-1 text-xs text-primary-dim transition group-hover:border-secondary group-hover:text-secondary">
        Total cost
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold">i</span>
      </span>
      <div className="invisible absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-primary-dim bg-primary-dark p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-dim">Cost per level</div>
        <table className="w-full text-xs text-primary">
          <thead>
            <tr className="text-primary-dim">
              <th className="pb-1 text-left font-medium">Lv</th>
              <th className="pb-1 text-right font-medium">
                <img src={solErda.src} alt="Sol Erda" className="ml-auto h-4 w-4" />
              </th>
              <th className="pb-1 text-right font-medium">
                <img src={solErdaFragment.src} alt="Fragments" className="ml-auto h-4 w-4" />
              </th>
              {usesMeso && <th className="pb-1 text-right font-medium">Meso</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.to} className="border-t border-primary-dim/40">
                <td className="py-1 text-left text-primary-bright">{row.to}</td>
                <td className="py-1 text-right">{row.cost.solErda.toLocaleString()}</td>
                <td className="py-1 text-right">{row.cost.fragments.toLocaleString()}</td>
                {usesMeso && <td className="py-1 text-right">{row.cost.meso.toLocaleString()}</td>}
              </tr>
            ))}
            <tr className="border-t border-primary-dim font-semibold text-primary-bright">
              <td className="py-1 text-left">Total</td>
              <td className="py-1 text-right">{total.solErda.toLocaleString()}</td>
              <td className="py-1 text-right">{total.fragments.toLocaleString()}</td>
              {usesMeso && <td className="py-1 text-right">{total.meso.toLocaleString()}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Hoverable chip revealing the full per-level success / fail / downgrade rates.
const ShineProbTableTooltip = ({ shineStone }) => (
  <div className="group relative">
    <span className="flex cursor-help items-center gap-1 rounded border border-primary-dim px-2 py-1 text-xs text-primary-dim transition group-hover:border-secondary group-hover:text-secondary">
      Rates
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold">i</span>
    </span>
    <div className="invisible absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-primary-dim bg-primary-dark p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-dim">Enforcement rates</div>
      <table className="w-full text-xs text-primary">
        <thead>
          <tr className="text-primary-dim">
            <th className="pb-1 text-left font-medium">Lv</th>
            <th className="pb-1 text-right font-medium">Success</th>
            <th className="pb-1 text-right font-medium">Fail</th>
            <th className="pb-1 text-right font-medium">Down</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: shineStone.maxLevel }, (_, level) => {
            const prob = getShineProb(shineStone, level);
            return (
              <tr key={level} className="border-t border-primary-dim/40">
                <td className="py-1 text-left text-primary-bright">{level} → {level + 1}</td>
                <td className="py-1 text-right text-green-400">{prob.successRate}%</td>
                <td className="py-1 text-right">{prob.failRate}%</td>
                <td className="py-1 text-right text-red-400">{prob.downgradeRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// Hoverable chip revealing the expected (average) cost to clear each level.
const ShineCostTableTooltip = ({ shineStone, steps }) => {
  const total = sumShineCost(steps, 0, shineStone.maxLevel);
  return (
    <div className="group relative">
      <span className="flex cursor-help items-center gap-1 rounded border border-primary-dim px-2 py-1 text-xs text-primary-dim transition group-hover:border-secondary group-hover:text-secondary">
        Avg cost
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold">i</span>
      </span>
      <div className="invisible absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-primary-dim bg-primary-dark p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-dim">Expected cost per level</div>
        <table className="w-full text-xs text-primary">
          <thead>
            <tr className="text-primary-dim">
              <th className="pb-1 text-left font-medium">Lv</th>
              <th className="pb-1 text-right font-medium">
                <img src={solErdaFragment.src} alt="Fragments" className="ml-auto h-4 w-4" />
              </th>
              <th className="pb-1 text-right font-medium">Meso</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, level) => (
              <tr key={level} className="border-t border-primary-dim/40">
                <td className="py-1 text-left text-primary-bright">{level} → {level + 1}</td>
                <td className="py-1 text-right">{Math.round(step.fragments).toLocaleString()}</td>
                <td className="py-1 text-right">{formatMeso(step.meso)}</td>
              </tr>
            ))}
            <tr className="border-t border-primary-dim font-semibold text-primary-bright">
              <td className="py-1 text-left">Total</td>
              <td className="py-1 text-right">{Math.round(total.fragments).toLocaleString()}</td>
              <td className="py-1 text-right">{formatMeso(total.meso)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 text-[10px] text-primary-dim">
          Plus {total.solErda.toLocaleString()} Sol Erda to activate.
        </div>
      </div>
    </div>
  );
};

const ShineCalculator = ({ selectedClass }) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
  const [nodeLevels, setNodeLevels] = useState({});
  const [goalLevels, setGoalLevels] = useState({});
  const [currentDraft, setCurrentDraft] = useState(null);
  const [goalDraft, setGoalDraft] = useState(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const boardViewportRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const character = useMemo(
    () => erdaLinkData.characters.find((entry) => entry.name === selectedClass),
    [selectedClass]
  );
  const stoneMap = useMemo(
    () => new Map(erdaLinkData.stones.filter((s) => s.treeId === character?.treeId).map((s) => [s.id, s])),
    [character],
  );
  // SHINE stone ids repeat across characters with different stats, so scope the
  // lookup to this character's treeId.
  const shineStoneMap = useMemo(
    () => new Map(erdaLinkData.shineStones.filter((stone) => stone.treeId === character?.treeId).map((stone) => [stone.id, stone])),
    [character],
  );

  const regularNodes = useMemo(() => character?.nodes.filter((node) => node.sector !== "SHINE" && node.position) || [], [character]);
  const shineNodes = useMemo(() => character?.nodes.filter((node) => node.sector === "SHINE") || [], [character]);
  const selectedNode = useMemo(
    () => character?.nodes.find((node) => node.nodeIndex === selectedNodeIndex) || regularNodes[0] || null,
    [character, regularNodes, selectedNodeIndex]
  );
  const nodeMap = useMemo(() => new Map(character?.nodes.map((node) => [node.nodeIndex, node]) || []), [character]);
  const defaultNodeLevels = useMemo(() => {
    const defaults = {};
    character?.nodes.forEach((node) => {
      if (isFreeOrigin(stoneMap.get(node.stoneId))) defaults[node.nodeIndex] = 1;
    });
    return defaults;
  }, [character, stoneMap]);
  const normalizeLevels = useCallback((levels = {}, includeDefaults = false) => {
    const normalized = includeDefaults ? { ...defaultNodeLevels, ...levels } : { ...levels };
    character?.nodes.forEach((node) => {
      const stone = stoneMap.get(node.stoneId);
      if (!stone) return;
      const level = clampLevel(normalized[node.nodeIndex] || 0, stone.maxLevel, minLevelFor(stone));
      if (level > 0 || isFreeOrigin(stone)) {
        normalized[node.nodeIndex] = level;
      } else {
        delete normalized[node.nodeIndex];
      }
    });
    return normalized;
  }, [character, defaultNodeLevels, stoneMap]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !selectedClass) return;
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_${selectedClass}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNodeLevels(normalizeLevels(parsed.nodeLevels || {}, true));
      setGoalLevels(normalizeLevels(parsed.goalLevels || {}));
    } else {
      setNodeLevels(defaultNodeLevels);
      setGoalLevels({});
    }
  }, [isClient, selectedClass, defaultNodeLevels, normalizeLevels]);

  useEffect(() => {
    if (!isClient || !selectedClass) return;
    localStorage.setItem(`${STORAGE_PREFIX}_${selectedClass}`, JSON.stringify({ nodeLevels, goalLevels }));
  }, [goalLevels, isClient, nodeLevels, selectedClass]);

  // Reset the in-progress input drafts whenever the selected node changes.
  useEffect(() => {
    setCurrentDraft(null);
    setGoalDraft(null);
  }, [selectedNodeIndex]);

  if (!isClient || !character) {
    return null;
  }

  // `externalLevels` are levels already satisfied elsewhere (e.g. the current
  // build when resolving goal prerequisites) — they count as active but are
  // never charged for again.
  const applyPrerequisiteLevels = (node, levels, externalLevels = {}) => {
    const compareCosts = (a, b) => {
      if (a.solErda !== b.solErda) return a.solErda - b.solErda;
      if (a.fragments !== b.fragments) return a.fragments - b.fragments;
      return a.meso - b.meso;
    };

    const isActive = (workingLevels, nodeIndex) =>
      (workingLevels[nodeIndex] || 0) > 0 || (externalLevels[nodeIndex] || 0) > 0;

    const activateNode = (currentNode, currentLevels, path = new Set()) => {
      if (!currentNode || path.has(currentNode.nodeIndex)) {
        return null;
      }

      const zeroCost = { solErda: 0, fragments: 0, meso: 0 };
      // Already satisfied (by the working set or the current build): nothing to do.
      if (isActive(currentLevels, currentNode.nodeIndex)) {
        return { levels: currentLevels, addedCost: zeroCost };
      }

      const nextPath = new Set(path);
      const nextLevels = { ...currentLevels };
      let addedCost = { ...zeroCost };
      nextPath.add(currentNode.nodeIndex);

      currentNode.prereqAnd.forEach((prereqIndex) => {
        const prereqNode = nodeMap.get(prereqIndex);
        const result = activateNode(prereqNode, nextLevels, nextPath);
        if (!result) return;
        Object.assign(nextLevels, result.levels);
        addedCost = addCost(addedCost, result.addedCost);
      });

      if (currentNode.prereqOr.length > 0 && !currentNode.prereqOr.some((prereqIndex) => isActive(nextLevels, prereqIndex))) {
        const cheapestRoute = currentNode.prereqOr.reduce((cheapest, prereqIndex) => {
          const prereqNode = nodeMap.get(prereqIndex);
          if (!prereqNode) return cheapest;
          const result = activateNode(prereqNode, { ...nextLevels }, nextPath);
          if (!result) return cheapest;
          return !cheapest || compareCosts(result.addedCost, cheapest.addedCost) < 0 ? result : cheapest;
        }, null);

        if (cheapestRoute) {
          Object.assign(nextLevels, cheapestRoute.levels);
          addedCost = addCost(addedCost, cheapestRoute.addedCost);
        }
      }

      const stone = stoneMap.get(currentNode.stoneId);
      nextLevels[currentNode.nodeIndex] = 1;
      addedCost = addCost(addedCost, stone ? calculateCostToLevel(stone, 1) : {});

      return { levels: nextLevels, addedCost };
    };

    const updatedLevels = { ...levels };

    node.prereqAnd.forEach((prereqIndex) => {
      const result = activateNode(nodeMap.get(prereqIndex), { ...updatedLevels });
      if (!result) return;
      Object.assign(updatedLevels, result.levels);
    });

    if (node.prereqOr.length > 0 && !node.prereqOr.some((prereqIndex) => isActive(updatedLevels, prereqIndex))) {
      const cheapestRoute = node.prereqOr.reduce((cheapest, prereqIndex) => {
        const result = activateNode(nodeMap.get(prereqIndex), { ...updatedLevels });
        if (!result) return cheapest;
        return !cheapest || compareCosts(result.addedCost, cheapest.addedCost) < 0 ? result : cheapest;
      }, null);

      if (cheapestRoute) {
        Object.assign(updatedLevels, cheapestRoute.levels);
      }
    }

    return updatedLevels;
  };

  const setNodeLevel = (node, value, setter, shouldApplyPrerequisites = false, externalLevels = {}) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return;
    const level = clampLevel(value, stone.maxLevel, minLevelFor(stone));
    setter((previous) => {
      const updatedLevels = shouldApplyPrerequisites && level > 0 ? applyPrerequisiteLevels(node, previous, externalLevels) : { ...previous };
      if (level > 0 || isFreeOrigin(stone)) {
        updatedLevels[node.nodeIndex] = level;
      } else {
        delete updatedLevels[node.nodeIndex];
      }
      return updatedLevels;
    });
  };

  const adjustCurrentLevel = (node, amount) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return;
    const nextLevel = clampLevel((nodeLevels[node.nodeIndex] || 0) + amount, stone.maxLevel, minLevelFor(stone));
    setNodeLevel(node, nextLevel, setNodeLevels, true);
  };

  const adjustGoalLevel = (node, amount) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return;
    const base = goalLevels[node.nodeIndex] ?? nodeLevels[node.nodeIndex] ?? 0;
    const nextLevel = clampLevel(base + amount, stone.maxLevel, minLevelFor(stone));
    setNodeLevel(node, nextLevel, setGoalLevels, true, nodeLevels);
  };

  // SHINE stones have no positional prerequisites in the tree data (their unlock
  // conditions reference other systems), so leveling them is a plain clamp+set.
  const setShineLevel = (node, value, setter) => {
    const shineStone = shineStoneMap.get(node.stoneId);
    if (!shineStone) return;
    const level = clampLevel(value, shineStone.maxLevel, 0);
    setter((previous) => {
      const updated = { ...previous };
      if (level > 0) updated[node.nodeIndex] = level;
      else delete updated[node.nodeIndex];
      return updated;
    });
  };

  const adjustShineCurrentLevel = (node, amount) => {
    setShineLevel(node, (nodeLevels[node.nodeIndex] || 0) + amount, setNodeLevels);
  };

  const adjustShineGoalLevel = (node, amount) => {
    const base = goalLevels[node.nodeIndex] ?? nodeLevels[node.nodeIndex] ?? 0;
    setShineLevel(node, base + amount, setGoalLevels);
  };

  const handleBoardPointerDown = (event) => {
    if (event.target.closest("button")) return;
    const viewport = boardViewportRef.current;
    if (!viewport) return;
    setIsDraggingBoard(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
  };

  const handleBoardPointerMove = (event) => {
    if (!isDraggingBoard) return;
    const viewport = boardViewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = dragStartRef.current.scrollLeft - (event.clientX - dragStartRef.current.x);
    viewport.scrollTop = dragStartRef.current.scrollTop - (event.clientY - dragStartRef.current.y);
  };

  const handleBoardPointerUp = (event) => {
    const viewport = boardViewportRef.current;
    setIsDraggingBoard(false);
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  const resetBuild = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}_${selectedClass}`);
    setNodeLevels(defaultNodeLevels);
    setGoalLevels({});
  };

  const allNodes = character.nodes;
  const resolvedGoalLevels = allNodes.reduce((resolved, node) => {
    const currentLevel = nodeLevels[node.nodeIndex] || 0;
    const goalLevel = goalLevels[node.nodeIndex] || 0;
    if (goalLevel <= currentLevel) return resolved;
    return applyPrerequisiteLevels(node, { ...resolved, [node.nodeIndex]: goalLevel }, nodeLevels);
  }, {});

  const spentTotal = allNodes.reduce((total, node) => {
    const currentLevel = nodeLevels[node.nodeIndex] || 0;
    if (node.sector === "SHINE") {
      const shineStone = shineStoneMap.get(node.stoneId);
      if (!shineStone) return total;
      return addCost(total, sumShineCost(calcShineStepCosts(shineStone), 0, currentLevel));
    }
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    return addCost(total, calculateCostToLevel(stone, currentLevel));
  }, { solErda: 0, fragments: 0, meso: 0 });

  const remainingTotal = allNodes.reduce((total, node) => {
    const currentLevel = nodeLevels[node.nodeIndex] || 0;
    const goalLevel = Math.max(currentLevel, resolvedGoalLevels[node.nodeIndex] || goalLevels[node.nodeIndex] || 0);
    if (node.sector === "SHINE") {
      const shineStone = shineStoneMap.get(node.stoneId);
      if (!shineStone) return total;
      return addCost(total, sumShineCost(calcShineStepCosts(shineStone), currentLevel, goalLevel));
    }
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    return addCost(total, calculateDeltaCost(stone, currentLevel, goalLevel));
  }, { solErda: 0, fragments: 0, meso: 0 });

  const renderNode = (node) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return null;
    const level = nodeLevels[node.nodeIndex] || 0;
    const activated = level > 0;
    const unlockable = isNodeUnlockable(node, nodeLevels);
    const selected = selectedNode?.nodeIndex === node.nodeIndex;

    return (
      <button
        key={node.nodeIndex}
        type="button"
        onClick={() => setSelectedNodeIndex(node.nodeIndex)}
        className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition ${selected ? "border-secondary shadow-[0_0_18px_var(--secondary)]" : activated ? "border-green-400" : unlockable ? "border-yellow-300" : "border-primary-dim opacity-60"}`}
        style={{ left: node.position.x, top: node.position.y }}
        title={stone.name}
      >
        <img src={getStoneIconPath(stone, character.treeId, !activated)} alt={stone.name} className="h-10 w-10 rounded-full" />
        <span className="absolute -bottom-2 rounded bg-primary-dark px-1 text-[10px] text-primary-bright">
          {level}/{stone.maxLevel}
        </span>
      </button>
    );
  };

  const selectedStone = selectedNode ? stoneMap.get(selectedNode.stoneId) : null;
  const selectedCurrentLevel = selectedNode ? nodeLevels[selectedNode.nodeIndex] || 0 : 0;
  const selectedGoalLevel = selectedNode ? goalLevels[selectedNode.nodeIndex] ?? selectedCurrentLevel : 0;
  const selectedResolvedGoalLevel = selectedNode ? Math.max(selectedCurrentLevel, resolvedGoalLevels[selectedNode.nodeIndex] || selectedGoalLevel) : 0;
  const selectedCurrentCost = selectedStone ? calculateCostToLevel(selectedStone, selectedCurrentLevel) : { solErda: 0, fragments: 0, meso: 0 };
  const selectedGoalCost = selectedStone ? calculateDeltaCost(selectedStone, selectedCurrentLevel, selectedResolvedGoalLevel) : { solErda: 0, fragments: 0, meso: 0 };
  const selectedStoneUsesMeso = selectedStone?.category === "SHINE";
  const selectedStoneMinLevel = selectedStone ? minLevelFor(selectedStone) : 0;
  const selectedAtMaxLevel = selectedStone ? selectedCurrentLevel >= selectedStone.maxLevel : false;
  const selectedNextLevelCost = selectedStone && !selectedAtMaxLevel ? getTransitionCost(selectedStone, selectedCurrentLevel) : null;

  // SHINE stone detail (RNG / expected-cost variant of the panel above).
  const selectedShineStone = selectedNode?.sector === "SHINE" ? shineStoneMap.get(selectedNode.stoneId) : null;
  const shineSteps = selectedShineStone ? calcShineStepCosts(selectedShineStone) : null;
  const shineSpentCost = selectedShineStone ? sumShineCost(shineSteps, 0, selectedCurrentLevel) : null;
  const shineGoalCost = selectedShineStone ? sumShineCost(shineSteps, selectedCurrentLevel, selectedResolvedGoalLevel) : null;
  const shineCurrentStats = selectedShineStone ? getStatsAtLevel(selectedShineStone, selectedCurrentLevel) : {};
  const shineAtMaxLevel = selectedShineStone ? selectedCurrentLevel >= selectedShineStone.maxLevel : false;
  const shineNextLevelCost = selectedShineStone && !shineAtMaxLevel ? shineSteps[selectedCurrentLevel] : null;

  return (
    <div className="flex w-full max-w-[1800px] flex-col gap-6 px-2 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <h2 className="text-[32px] text-primary-bright">{selectedClass} Erda Link Calculator</h2>
          <button
            type="button"
            onClick={resetBuild}
            className="rounded border border-primary-dim bg-primary-dark px-3 py-1 text-sm text-primary transition hover:bg-primary-dim"
          >
            Reset
          </button>
        </div>
        <p className="max-w-3xl text-sm text-primary">
          Click a stone on the board to enter your current level and goal level. Yellow stones are available from current prerequisites, green stones are activated, and dim stones are locked.
        </p>
        <p className="max-w-3xl text-sm text-primary">
        Light Module functionaity is not implemented. I may add it later, but for now, nodes with no requirement aside from being within the Light Module will be unlocked. Sorry!
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-primary-dim bg-background p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">Materials Spent</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <CostPill label="Sol Erda" value={spentTotal.solErda} />
            <CostPill label="Fragments" value={spentTotal.fragments} />
            {spentTotal.meso > 0 && <CostPill label="Meso" value={spentTotal.meso} formatValue={formatMeso} />}
          </div>
        </div>
        <div className="rounded-xl border border-primary-dim bg-background p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">Remaining to Goal</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <CostPill label="Sol Erda" value={remainingTotal.solErda} />
            <CostPill label="Fragments" value={remainingTotal.fragments} />
            {remainingTotal.meso > 0 && <CostPill label="Meso" value={remainingTotal.meso} formatValue={formatMeso} />}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-primary-dim bg-primary-dark/40 p-3">
          <div
            ref={boardViewportRef}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
            onPointerCancel={handleBoardPointerUp}
            className={`overflow-hidden rounded-xl border border-primary-dim bg-primary-dark/40 p-3 ${isDraggingBoard ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <div className="relative min-w-[1800px]" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
              <img src="/erda-link/erdalink-background.png" alt="Erda Link board" className="absolute inset-0 h-full w-full select-none" draggable="false" />
              {regularNodes.map(renderNode)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {selectedStone && selectedNode && (
            <div className="rounded-xl border border-primary-dim bg-background p-4">
              <div className="mb-4 flex items-center gap-3">
                <img src={getStoneIconPath(selectedStone, character.treeId, selectedCurrentLevel === 0)} alt={selectedStone.name} className="h-12 w-12" />
                <div>
                  <h3 className="text-lg font-semibold text-primary-bright">{selectedStone.name}</h3>
                  <img src={getStoneLabelPath(selectedStone)} alt={selectedStone.category} className="mt-1 h-5 w-auto" />
                </div>
              </div>
              <p className="mb-4 text-sm text-primary">{parseDesc(selectedStone.desc)}</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-primary">
                  Current Level
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustCurrentLevel(selectedNode, -1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={selectedStoneMinLevel}
                      max={selectedStone.maxLevel}
                      value={currentDraft ?? String(selectedCurrentLevel)}
                      onChange={(event) => {
                        setCurrentDraft(event.target.value);
                        if (event.target.value !== "") setNodeLevel(selectedNode, event.target.value, setNodeLevels, true);
                      }}
                      onBlur={() => {
                        if (currentDraft !== null) setNodeLevel(selectedNode, currentDraft, setNodeLevels, true);
                        setCurrentDraft(null);
                      }}
                      className="w-full rounded border border-primary-dim bg-primary-dark p-2 text-center text-primary-bright"
                    />
                    <button
                      type="button"
                      onClick={() => adjustCurrentLevel(selectedNode, 1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      +
                    </button>
                  </div>
                </label>
                <label className="text-sm text-primary">
                  Goal Level
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustGoalLevel(selectedNode, -1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={selectedStoneMinLevel}
                      max={selectedStone.maxLevel}
                      value={goalDraft ?? String(selectedGoalLevel)}
                      onChange={(event) => {
                        setGoalDraft(event.target.value);
                        if (event.target.value !== "") setNodeLevel(selectedNode, event.target.value, setGoalLevels, true, nodeLevels);
                      }}
                      onBlur={() => {
                        if (goalDraft !== null) setNodeLevel(selectedNode, goalDraft, setGoalLevels, true, nodeLevels);
                        setGoalDraft(null);
                      }}
                      className="w-full rounded border border-primary-dim bg-primary-dark p-2 text-center text-primary-bright"
                    />
                    <button
                      type="button"
                      onClick={() => adjustGoalLevel(selectedNode, 1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>
              <div className="mt-4 rounded-lg border border-primary-dim bg-primary-dark/40 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-primary-bright">
                    {selectedAtMaxLevel
                      ? "Max level reached"
                      : `Next level (Lv ${selectedCurrentLevel} → ${selectedCurrentLevel + 1})`}
                  </span>
                  <CostTableTooltip stone={selectedStone} usesMeso={selectedStoneUsesMeso} />
                </div>
                {selectedNextLevelCost && (
                  <div className="mt-2">
                    <CostInline cost={selectedNextLevelCost} usesMeso={selectedStoneUsesMeso} />
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-3">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Spent on this stone</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={selectedCurrentCost.solErda} />
                    <CostPill label="Fragments" value={selectedCurrentCost.fragments} />
                    {selectedStoneUsesMeso && <CostPill label="Meso" value={selectedCurrentCost.meso} />}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Remaining for this goal</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={selectedGoalCost.solErda} />
                    <CostPill label="Fragments" value={selectedGoalCost.fragments} />
                    {selectedStoneUsesMeso && <CostPill label="Meso" value={selectedGoalCost.meso} />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedShineStone && selectedNode && (
            <div className="rounded-xl border border-primary-dim bg-background p-4">
              <div className="mb-3 flex items-center gap-3">
                <img src={getStoneLabelPath({ category: "SHINE" })} alt="Shine" className="h-5 w-auto" />
                <h3 className="text-lg font-semibold text-primary-bright">{getShineStoneTitle(selectedShineStone)}</h3>
              </div>
              {selectedShineStone.conditions.length > 0 && (
                <p className="mb-2 text-xs text-primary-dim">Unlock: {formatShineConditions(selectedShineStone.conditions)}</p>
              )}
              <p className="mb-4 text-xs text-primary-dim">
                Enforcement is RNG — costs shown are the <span className="text-primary">expected (average)</span> materials.
              </p>

              <div className="mb-4 grid gap-1 rounded-lg border border-primary-dim bg-primary-dark/40 p-3">
                {selectedShineStone.passives.map((group, index) => {
                  const key = Object.keys(group?.[1] || {})[0];
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-primary">{STAT_LABELS[key] || key}</span>
                      <span className="font-semibold text-primary-bright">{formatStatValue(key, shineCurrentStats[key] || 0)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-primary">
                  Current Level
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustShineCurrentLevel(selectedNode, -1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={selectedShineStone.maxLevel}
                      value={currentDraft ?? String(selectedCurrentLevel)}
                      onChange={(event) => {
                        setCurrentDraft(event.target.value);
                        if (event.target.value !== "") setShineLevel(selectedNode, event.target.value, setNodeLevels);
                      }}
                      onBlur={() => {
                        if (currentDraft !== null) setShineLevel(selectedNode, currentDraft, setNodeLevels);
                        setCurrentDraft(null);
                      }}
                      className="w-full rounded border border-primary-dim bg-primary-dark p-2 text-center text-primary-bright"
                    />
                    <button
                      type="button"
                      onClick={() => adjustShineCurrentLevel(selectedNode, 1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      +
                    </button>
                  </div>
                </label>
                <label className="text-sm text-primary">
                  Goal Level
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustShineGoalLevel(selectedNode, -1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={selectedShineStone.maxLevel}
                      value={goalDraft ?? String(selectedGoalLevel)}
                      onChange={(event) => {
                        setGoalDraft(event.target.value);
                        if (event.target.value !== "") setShineLevel(selectedNode, event.target.value, setGoalLevels);
                      }}
                      onBlur={() => {
                        if (goalDraft !== null) setShineLevel(selectedNode, goalDraft, setGoalLevels);
                        setGoalDraft(null);
                      }}
                      className="w-full rounded border border-primary-dim bg-primary-dark p-2 text-center text-primary-bright"
                    />
                    <button
                      type="button"
                      onClick={() => adjustShineGoalLevel(selectedNode, 1)}
                      className="h-10 w-10 rounded border border-primary-dim bg-primary-dark text-xl text-primary-bright transition hover:bg-primary-dim"
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-4 rounded-lg border border-primary-dim bg-primary-dark/40 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-primary-bright">
                    {shineAtMaxLevel
                      ? "Max level reached"
                      : `Next level (Lv ${selectedCurrentLevel} → ${selectedCurrentLevel + 1})`}
                  </span>
                  <div className="flex gap-2">
                    <ShineProbTableTooltip shineStone={selectedShineStone} />
                    <ShineCostTableTooltip shineStone={selectedShineStone} steps={shineSteps} />
                  </div>
                </div>
                {shineNextLevelCost && (
                  <div className="mt-2 flex items-center gap-3">
                    <CostInline cost={shineNextLevelCost} usesMeso />
                    <span className="text-xs text-primary-dim">
                      @ {getShineProb(selectedShineStone, selectedCurrentLevel).successRate}% success
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Expected spent</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={shineSpentCost.solErda} />
                    <CostPill label="Fragments" value={shineSpentCost.fragments} />
                    <CostPill label="Meso" value={shineSpentCost.meso} formatValue={formatMeso} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Expected remaining for goal</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={shineGoalCost.solErda} />
                    <CostPill label="Fragments" value={shineGoalCost.fragments} />
                    <CostPill label="Meso" value={shineGoalCost.meso} formatValue={formatMeso} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-primary-dim bg-background p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary-bright">SHINE Stones</h3>
            <div className="grid gap-3">
              {shineNodes.map((node) => {
                const shineStone = shineStoneMap.get(node.stoneId);
                const level = nodeLevels[node.nodeIndex] || 0;
                const selected = selectedNode?.nodeIndex === node.nodeIndex;
                if (!shineStone) {
                  return (
                    <div
                      key={node.nodeIndex}
                      className="rounded-lg border border-primary-dim bg-primary-dark/30 p-3 text-sm text-primary-dim"
                    >
                      Not yet available — check back later.
                    </div>
                  );
                }
                const nextProb = shineStone.enforceProbs?.[level];
                return (
                  <button
                    key={node.nodeIndex}
                    type="button"
                    onClick={() => setSelectedNodeIndex(node.nodeIndex)}
                    className={`rounded-lg border p-3 text-left transition ${selected ? "border-secondary bg-primary-dark" : level > 0 ? "border-green-400/60 bg-primary-dark/60 hover:bg-primary-dark" : "border-primary-dim bg-primary-dark/60 hover:bg-primary-dark"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-primary-bright">{getShineStoneTitle(shineStone)}</span>
                      <span className="text-xs text-primary">{level}/{shineStone.maxLevel}</span>
                    </div>
                    {level < shineStone.maxLevel && nextProb && (
                      <div className="mt-1 text-xs text-primary-dim">Next: {nextProb.successRate}% success</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SHINE_CLASSES };
export default ShineCalculator;
