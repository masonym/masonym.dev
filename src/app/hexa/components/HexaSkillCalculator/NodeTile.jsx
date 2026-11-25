"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getCommonSkillImagePath, getSkillImagePath } from "../../utils";
import { clampLevel, getProgressColor } from "./hexaNodes";
import { CostInline } from "./Cost";

// Keeps what is being typed in a draft, so the field can be emptied mid-edit
// without the clamped level being forced back into it.
const LevelInput = ({ label, ariaLabel, value, placeholder, min, max, onChange }) => {
  const [draft, setDraft] = useState(null);

  const step = (amount) => {
    setDraft(null);
    onChange(clampLevel((Number.parseInt(value, 10) || 0) + amount, max, min));
  };

  return (
    <label className="flex flex-col items-center gap-1 text-xs text-primary">
      {label}
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={draft ?? value}
        placeholder={placeholder}
        onFocus={(event) => event.target.select()}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          const level = clampLevel(digits, max, min);
          setDraft(digits === "" ? "" : String(level));
          onChange(level);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          step(event.key === "ArrowUp" ? 1 : -1);
        }}
        onBlur={() => setDraft(null)}
        className="w-14 rounded border border-primary-dim bg-background p-1.5 text-center text-lg text-primary-bright placeholder:text-primary-dim focus:border-secondary focus:outline-none"
      />
    </label>
  );
};

const NodeIcon = ({ node, classKey }) => {
  // Not every class has its own art for the job branch skill.
  const [broken, setBroken] = useState(false);
  const src =
    node.type === "jobBranch" && broken
      ? getCommonSkillImagePath(node.key)
      : getSkillImagePath(classKey, node.key, node.type === "common");
  return (
    <Image
      src={src}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 flex-shrink-0"
      onError={() => setBroken(true)}
    />
  );
};

const StatusLine = ({ status }) => {
  if (status.maxed) {
    return <span className="text-sm font-semibold text-primary-bright">Maxed</span>;
  }
  if (status.reached) {
    return <span className="text-sm font-semibold text-primary-bright">Goal reached</span>;
  }
  if (status.goal === 0) {
    return <span className="text-sm text-primary">No goal set</span>;
  }
  return <CostInline cost={status.remaining} />;
};

const NodeTile = ({
  node,
  classKey,
  color,
  status,
  expanded,
  onToggle,
  onCurrentChange,
  onGoalChange,
}) => {
  const name = node.names[0];
  const barWidth =
    status.maxed || status.reached
      ? 100
      : status.goal > 0
        ? status.progress
        : 0;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border bg-primary-dark transition-colors ${expanded ? "border-secondary" : "border-primary-dim"}`}
    >
      <div
        className="flex flex-1 items-center gap-3 px-3 py-2"
        style={{ backgroundColor: color }}
      >
        <NodeIcon node={node} classKey={classKey} />
        <div className="min-w-0 text-left text-sm leading-tight text-primary-bright">
          {node.names.map((skill) => (
            <div key={skill}>{skill}</div>
          ))}
        </div>
      </div>

      <div className="h-1.5 bg-background-bright">
        <div
          className={`h-full transition-all duration-500 ease-in-out ${getProgressColor(barWidth)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-end justify-center gap-3 px-3 pt-3">
        <LevelInput
          label="Current"
          ariaLabel={`${name} current level`}
          value={String(status.current)}
          min={node.minLevel}
          max={node.maxLevel}
          onChange={onCurrentChange}
        />
        <span aria-hidden="true" className="pb-2 text-primary">
          →
        </span>
        <LevelInput
          label="Goal"
          ariaLabel={`${name} goal level`}
          value={status.goal > 0 ? String(status.goal) : ""}
          placeholder="–"
          min={0}
          max={node.maxLevel}
          onChange={onGoalChange}
        />
      </div>

      <div className="flex min-h-[44px] items-center justify-between gap-2 px-3 py-2">
        <StatusLine status={status} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${name} cost details`}
          title="Cost details"
          className="ml-auto flex-shrink-0 rounded p-1 text-primary transition-colors hover:bg-background-bright"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};

export default NodeTile;
