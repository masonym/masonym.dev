"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";
import { ChangedDot, DiffText } from "./Changes";
import { BRANCHES, JOB_BRANCHES } from "@/data/jobBranches";

const GRADES = [1, 2, 3, 4, 5];

// button labels for the classes whose full name is too long for one
const SHORT_NAMES = { 212: "F/P Arch Mage", 222: "I/L Arch Mage" };

// Skill text carries {{token}} placeholders for the values that differ per class.
function fillText(text, values) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values?.[key] ?? "...");
}

// `badge` names the skill's group (its grade, or Hologram) on the row itself, so a row found
// with the browser's find says where it belongs without scrolling up to the heading
function SkillRow({ skill, values, valuesBefore, badge }) {
  const current = values?.[skill.id];
  const text = skill.text && fillText(skill.text, current);
  // old text: the old template filled with the old per-class numbers (falling back to the current ones)
  const textBefore =
    skill.before && skill.text
      ? fillText(skill.before.text ?? skill.text, {
          ...current,
          ...valuesBefore?.[skill.id],
        })
      : null;
  return (
    <li className="relative flex gap-3 p-3 pl-5">
      <ChangedDot entry={skill} at="row" />
      <Icon src={skill.icon} alt={skill.name} />
      <div className="min-w-0">
        <p className="font-semibold text-primary-bright">
          <DiffText before={skill.before?.name} after={skill.name} />
          {badge && (
            <span className="ml-2 align-middle whitespace-nowrap rounded border border-primary/20 px-1.5 py-0.5 text-xs font-normal text-primary-dim">
              {badge}
            </span>
          )}
        </p>
        {text && (
          <p className="whitespace-pre-line">
            <DiffText before={textBefore} after={text} />
          </p>
        )}
        {skill.desc && (
          <p className="text-sm italic text-primary-dim mt-1 whitespace-pre-line">
            <DiffText before={skill.before?.desc} after={skill.desc} />
          </p>
        )}
      </div>
    </li>
  );
}

function SkillList({ skills, values, valuesBefore, badge }) {
  return (
    <ul className="divide-y divide-primary/10 rounded-lg border border-primary/15">
      {skills.map((s) => (
        <SkillRow
          key={s.id}
          skill={s}
          values={values}
          valuesBefore={valuesBefore}
          badge={badge}
        />
      ))}
    </ul>
  );
}

const pill =
  "px-3 py-1 rounded-full border text-sm transition-colors whitespace-nowrap";
const pillIdle =
  "border-primary/20 text-primary hover:text-primary-bright hover:border-primary-bright/40";
const pillOn = "border-secondary text-primary-bright bg-secondary/15";

// Every class as a button, one row per branch. A class missing from JOB_BRANCHES (a new one)
// lands in "Other" rather than disappearing.
function ClassPicker({ jobs, selected, onSelect }) {
  const rows = [
    ...BRANCHES.map((b) => [b, jobs.filter((j) => JOB_BRANCHES[j.id]?.includes(b))]),
    ["Other", jobs.filter((j) => !JOB_BRANCHES[j.id])],
  ].filter(([, list]) => list.length);
  return (
    <div
      role="group"
      aria-label="Class"
      className="rounded-lg border border-primary/15 divide-y divide-primary/10"
    >
      {rows.map(([branch, list]) => (
        <div
          key={branch}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3"
        >
          <span className="sm:w-20 shrink-0 sm:pt-1.5 text-xs uppercase tracking-wider text-primary-dim">
            {branch}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {list.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => onSelect(j.id)}
                aria-pressed={j.id === selected}
                title={SHORT_NAMES[j.id] ? j.name : undefined}
                className={`${pill} ${j.id === selected ? pillOn : pillIdle}`}
              >
                {SHORT_NAMES[j.id] ?? j.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ClassSkills({ jobs, dimensionSkills, hologram }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allValues, setAllValues] = useState(null);

  const param = searchParams.get("class");
  const job = jobs.some((j) => j.id === param) ? param : jobs[0].id;

  useEffect(() => {
    fetch("/quanah/skill-values.json")
      .then((r) => r.json())
      .then(setAllValues)
      .catch(() => setAllValues({}));
  }, []);

  // { skillId: { token: value } } for the selected class, now and before the latest update
  const forJob = (byId) =>
    byId &&
    Object.fromEntries(
      Object.entries(byId).map(([id, byJob]) => [id, byJob[job]]),
    );
  const values = forJob(allValues?.values);
  const valuesBefore = forJob(allValues?.before);

  const selectJob = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("class", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <ClassPicker jobs={jobs} selected={job} onSelect={selectJob} />

      <h3 className="text-xl font-semibold text-primary-bright pt-4">
        Dimensional Skills
      </h3>
      {GRADES.map((grade) => (
        <div key={grade}>
          <h4 className="font-semibold text-primary-bright mt-4 mb-2">
            Grade {grade}
          </h4>
          <SkillList
            skills={dimensionSkills.filter((s) => s.grade === grade)}
            values={values}
            valuesBefore={valuesBefore}
            badge={`Grade ${grade}`}
          />
        </div>
      ))}

      <h3 className="text-xl font-semibold text-primary-bright pt-6">
        Hologram Skills
      </h3>
      <p className="text-sm text-primary-dim">
        Equipment skills, listed here because they use the same per-class damage
        table.
      </p>
      <SkillList
        skills={hologram}
        values={values}
        valuesBefore={valuesBefore}
        badge="Hologram"
      />
    </div>
  );
}
