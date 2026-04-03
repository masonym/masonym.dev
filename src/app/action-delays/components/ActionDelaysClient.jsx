'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import skillsData from '@/data/skill-delays/skills.json';
import {
  CLASS_CATEGORIES,
  CATEGORY_ORDER,
  JOB_CODES,
  FIFTH_JOB_CATEGORIES,
  FIFTH_JOB_SKILL_OVERRIDES,
  FILTERED_BEGINNER_ACTIONS,
  JOB_CODE_NAMES,
  getJobTier,
  JOB_TIER_LABELS,
} from '@/data/skill-delays/classCategories';

// compute scaled delay for a given attack speed stage
function computeScaledDelay(frames, stage) {
  const scale = (20 - stage) / 16;
  let total = 0;
  for (const frame of frames) {
    total += Math.max(30, Math.abs(frame) * scale);
  }
  return Math.ceil(total / 30) * 30;
}

// compute theoretical delay WITHOUT the 30ms floor (what it "should" be)
function computeTheoreticalDelay(frames, stage) {
  const scale = (20 - stage) / 16;
  let total = 0;
  for (const frame of frames) {
    total += Math.abs(frame) * scale;
  }
  return Math.ceil(total / 30) * 30;
}

// compute per-frame scaled values for a given stage
function computeScaledFrames(frames, stage) {
  const scale = (20 - stage) / 16;
  return frames.map(frame => {
    const scaled = Math.abs(frame) * scale;
    const actual = Math.max(30, scaled);
    const hitsFloor = scaled < 30;
    return {
      original: frame,
      scaled: scaled,
      actual: actual,
      hitsFloor: hitsFloor,
      penalty: hitsFloor ? 30 - scaled : 0,
    };
  });
}

// check if a frame hits the 30ms floor at a given stage
function frameHitsFloor(frame, stage) {
  const scale = (20 - stage) / 16;
  return Math.abs(frame) * scale < 30;
}

// get base delay (sum of frames at stage 6)
function getBaseDelay(frames) {
  return frames.reduce((a, b) => a + Math.abs(b), 0);
}

// get floor penalty amount at a given stage
function getFloorPenalty(frames, stage) {
  const actual = computeScaledDelay(frames, stage);
  const theoretical = computeTheoreticalDelay(frames, stage);
  return actual - theoretical;
}

// preamble component with placeholder content
function Preamble() {
  return (
    <div className="bg-primary-dark rounded-xl border border-primary-dim/30 p-6 mb-8">
      <h2 className="text-2xl font-bold text-primary-bright mb-4">About Attack Speed & Action Delays</h2>
      <div className="text-primary space-y-4">
        <p>
          [PLACEHOLDER: Explain how attack speed works in MapleStory here. Include information about
          attack speed stages, the scaling formula, and how the 30ms floor affects different skills.]
        </p>
        <p>
          [PLACEHOLDER: Add attributions and sources here.]
        </p>
        <div className="bg-background-dim rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold text-secondary mb-2">Key Concepts</h3>
          <ul className="list-disc list-inside space-y-1 text-primary-dim">
            <li>[PLACEHOLDER: Attack Speed Stages (0-10)]</li>
            <li>[PLACEHOLDER: Scaling Formula: scale = (20 - stage) / 16]</li>
            <li>[PLACEHOLDER: 30ms Floor Penalty]</li>
            <li>[PLACEHOLDER: Why some skills benefit less from attack speed]</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// skill card component
function SkillCard({ skill }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const baseDelay = getBaseDelay(skill.frames);
  const fastestDelay = computeScaledDelay(skill.frames, 10);
  const theoreticalFastest = computeTheoreticalDelay(skill.frames, 10);
  const delayReduction = baseDelay - fastestDelay;
  const reductionPercent = ((delayReduction / baseDelay) * 100).toFixed(1);

  // count frames that hit the floor at stage 10
  const floorHits = skill.frames.filter(f => frameHitsFloor(f, 10)).length;
  const hasFloorPenalty = floorHits > 0;
  const floorPenaltyAmount = fastestDelay - theoreticalFastest;

  return (
    <motion.div
      layout
      className="bg-primary-dark rounded-lg border border-primary-dim/30 hover:border-secondary/50 transition-all duration-200"
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={`/skill-delays/${skill.icon}`}
              alt={skill.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-primary-bright font-bold truncate">{skill.name}</h4>
            <p className="text-primary-dim text-sm truncate">{skill.action}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-primary-bright font-bold">{baseDelay}ms</div>
            <div className="text-sm">
              {hasFloorPenalty ? (
                <span className="text-yellow-400" title={`Should be ${theoreticalFastest}ms without floor penalty (+${floorPenaltyAmount}ms)`}>
                  → {fastestDelay}ms <span className="text-primary-dim text-xs">({theoreticalFastest}ms)</span> ⚠
                </span>
              ) : (
                <span className="text-green-400">→ {fastestDelay}ms</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-primary-dim/20 pt-3">
              {/* frames breakdown at base */}
              <div className="mb-3">
                <h5 className="text-sm font-bold text-primary-dim mb-2">Base Frames (AS4)</h5>
                <div className="flex flex-wrap gap-1">
                  {skill.frames.map((frame, idx) => {
                    const hitsFloor = frameHitsFloor(frame, 10);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          hitsFloor
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-background-dim text-primary'
                        }`}
                        title={hitsFloor ? 'Hits 30ms floor at AS0' : ''}
                      >
                        {frame}ms
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* delay at different stages - clickable */}
              <div className="mb-3">
                <h5 className="text-sm font-bold text-primary-dim mb-2">Delay by Attack Speed <span className="font-normal">(click to see frame breakdown)</span></h5>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                  {[6, 7, 8, 9, 10].map(stage => {
                    const delay = computeScaledDelay(skill.frames, stage);
                    const theoretical = computeTheoreticalDelay(skill.frames, stage);
                    const penalty = delay - theoretical;
                    const asValue = 10 - stage;
                    const isSelected = selectedStage === stage;
                    const hasPenalty = penalty > 0;
                    
                    return (
                      <button
                        key={stage}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStage(isSelected ? null : stage);
                        }}
                        className={`rounded p-2 text-center transition-all ${
                          isSelected
                            ? 'bg-secondary/20 border-2 border-secondary'
                            : 'bg-background-dim hover:bg-background-bright border-2 border-transparent'
                        }`}
                      >
                        <div className="text-primary-dim">AS {asValue}</div>
                        <div className={`font-bold ${hasPenalty ? 'text-yellow-400' : 'text-primary-bright'}`}>
                          {delay}ms
                        </div>
                        {hasPenalty && (
                          <div className="text-primary-dim text-[10px]">({theoretical}ms)</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* selected stage frame breakdown */}
              <AnimatePresence>
                {selectedStage !== null && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="bg-background-dim rounded-lg p-3">
                      <h5 className="text-sm font-bold text-secondary mb-2">
                        Frame Breakdown at AS {10 - selectedStage}
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-primary-dim">
                              <th className="text-left py-1 px-2">#</th>
                              <th className="text-right py-1 px-2">Original</th>
                              <th className="text-right py-1 px-2">Scaled</th>
                              <th className="text-right py-1 px-2">Actual</th>
                              <th className="text-right py-1 px-2">Penalty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {computeScaledFrames(skill.frames, selectedStage).map((frame, idx) => (
                              <tr
                                key={idx}
                                className={frame.hitsFloor ? 'text-yellow-400' : 'text-primary'}
                              >
                                <td className="py-1 px-2">{idx + 1}</td>
                                <td className="text-right py-1 px-2 font-mono">{frame.original}ms</td>
                                <td className="text-right py-1 px-2 font-mono">{frame.scaled.toFixed(1)}ms</td>
                                <td className="text-right py-1 px-2 font-mono font-bold">{frame.actual.toFixed(0)}ms</td>
                                <td className="text-right py-1 px-2 font-mono">
                                  {frame.hitsFloor ? `+${frame.penalty.toFixed(1)}ms` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t border-primary-dim/30">
                            <tr className="text-primary-bright font-bold">
                              <td className="py-1 px-2">Total</td>
                              <td className="text-right py-1 px-2 font-mono">{baseDelay}ms</td>
                              <td className="text-right py-1 px-2 font-mono">
                                {computeScaledFrames(skill.frames, selectedStage)
                                  .reduce((sum, f) => sum + f.scaled, 0)
                                  .toFixed(1)}ms
                              </td>
                              <td className="text-right py-1 px-2 font-mono">
                                {computeScaledFrames(skill.frames, selectedStage)
                                  .reduce((sum, f) => sum + f.actual, 0)
                                  .toFixed(0)}ms
                              </td>
                              <td className="text-right py-1 px-2 font-mono text-yellow-400">
                                {(() => {
                                  const totalPenalty = computeScaledFrames(skill.frames, selectedStage)
                                    .reduce((sum, f) => sum + f.penalty, 0);
                                  return totalPenalty > 0 ? `+${totalPenalty.toFixed(1)}ms` : '-';
                                })()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* summary stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-primary-dim">Reduction: </span>
                  <span className="text-green-400 font-bold">{delayReduction}ms ({reductionPercent}%)</span>
                </div>
                {hasFloorPenalty && (
                  <div>
                    <span className="text-primary-dim">Floor penalty at AS0: </span>
                    <span className="text-yellow-400 font-bold">+{floorPenaltyAmount}ms ({floorHits}/{skill.frames.length} frames)</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// job tab component for skills within a class
function JobTabs({ skills, className }) {
  const [activeTab, setActiveTab] = useState(null);

  // group skills by job tier, filtering out unwanted beginner actions
  const skillsByTier = useMemo(() => {
    const tiers = {};
    
    skills.forEach(skill => {
      const tier = getJobTier(skill.jobCode, className);
      if (tier !== null && tier !== undefined) {
        // filter out unwanted beginner skills by action code
        if (tier === 0 && FILTERED_BEGINNER_ACTIONS.includes(skill.action)) {
          return;
        }
        if (!tiers[tier]) tiers[tier] = [];
        tiers[tier].push(skill);
      }
    });

    return tiers;
  }, [skills, className]);

  const availableTiers = Object.keys(skillsByTier).map(Number).sort((a, b) => a - b);

  // set initial active tab
  React.useEffect(() => {
    if (availableTiers.length > 0 && activeTab === null) {
      setActiveTab(availableTiers[0]);
    }
  }, [availableTiers, activeTab]);

  if (availableTiers.length === 0) {
    return <div className="text-primary-dim">No skills found</div>;
  }

  return (
    <div>
      {/* tier tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTiers.map(tier => (
          <button
            key={tier}
            onClick={() => setActiveTab(tier)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tier
                ? 'bg-secondary text-background'
                : 'bg-background-dim text-primary-dim hover:text-primary-bright'
            }`}
          >
            {JOB_TIER_LABELS[tier] || `Job ${tier}`}
          </button>
        ))}
      </div>

      {/* skills for active tier */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(skillsByTier[activeTab] || []).map(skill => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}

// class accordion component
function ClassAccordion({ className, skills }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-background-dim rounded-xl border border-primary-dim/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary-dark/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary-bright">{className}</span>
          <span className="text-sm text-primary-dim">({skills.length} skills)</span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-primary-dim"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-primary-dim/20">
              <JobTabs skills={skills} className={className} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// category section component
function CategorySection({ category, classes }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-4 group"
      >
        <h2 className="text-2xl font-bold text-secondary">{category}</h2>
        <motion.span
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-secondary opacity-50 group-hover:opacity-100"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {Object.entries(classes).map(([className, skills]) => (
              <ClassAccordion key={className} className={className} skills={skills} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ActionDelaysClient() {
  const [searchQuery, setSearchQuery] = useState('');

  // organize skills by category -> class -> skills
  const organizedData = useMemo(() => {
    const result = {};

    // initialize categories
    CATEGORY_ORDER.forEach(cat => {
      result[cat] = {};
    });

    // helper to check if skill matches search
    const matchesSearch = (skill) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        skill.name.toLowerCase().includes(query) ||
        skill.action.toLowerCase().includes(query) ||
        skill.id.includes(query)
      );
    };

    // helper to add skill to a class
    const addSkillToClass = (className, skill) => {
      const category = CLASS_CATEGORIES[className];
      if (!category) return;
      
      if (!result[category][className]) {
        result[category][className] = [];
      }
      
      if (matchesSearch(skill)) {
        result[category][className].push(skill);
      }
    };

    // collect beginner skills (jobCode 0) to distribute to Explorer classes
    const beginnerSkills = [];

    // process each job from the JSON
    skillsData.jobs.forEach(job => {
      const category = CLASS_CATEGORIES[job.name];
      
      // add skills, filtering by search if needed
      job.skills.forEach(skill => {
        // check if this skill has a 5th job override to a different class
        const overrideClass = FIFTH_JOB_SKILL_OVERRIDES[skill.id];
        if (overrideClass && overrideClass !== job.name) {
          // add to the override class instead, with jobCode set to 5th job
          const overriddenSkill = { ...skill, jobCode: 40001, _overrideClass: overrideClass };
          addSkillToClass(overrideClass, overriddenSkill);
        } else if (skill.jobCode === 0) {
          // collect beginner skills to distribute later
          beginnerSkills.push(skill);
        } else if (category) {
          // add to the original class
          if (!result[category][job.name]) {
            result[category][job.name] = [];
          }
          if (matchesSearch(skill)) {
            result[category][job.name].push(skill);
          }
        }
      });
    });

    // distribute beginner skills to all classes that have jobCode 0 in their JOB_CODES
    beginnerSkills.forEach(skill => {
      Object.entries(JOB_CODES).forEach(([className, codes]) => {
        if (codes.includes(0)) {
          addSkillToClass(className, skill);
        }
      });
    });

    // remove empty classes and categories
    Object.keys(result).forEach(cat => {
      Object.keys(result[cat]).forEach(cls => {
        if (result[cat][cls].length === 0) {
          delete result[cat][cls];
        }
      });
      if (Object.keys(result[cat]).length === 0) {
        delete result[cat];
      }
    });

    return result;
  }, [searchQuery]);

  const totalSkills = useMemo(() => {
    return skillsData.jobs.reduce((sum, job) => sum + job.skills.length, 0);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-bright mb-2">Action Delays</h1>
        <p className="text-primary-dim">
          Skill delay data for {totalSkills} skills across all classes
        </p>
      </div>

      <Preamble />

      {/* search bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search skills by name, action, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-primary-dark border border-primary-dim/30 text-primary-bright placeholder-primary-dim focus:outline-none focus:border-secondary transition-colors"
        />
      </div>

      {/* categories */}
      {CATEGORY_ORDER.map(category => {
        if (!organizedData[category]) return null;
        return (
          <CategorySection
            key={category}
            category={category}
            classes={organizedData[category]}
          />
        );
      })}

      {Object.keys(organizedData).length === 0 && (
        <div className="text-center text-primary-dim py-12">
          No skills found matching your search.
        </div>
      )}
    </div>
  );
}
