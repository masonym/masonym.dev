"use client";

import React, { useMemo, useState } from "react";
import {
  addCost,
  clampLevel,
  getNodeGroups,
  getNodeStatus,
  ZERO_COST,
} from "./hexaNodes";
import { CostSummary } from "./Cost";
import NodeTile from "./NodeTile";
import NodeDetails from "./NodeDetails";

// Both are saved as { [node.key]: { level, type } }.
const currentKey = (classKey) => `skillLevels_${classKey}`;
const goalKey = (classKey) => `desiredSkillLevels_${classKey}`;

const readLevels = (storageKey) => {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : {};
};

const toSaved = (node, level) => ({
  level,
  // Origin nodes have always been saved as plain skill nodes.
  type: node.type === "origin" ? "skill" : node.type,
});

const GRID_COLUMNS = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const HeaderButton = ({ children, ...props }) => (
  <button
    type="button"
    className="rounded border border-primary-dim bg-primary-dark px-3 py-1 text-sm text-primary transition hover:bg-primary-dim hover:text-primary-bright"
    {...props}
  >
    {children}
  </button>
);

// Mounted with key={classKey}, and only on the client (ClassSelector renders
// nothing until it is hydrated), so saved levels are read into initial state.
const HexaSkillCalculator = ({ classKey, classDetails }) => {
  const [currentLevels, setCurrentLevels] = useState(() =>
    readLevels(currentKey(classKey)),
  );
  const [goalLevels, setGoalLevels] = useState(() =>
    readLevels(goalKey(classKey)),
  );
  const [expandedKey, setExpandedKey] = useState(null);

  const groups = useMemo(
    () => getNodeGroups(classKey, classDetails),
    [classKey, classDetails],
  );
  const nodes = groups.flatMap((group) => group.nodes);

  const saveCurrent = (levels) => {
    setCurrentLevels(levels);
    localStorage.setItem(currentKey(classKey), JSON.stringify(levels));
  };

  const saveGoals = (levels) => {
    setGoalLevels(levels);
    localStorage.setItem(goalKey(classKey), JSON.stringify(levels));
  };

  const setCurrent = (node, level) =>
    saveCurrent({ ...currentLevels, [node.key]: toSaved(node, level) });

  const setGoal = (node, level) => {
    const updated = { ...goalLevels };
    if (level > 0) updated[node.key] = toSaved(node, level);
    else delete updated[node.key];
    saveGoals(updated);
  };

  const maxAllGoals = () =>
    saveGoals(
      Object.fromEntries(
        nodes.map((node) => [node.key, toSaved(node, node.maxLevel)]),
      ),
    );

  const resetCurrentLevels = () => {
    localStorage.removeItem(currentKey(classKey));
    setCurrentLevels({});
  };

  const resetGoalLevels = () => {
    localStorage.removeItem(goalKey(classKey));
    setGoalLevels({});
  };

  const statuses = new Map(
    nodes.map((node) => [
      node.key,
      getNodeStatus(
        node,
        clampLevel(currentLevels[node.key]?.level, node.maxLevel, node.minLevel),
        clampLevel(goalLevels[node.key]?.level, node.maxLevel),
      ),
    ]),
  );
  const sum = (field) =>
    nodes.reduce(
      (total, node) => addCost(total, statuses.get(node.key)[field]),
      ZERO_COST,
    );

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 px-2 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-[32px] leading-tight text-primary-bright">{classKey}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <HeaderButton onClick={maxAllGoals} title="Set every goal level to its max">
            Max All Goals
          </HeaderButton>
          <HeaderButton onClick={resetCurrentLevels}>
            Reset Current Levels
          </HeaderButton>
          <HeaderButton onClick={resetGoalLevels}>
            Reset Goal Levels
          </HeaderButton>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <CostSummary title="Materials Spent" cost={sum("spent")} />
        <CostSummary title="Remaining to Goal" cost={sum("remaining")} />
      </div>

      {groups.map((group) => {
        const expandedNode = group.nodes.find((node) => node.key === expandedKey);
        return (
          <section key={group.id}>
            <h3 className="mb-2 text-left text-sm font-semibold text-primary">
              {group.label}
            </h3>
            <div className={`grid grid-cols-1 gap-3 ${GRID_COLUMNS[group.nodes.length] ?? GRID_COLUMNS[4]}`}>
              {group.nodes.map((node) => (
                <NodeTile
                  key={node.key}
                  node={node}
                  classKey={classKey}
                  color={group.color}
                  status={statuses.get(node.key)}
                  expanded={node.key === expandedKey}
                  onToggle={() =>
                    setExpandedKey(node.key === expandedKey ? null : node.key)
                  }
                  onCurrentChange={(level) => setCurrent(node, level)}
                  onGoalChange={(level) => setGoal(node, level)}
                />
              ))}
            </div>
            {expandedNode && (
              <NodeDetails
                node={expandedNode}
                status={statuses.get(expandedNode.key)}
              />
            )}
          </section>
        );
      })}
    </div>
  );
};

export default HexaSkillCalculator;
