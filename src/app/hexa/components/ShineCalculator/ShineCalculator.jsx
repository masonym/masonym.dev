"use client";

import React, { useEffect, useMemo, useState } from "react";
import erdaLinkData from "@/data/erda-link-data.json";

const SHINE_CLASSES = new Set(["Sia Astelle"]);
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1080;
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

const clampLevel = (value, maxLevel) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(maxLevel, parsed));
};

const getStoneIconPath = (stone, disabled = false) => {
  const file = disabled ? "iconDisabled.png" : "icon.png";
  return `/erda-link/stones/${stone.category}/${stone.id}/${file}`;
};

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

const formatStats = (stats) => {
  const entries = Object.entries(stats || {}).filter(([, value]) => value !== 0);
  if (entries.length === 0) return "No passive stats";
  return entries.map(([key, value]) => `${STAT_LABELS[key] || key}: ${value}`).join(", ");
};

const getTransitionCost = (stone, fromLevel) => {
  const costType = stone.costType || "default";
  if (fromLevel === 0) {
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
    <div className="text-xs uppercase tracking-wide text-primary-dim">{label}</div>
    <div className="text-lg font-semibold text-primary-bright">{value.toLocaleString()}</div>
  </div>
);

const ShineCalculator = ({ selectedClass }) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
  const [nodeLevels, setNodeLevels] = useState({});
  const [goalLevels, setGoalLevels] = useState({});

  const stoneMap = useMemo(() => new Map(erdaLinkData.stones.map((stone) => [stone.id, stone])), []);
  const shineStoneMap = useMemo(() => new Map(erdaLinkData.shineStones.map((stone) => [stone.id, stone])), []);
  const character = useMemo(
    () => erdaLinkData.characters.find((entry) => entry.name === selectedClass),
    [selectedClass]
  );

  const regularNodes = useMemo(() => character?.nodes.filter((node) => node.sector !== "SHINE" && node.position) || [], [character]);
  const shineNodes = useMemo(() => character?.nodes.filter((node) => node.sector === "SHINE") || [], [character]);
  const selectedNode = useMemo(
    () => character?.nodes.find((node) => node.nodeIndex === selectedNodeIndex) || regularNodes[0] || null,
    [character, regularNodes, selectedNodeIndex]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !selectedClass) return;
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_${selectedClass}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNodeLevels(parsed.nodeLevels || {});
      setGoalLevels(parsed.goalLevels || {});
    } else {
      setNodeLevels({});
      setGoalLevels({});
    }
  }, [isClient, selectedClass]);

  useEffect(() => {
    if (!isClient || !selectedClass) return;
    localStorage.setItem(`${STORAGE_PREFIX}_${selectedClass}`, JSON.stringify({ nodeLevels, goalLevels }));
  }, [goalLevels, isClient, nodeLevels, selectedClass]);

  if (!isClient || !character) {
    return null;
  }

  const setNodeLevel = (node, value, setter) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return;
    setter((previous) => ({
      ...previous,
      [node.nodeIndex]: clampLevel(value, stone.maxLevel),
    }));
  };

  const resetBuild = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}_${selectedClass}`);
    setNodeLevels({});
    setGoalLevels({});
  };

  const allNodes = character.nodes;
  const spentTotal = allNodes.reduce((total, node) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    return addCost(total, calculateCostToLevel(stone, nodeLevels[node.nodeIndex] || 0));
  }, { solErda: 0, fragments: 0, meso: 0 });

  const remainingTotal = allNodes.reduce((total, node) => {
    const stone = stoneMap.get(node.stoneId);
    if (!stone) return total;
    const currentLevel = nodeLevels[node.nodeIndex] || 0;
    const goalLevel = Math.max(currentLevel, goalLevels[node.nodeIndex] || 0);
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
        <img src={getStoneIconPath(stone, !activated)} alt={stone.name} className="h-10 w-10 rounded-full" />
        <span className="absolute -bottom-2 rounded bg-primary-dark px-1 text-[10px] text-primary-bright">
          {level}/{stone.maxLevel}
        </span>
      </button>
    );
  };

  const selectedStone = selectedNode ? stoneMap.get(selectedNode.stoneId) : null;
  const selectedCurrentLevel = selectedNode ? nodeLevels[selectedNode.nodeIndex] || 0 : 0;
  const selectedGoalLevel = selectedNode ? goalLevels[selectedNode.nodeIndex] || 0 : 0;
  const selectedCurrentCost = selectedStone ? calculateCostToLevel(selectedStone, selectedCurrentLevel) : { solErda: 0, fragments: 0, meso: 0 };
  const selectedGoalCost = selectedStone ? calculateDeltaCost(selectedStone, selectedCurrentLevel, Math.max(selectedCurrentLevel, selectedGoalLevel)) : { solErda: 0, fragments: 0, meso: 0 };

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
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-primary-dim bg-background p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">Materials Spent</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <CostPill label="Sol Erda" value={spentTotal.solErda} />
            <CostPill label="Fragments" value={spentTotal.fragments} />
            <CostPill label="Meso" value={spentTotal.meso} />
          </div>
        </div>
        <div className="rounded-xl border border-primary-dim bg-background p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-primary-bright">Remaining to Goals</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <CostPill label="Sol Erda" value={remainingTotal.solErda} />
            <CostPill label="Fragments" value={remainingTotal.fragments} />
            <CostPill label="Meso" value={remainingTotal.meso} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-auto rounded-xl border border-primary-dim bg-primary-dark/40 p-3">
          <div className="relative min-w-[1600px]" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <img src="/erda-link/erdalink-background.png" alt="Erda Link board" className="absolute inset-0 h-full w-full select-none" draggable="false" />
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
              {regularNodes.map((node) => {
                const parents = [...node.prereqAnd, ...node.prereqOr];
                if (parents.length === 0) {
                  return (
                    <line key={`${node.nodeIndex}-sp`} x1={character.spPosition.x} y1={character.spPosition.y} x2={node.position.x} y2={node.position.y} stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                  );
                }
                return parents.map((parentIndex) => {
                  const parent = regularNodes.find((entry) => entry.nodeIndex === parentIndex);
                  if (!parent?.position) return null;
                  return <line key={`${node.nodeIndex}-${parentIndex}`} x1={parent.position.x} y1={parent.position.y} x2={node.position.x} y2={node.position.y} stroke="rgba(255,255,255,0.25)" strokeWidth="3" />;
                });
              })}
            </svg>
            {regularNodes.map(renderNode)}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {selectedStone && selectedNode && (
            <div className="rounded-xl border border-primary-dim bg-background p-4">
              <div className="mb-4 flex items-center gap-3">
                <img src={getStoneIconPath(selectedStone, selectedCurrentLevel === 0)} alt={selectedStone.name} className="h-12 w-12" />
                <div>
                  <h3 className="text-lg font-semibold text-primary-bright">{selectedStone.name}</h3>
                  <p className="text-xs uppercase text-primary-dim">{selectedStone.category}</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-primary">{selectedStone.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-primary">
                  Current Level
                  <input
                    type="number"
                    min="0"
                    max={selectedStone.maxLevel}
                    value={selectedCurrentLevel}
                    onChange={(event) => setNodeLevel(selectedNode, event.target.value, setNodeLevels)}
                    className="mt-1 w-full rounded border border-primary-dim bg-primary-dark p-2 text-primary-bright"
                  />
                </label>
                <label className="text-sm text-primary">
                  Goal Level
                  <input
                    type="number"
                    min="0"
                    max={selectedStone.maxLevel}
                    value={selectedGoalLevel}
                    onChange={(event) => setNodeLevel(selectedNode, event.target.value, setGoalLevels)}
                    className="mt-1 w-full rounded border border-primary-dim bg-primary-dark p-2 text-primary-bright"
                  />
                </label>
              </div>
              <div className="mt-4 space-y-2 text-sm text-primary">
                <div><span className="font-semibold text-primary-bright">Current stats:</span> {formatStats(getStatsAtLevel(selectedStone, selectedCurrentLevel))}</div>
                <div><span className="font-semibold text-primary-bright">Goal stats:</span> {formatStats(getStatsAtLevel(selectedStone, Math.max(selectedCurrentLevel, selectedGoalLevel)))}</div>
              </div>
              <div className="mt-4 grid gap-3">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Spent on this stone</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={selectedCurrentCost.solErda} />
                    <CostPill label="Fragments" value={selectedCurrentCost.fragments} />
                    <CostPill label="Meso" value={selectedCurrentCost.meso} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary-bright">Remaining for this goal</h4>
                  <div className="flex flex-wrap gap-2">
                    <CostPill label="Sol Erda" value={selectedGoalCost.solErda} />
                    <CostPill label="Fragments" value={selectedGoalCost.fragments} />
                    <CostPill label="Meso" value={selectedGoalCost.meso} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-primary-dim bg-background p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary-bright">SHINE Stones</h3>
            <div className="grid gap-3">
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
                      <img src={getStoneIconPath(stone, level === 0)} alt={stone.name} className="h-10 w-10" />
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
