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
  madX: "Magic ATT",
  damR: "Damage",
  bdR: "Boss Damage",
  incCrDam: "Critical Damage",
  ignoreMobpdpR: "Ignore DEF",
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

const CostPill = ({ label, value }) => (
  <div className="rounded-lg border border-primary-dim bg-primary-dark px-3 py-2 text-center min-w-[110px]">
    <div className="flex h-8 items-center justify-center">
      {label === "Sol Erda" && <img src={solErda.src} alt="Sol Erda" className="h-8 w-8" />}
      {label === "Fragments" && <img src={solErdaFragment.src} alt="Sol Erda Fragment" className="h-8 w-8" />}
      {label !== "Sol Erda" && label !== "Fragments" && <span className="text-xs uppercase tracking-wide text-primary-dim">{label}</span>}
    </div>
    <div className="text-lg font-semibold text-primary-bright">{value.toLocaleString()}</div>
  </div>
);

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
  const shineStoneMap = useMemo(() => new Map(erdaLinkData.shineStones.map((stone) => [stone.id, stone])), []);

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
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    return addCost(total, calculateCostToLevel(stone, nodeLevels[node.nodeIndex] || 0));
  }, { solErda: 0, fragments: 0, meso: 0 });

  const remainingTotal = allNodes.reduce((total, node) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    const currentLevel = nodeLevels[node.nodeIndex] || 0;
    const goalLevel = Math.max(currentLevel, resolvedGoalLevels[node.nodeIndex] || goalLevels[node.nodeIndex] || 0);
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
  const selectedStoneHasGoalLevels = selectedStone?.maxLevel > 1;
  const selectedStoneMinLevel = selectedStone ? minLevelFor(selectedStone) : 0;

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
            {/* <CostPill label="Meso" value={spentTotal.meso} /> */}
          </div>
        </div>
        <div className="rounded-xl border border-primary-dim bg-background p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">Remaining to Goal</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <CostPill label="Sol Erda" value={remainingTotal.solErda} />
            <CostPill label="Fragments" value={remainingTotal.fragments} />
            {/* <CostPill label="Meso" value={remainingTotal.meso} /> */}
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
              <div className={`grid gap-3 ${selectedStoneHasGoalLevels ? "grid-cols-2" : "grid-cols-1"}`}>
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
                {selectedStoneHasGoalLevels && (
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
                {selectedStoneHasGoalLevels && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-primary-bright">Remaining for this goal</h4>
                    <div className="flex flex-wrap gap-2">
                      <CostPill label="Sol Erda" value={selectedGoalCost.solErda} />
                      <CostPill label="Fragments" value={selectedGoalCost.fragments} />
                      {selectedStoneUsesMeso && <CostPill label="Meso" value={selectedGoalCost.meso} />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-primary-dim bg-background p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary-bright">SHINE Stones</h3>
            <div className="grid gap-3">
              <p className="text-sm text-primary">Not yet developed :) Check back later.</p>
              {shineNodes.map((node) => {
                const stone = stoneMap.get(node.stoneId);
                const shineStone = shineStoneMap.get(node.stoneId);
                if (!stone) return null;
                const level = nodeLevels[node.nodeIndex] || 0;
                const probability = shineStone?.enforceProbs?.[level];
                return (
                  <button
                    key={node.nodeIndex}
                    type="button"
                    onClick={() => setSelectedNodeIndex(node.nodeIndex)}
                    className={`rounded-lg border p-3 text-left transition ${selectedNode?.nodeIndex === node.nodeIndex ? "border-secondary bg-primary-dark" : "border-primary-dim bg-primary-dark/60 hover:bg-primary-dark"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={getStoneIconPath(stone, character.treeId, level === 0)} alt={stone.name} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-primary-bright">{stone.name}</div>
                        <div className="text-xs text-primary">Level {level}/{stone.maxLevel}</div>
                      </div>
                    </div>
                    {probability && (
                      <div className="mt-2 text-xs text-primary-dim">
                        Next: {probability.successRate}% success, {probability.failRate}% fail, {probability.downgradeRate}% downgrade
                      </div>
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
