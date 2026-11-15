"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";

const GRADES = [1, 2, 3, 4, 5];

// Skill text carries {{token}} placeholders for the values that differ per class.
function fillText(text, values) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values?.[key] ?? "...");
}

function SkillRow({ skill, values }) {
  return (
    <li className="flex gap-3 p-3">
      <Icon src={skill.icon} alt={skill.name} />
      <div className="min-w-0">
        <p className="font-semibold text-primary-bright">{skill.name}</p>
        {skill.text && (
          <p className="whitespace-pre-line">{fillText(skill.text, values?.[skill.id])}</p>
        )}
        {skill.desc && (
          <p className="text-sm italic text-primary-dim mt-1 whitespace-pre-line">{skill.desc}</p>
        )}
      </div>
    </li>
  );
}

function SkillList({ skills, values }) {
  return (
    <ul className="divide-y divide-primary/10 rounded-lg border border-primary/15">
      {skills.map((s) => (
        <SkillRow key={s.id} skill={s} values={values} />
      ))}
    </ul>
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

  // { skillId: { token: value } } for the selected class
  const values =
    allValues &&
    Object.fromEntries(Object.entries(allValues).map(([id, byJob]) => [id, byJob[job]]));

  const selectJob = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("class", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3">
        <span className="text-primary-dim">Class</span>
        <select
          value={job}
          onChange={(e) => selectJob(e.target.value)}
          className="bg-background-bright text-primary border border-primary/20 rounded px-3 py-1.5"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </label>

      {GRADES.map((grade) => (
        <div key={grade}>
          <h3 className="text-lg font-semibold text-primary-bright mt-6 mb-2">Grade {grade}</h3>
          <SkillList skills={dimensionSkills.filter((s) => s.grade === grade)} values={values} />
        </div>
      ))}

      <h3 className="text-lg font-semibold text-primary-bright mt-8 mb-2">Hologram Skills</h3>
      <p className="text-sm text-primary-dim">
        Equipment skills, listed here because they use the same per-class damage table.
      </p>
      <SkillList skills={hologram} values={values} />
    </div>
  );
}
