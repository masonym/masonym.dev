'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import skillsDataV267 from '@/data/skill-delays/skills.json';
import skillsDataV266 from '@/data/skill-delays/v266-skills.json';
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

const SPOTLIGHT_STORAGE_KEY = 'action-delays-version-toggle-seen';

// spotlight overlay for first-time visitors
function VersionToggleSpotlight({ onDismiss }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
      onClick={onDismiss}
    >
      {/* dark overlay with cutout for the toggle */}
      <div className="absolute inset-0 bg-black/80" />

      {/* spotlight area - positioned to match the fixed toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* glowing ring around the toggle area */}
        <div className="absolute -inset-3 rounded-xl border-2 border-secondary animate-pulse" />
        <div className="absolute -inset-3 rounded-xl bg-secondary/20" />
      </div>

      {/* explanatory tooltip */}
      <div className="fixed bottom-24 right-4 z-50 max-w-xs">
        <div className="bg-background border border-secondary rounded-lg p-4 shadow-xl">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-primary-bright font-bold">Version Toggle</h3>
          </div>
          <p className="text-primary text-sm mb-3">
            You can switch between v266 and v267 to compare skill delay data before and after the big balance patch.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary text-xs">Press <kbd className="bg-primary-dark px-1.5 py-0.5 rounded text-primary-bright">Esc</kbd> or click anywhere to dismiss</span>
          </div>
        </div>
        {/* arrow pointing down to the toggle */}
        <div className="flex justify-end pr-8 -mt-1">
          <svg className="w-6 h-12 text-secondary" viewBox="0 0 24 48" fill="none">
            <path d="M12 0 L12 40 M6 34 L12 42 L18 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

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

// preamble component explaining attack speed mechanics
function Preamble() {
  return (
    <div className="bg-primary-dark rounded-xl border border-primary-dim/30 p-6 mb-8">
      <h2 className="text-2xl font-bold text-primary-bright mb-4">About Attack Speed & Action Delays</h2>
      <div className="text-primary space-y-4">
        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">Purpose</h3>
          <p className="mb-2">
            The purpose of this page is two-fold:
          </p>
          <ul className="list-disc list-inside space-y-1 text-primary">
            <li>
              Highlight the overall issue of attack speed rounding.
            </li>
            <li>
              Create a place for people to view the action delays of their skills, without the requirement of looking at Wz files.
            </li>
          </ul>
          <p className="mb-2">
            Generally, this page will not be "actively maintained". If there a balance patch that reduces skill delays across the board similar to v.267 I will hopefully add those values as a new data source, but that's about it.
          </p>
        </div>
        <p>
          Every skill in MapleStory has an <strong className="text-primary-bright">action delay</strong> - the time you must wait after using a skill before you can act again.
          This delay is determined by the skill's animation frames and your current attack speed.
        </p>

        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">Attack Speed: Two Naming Conventions</h3>
          <p className="mb-2">
            Attack Speed often uses two opposite naming conventions, which can be confusing:
          </p>
          <ul className="list-disc list-inside space-y-1 text-primary">
            <li><strong className="text-primary-bright">Stage 1-10:</strong> The in-game wording. Stage 10 is the <em>fastest</em>.</li>
            <li><strong className="text-primary-bright">AS0-AS9:</strong> Historical player convention. AS0 is the <em>fastest</em> (AS = 10 - Stage).</li>
          </ul>
          <p className="mt-2 text-primary text-sm">
            This page uses both: "Stage" for calculations, "AS" for display. Stage 10 = AS0 = fastest possible.
          </p>
        </div>

        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">The Scaling Formula</h3>
          <p className="mb-2">
            When you use a skill, each animation frame is scaled by your attack speed:
          </p>
          <div className="bg-background rounded-lg p-3 font-mono text-sm text-center mb-2">
            <span className="text-secondary">scaled frame</span> = frame × <span className="text-secondary">(20 - stage)</span> / 16
          </div>
          <p className="text-primary text-sm">
            At Stage 4 (AS6, the "base" speed), the multiplier is exactly 1.0. For this reason, Stage 4 (AS6) is considered the "base" speed.
          </p>
        </div>

        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">The 30ms Frame Rule/Penalty</h3>
          <p className="mb-2">
            Each individual frame has a <strong className="text-secondary">minimum duration of 30ms</strong>.
            If a scaled frame would be less than 30ms, it gets rounded up to 30ms.
          </p>
          <p className="mb-2">
            As a result of the multiplier at Stage 10 attack speed, this means <strong className="text-secondary">any skill </strong> with a 30ms frame as its <em>last</em> frame will benefit less from attack speed than skills without, even if their total delays are identical.
          </p>
          <div className="bg-background rounded-lg p-3 text-sm mb-2">
            <p className="text-primary mb-1"><strong className="text-primary-bright">Example:</strong></p>
            <p className="text-primary">
              Skill A: 11 frames of 60ms each = 660ms total<br />
              Skill B: 10 frames of 60ms each and two frames of 30ms = 660ms total
            </p>
            <p className="text-primary mt-2">
              At AS0: Skill A → (660 * 0.625) = 412.5ms *<br />
              At AS0: Skill B → (660 * 0.625) = 412.5ms, but the (30 * 0.625) = 18.75ms frames are rounded to 30ms, resulting in a final attack speed of (600ms * 0.625) + (30ms + 30ms) = 435ms. **
            </p>
            <p className="text-primary mt-2 text-xs">
              * This 412.5ms gets rounded up to 420ms. More on that up next.
              <br />
              * This 435ms gets rounded up to 450ms. More on that up next.
            </p>
          </div>
          <p className="mb-2">
            Furthermore, the total sum of any skill's frames is rounded up to the <strong className="text-secondary">nearest multiple of 30ms</strong>.
          </p>
          <p className="mb-2">
            This means that despite the final values only being (412.5ms vs 435ms), the total delay is rounded up to 420ms and 450ms respectively, turning a 22.5ms difference into a 30ms difference.
          </p>
          <p className="mb-2">
            This difference can be amplified in other cases.
          </p>
          <div className="bg-background rounded-lg p-3 text-sm mb-2">
            <p className="text-primary mb-1"><strong className="text-primary-bright">Example:</strong></p>
            <p className="text-primary">
              Skill C: 420ms total delay at AS0<br />
              Skill D: 423.75ms total delay at AS0
            </p>
            <p className="text-primary mt-2">
              Skill D will be rounded to 450ms, turning a 3.75ms difference into a 30ms difference.
            </p>
          </div>
          <p className="mb-2">
            This can cause a small loss in attack speed for 1 frame to compound into a larger one, but it also means that having <em>more than one 30ms frame</em> does not compound the loss until a certain point.
          </p>
          <p className="mt-2 text-sm">
            In other words, having more than one 30ms frame does not compound the loss until the total delay reaches the next multiple of 30ms.
          </p>
        </div>

        <div className="bg-background-dim rounded-lg p-4 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-secondary mb-2">Updated Assumption: Last Frame Only</h3>
          <p className="mb-2">
            The initial version of this page lacked the following assumption: This page operates under the assumption that the 30ms floor penalty <strong className="text-secondary">only applies when the last frame</strong> of a skill's animation is 30ms.
          </p>
          <p className="mb-2">
            Skills with 30ms frames earlier in the animation (but not as the final frame) do not appear to suffer from this penalty in practice.
          </p>
          <p className="text-primary text-sm">
            <strong className="text-primary-bright">Note:</strong> This is currently an assumption based on in-game testing and observation, not confirmed game code. The behavior appears consistent with this model, but may not be 100% accurate.
          </p>
        </div>

        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">When and Why This Matters</h3>
          <ul className="list-disc list-inside space-y-2 text-primary">
            <li>
              <strong className="text-primary-bright">Increased prevalence in v.267.</strong> As a result of the recent balance changes, many more classes have a 30ms frame in their main attacking skill than before. This issue has always existed, but was less common. One longstanding example is Kaiser's Gigas Wave.
            </li>
            <li>
              <strong className="text-primary-bright">The gains of attack speed are deceptively different between classes.</strong> As explained previously, two skills with the same base delay can have very different attack speed gains depending on how many 30ms frames they have.
            </li>
            <li>
              <strong className="text-primary-bright">Unintentional balance differences.</strong> This is an unintended side-effect of the rounding system that is generally not present as Stage 8 (AS2). If this issue affects your class' main attacking skill, you're getting 7% fewer hits than a class with the same base delay but no 30ms frames.
            </li>
            <li>
              Obviously, the existence of Stage 10 Attack Speed has been an unfair balance issue for many years, since it does not benefit hurricane classes. Given that KMS does not consider these effects when balancing, our version is even more out of balance.
              <p className="text-primary text-sm ml-4 mt-2">
                (not that nexon cares)
              </p>
            </li>
            <li>
              <strong className="text-primary-bright">Where it matters less:</strong> While every class has at least one skill affected by this issue, the effect is not as impactful on skills that are not cast as often.
            </li>
          </ul>
        </div>

        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">Reading the Skill Cards</h3>
          <ul className="list-disc list-inside space-y-1 text-primary">
            <li><strong className="text-primary-bright">Base delay:</strong> Total frame duration at Stage 6 (AS4)</li>
            <li><strong className="text-primary-bright">→ Fastest delay:</strong> Total at Stage 10 (AS0). Yellow ⚠ indicates floor penalty.</li>
            <li><strong className="text-secondary">Yellow frames:</strong> These hit the 30ms floor at AS0</li>
            <li><strong className="text-primary-bright">Parenthetical value:</strong> What the delay <em>would</em> be without the floor</li>
            <li>You can click on a stage to see the individual frame delays at that stage</li>
          </ul>
        </div>

        {/* attributions section */}
        <div className="bg-background-dim rounded-lg p-4">
          <h3 className="text-lg font-bold text-secondary mb-2">References & Attributions</h3>
          <ul className="list-disc list-inside space-y-2 text-primary mb-2">
            <li>
              <a href="https://www.reddit.com/r/Maplestory/comments/u0ix7v/bug_or_feature_transformed_kaiser_attacks_slower/" target="_blank" rel="noopener noreferrer" className="text-primary-bright underline">
                Reddit post by /u/screeeeeeee investigating the attack speed-to-delay discrepancy in Gigas Wave (2022)
              </a>
            </li>
            <li>
              <a href="https://www.reddit.com/r/Maplestory/comments/u0ix7v/bug_or_feature_transformed_kaiser_attacks_slower/i46paj0/?context=3" target="_blank" rel="noopener noreferrer" className="text-primary-bright underline">
                Comment by /u/hailcrest in the above thread explaining the 30ms floor effect
              </a>
            </li>
            <li>
              <a href="https://forums.maplestory.nexon.net/discussion/35795/certain-skills-not-working-properly-with-as10#latest" target="_blank" rel="noopener noreferrer" className="text-primary-bright underline">
                Nexon forum post about skills not working properly with AS10
              </a>
            </li>
            <li>
              Credits to Jaepy for asking me to look into this in the first place - this was fun to investigate and compile :)
            </li>
          </ul>
        </div>

        <p className="text-primary text-sm">
          If you notice any errors or have suggestions for improvement, please let me know!
        </p>
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
  // penalty only applies if the LAST frame hits the 30ms floor
  const lastFrame = skill.frames[skill.frames.length - 1];
  const hasFloorPenalty = frameHitsFloor(lastFrame, 10);
  const floorPenaltyAmount = fastestDelay - theoreticalFastest;

  return (
    <motion.div
      layout
      className="bg-primary-dark rounded-lg border border-primary-dim/30 hover:border-secondary/50 transition-all duration-200 max-w-[90%] sm:max-w-[100%]"
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
            <p className="text-primary text-sm truncate">{skill.action}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-primary-bright font-bold">{baseDelay}ms</div>
            <div className="text-sm">
              {hasFloorPenalty ? (
                <span className="text-secondary" title={`Should be ${theoreticalFastest}ms without floor penalty (+${floorPenaltyAmount}ms)`}>
                  → {fastestDelay}ms <span className="text-primary text-xs">({theoreticalFastest}ms)</span> ⚠
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
                <h5 className="text-sm font-bold text-primary mb-2">Base Frames (AS4)</h5>
                <div className="flex flex-wrap gap-1">
                  {skill.frames.map((frame, idx) => {
                    const isLastFrame = idx === skill.frames.length - 1;
                    const hitsFloor = frameHitsFloor(frame, 10);
                    const showPenalty = isLastFrame && hitsFloor;
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-mono ${showPenalty
                          ? 'bg-yellow-500/20 text-secondary border border-yellow-500/30'
                          : 'bg-background-dim text-primary'
                          }`}
                        title={showPenalty ? 'Last frame hits 30ms floor at AS0' : ''}
                      >
                        {frame}ms
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* delay at different stages - clickable */}
              <div className="mb-3">
                <h5 className="text-sm font-bold text-primary mb-2">Delay by Attack Speed <span className="font-normal">(click to see frame breakdown)</span></h5>
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
                        className={`rounded p-2 text-center transition-all ${isSelected
                          ? 'bg-secondary/20 border-2 border-secondary'
                          : 'bg-background-dim hover:bg-background-bright border-2 border-transparent'
                          }`}
                      >
                        <div className="text-primary">AS {asValue}</div>
                        <div className={`font-bold ${hasPenalty ? 'text-secondary' : 'text-primary-bright'}`}>
                          {delay}ms
                        </div>
                        {hasPenalty && (
                          <div className="text-primary text-[10px]">({theoretical}ms)</div>
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
                            <tr className="text-primary">
                              <th className="text-left py-1 px-2">#</th>
                              <th className="text-right py-1 px-2">Original</th>
                              <th className="text-right py-1 px-2">Scaled</th>
                              <th className="text-right py-1 px-2">Actual</th>
                              <th className="text-right py-1 px-2">Penalty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {computeScaledFrames(skill.frames, selectedStage).map((frame, idx, arr) => {
                              const isLastFrame = idx === arr.length - 1;
                              const showPenalty = isLastFrame && frame.hitsFloor;
                              return (
                                <tr
                                  key={idx}
                                  className={showPenalty ? 'text-secondary' : 'text-primary'}
                                >
                                  <td className="py-1 px-2">{idx + 1}</td>
                                  <td className="text-right py-1 px-2 font-mono">{frame.original}ms</td>
                                  <td className="text-right py-1 px-2 font-mono">{frame.scaled.toFixed(2)}ms</td>
                                  <td className="text-right py-1 px-2 font-mono font-bold">{frame.actual.toFixed(2)}ms</td>
                                  <td className="text-right py-1 px-2 font-mono">
                                    {showPenalty ? `+${frame.penalty.toFixed(2)}ms` : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="border-t border-primary-dim/30">
                            <tr className="text-primary-bright font-bold">
                              <td className="py-1 px-2">Total</td>
                              <td className="text-right py-1 px-2 font-mono">{baseDelay}ms</td>
                              <td className="text-right py-1 px-2 font-mono">
                                {computeScaledFrames(skill.frames, selectedStage)
                                  .reduce((sum, f) => sum + f.scaled, 0)
                                  .toFixed(2)}ms
                              </td>
                              <td className="text-right py-1 px-2 font-mono">
                                {computeScaledFrames(skill.frames, selectedStage)
                                  .reduce((sum, f) => sum + f.actual, 0)
                                  .toFixed(2)}ms
                              </td>
                              <td className="text-right py-1 px-2 font-mono text-secondary">
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
                  <span className="text-primary">Reduction: </span>
                  <span className="text-green-400 font-bold">{delayReduction}ms ({reductionPercent}%)</span>
                </div>
                {hasFloorPenalty && (
                  <div>
                    <span className="text-primary">Floor penalty at AS0: </span>
                    <span className="text-secondary font-bold">+{floorPenaltyAmount}ms ({floorHits}/{skill.frames.length} frames)</span>
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
      setActiveTab(availableTiers[availableTiers.length - 1]);
    }
  }, [availableTiers, activeTab]);

  if (availableTiers.length === 0) {
    return <div className="text-primary">No skills found</div>;
  }

  return (
    <div>
      {/* tier tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTiers.map(tier => (
          <button
            key={tier}
            onClick={() => setActiveTab(tier)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === tier
              ? 'bg-secondary text-background'
              : 'bg-background-dim text-primary hover:text-primary-bright'
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
          <span className="text-sm text-primary">({skills.length} skills)</span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-primary"
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

// affected skills section - shows all skills with 30ms last-frame penalty
function AffectedSkillsSection({ skills }) {
  const [collapsed, setCollapsed] = useState(true);

  if (skills.length === 0) return null;

  return (
    <div className="mb-8 bg-background-dim rounded-xl border border-yellow-500/30 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary-dark/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-secondary">Skills Affected by 30ms Last-Frame Penalty</span>
          <span className="text-sm text-primary">({skills.length} skills)</span>
        </div>
        <motion.span
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-secondary"
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
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-yellow-500/30">
              <p className="text-primary text-sm mb-4">
                These skills have a 30ms frame as their last animation frame, causing them to benefit less from attack speed at AS0.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map(skill => (
                  <SkillCard key={`${skill.className}-${skill.id}`} skill={skill} />
                ))}
              </div>
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
  const [version, setVersion] = useState('v267');
  const [showSpotlight, setShowSpotlight] = useState(false);

  // check localStorage on mount to see if user has seen the spotlight
  useEffect(() => {
    const hasSeen = localStorage.getItem(SPOTLIGHT_STORAGE_KEY);
    if (!hasSeen) {
      setShowSpotlight(true);
    }
  }, []);

  const dismissSpotlight = () => {
    setShowSpotlight(false);
    localStorage.setItem(SPOTLIGHT_STORAGE_KEY, 'true');
  };

  const skillsData = version === 'v267' ? skillsDataV267 : skillsDataV266;

  // organize skills by category -> class -> skills
  const organizedData = useMemo(() => {
    const result = {};

    // initialize categories
    CATEGORY_ORDER.forEach(cat => {
      result[cat] = {};
    });

    // parse search query - check for @ prefix for class search and # prefix for faction search
    const isClassSearch = searchQuery.startsWith('@');
    const isFactionSearch = searchQuery.startsWith('#');
    const query = isClassSearch
      ? searchQuery.slice(1).toLowerCase().trim()
      : isFactionSearch
        ? searchQuery.slice(1).toLowerCase().trim()
        : searchQuery.toLowerCase();

    // helper to check if class matches search
    const classMatchesSearch = (className) => {
      if (!searchQuery || !isClassSearch) return true;
      return className.toLowerCase().includes(query);
    };

    // helper to check if faction matches search
    const factionMatchesSearch = (faction) => {
      if (!searchQuery || !isFactionSearch) return true;
      return faction.toLowerCase().includes(query);
    };

    // helper to check if skill matches search
    const matchesSearch = (skill) => {
      if (!searchQuery) return true;
      if (isClassSearch) return true; // class filtering handled separately
      if (isFactionSearch) return true; // faction filtering handled separately
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
      if (!classMatchesSearch(className)) return;
      // factions = class categories
      if (!factionMatchesSearch(category)) return;

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
        } else if (category && classMatchesSearch(job.name) && factionMatchesSearch(category)) {
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
  }, [searchQuery, skillsData]);

  const totalSkills = useMemo(() => {
    return skillsData.jobs.reduce((sum, job) => sum + job.skills.length, 0);
  }, [skillsData]);

  // collect all skills with 30ms last-frame penalty
  const affectedSkills = useMemo(() => {
    const affected = [];
    skillsData.jobs.forEach(job => {
      job.skills.forEach(skill => {
        const lastFrame = skill.frames[skill.frames.length - 1];
        if (frameHitsFloor(lastFrame, 10)) {
          affected.push({
            ...skill,
            className: job.name,
          });
        }
      });
    });
    // sort by class name, then skill name
    return affected.sort((a, b) => {
      const classCompare = a.className.localeCompare(b.className);
      if (classCompare !== 0) return classCompare;
      return a.name.localeCompare(b.name);
    });
  }, [skillsData]);

  return (
    <>
      {/* spotlight overlay for first-time visitors */}
      <AnimatePresence>
        {showSpotlight && <VersionToggleSpotlight onDismiss={dismissSpotlight} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-bright mb-2">Action Delays</h1>
          <p className="text-primary">
            Skill delay data for {totalSkills} skills across all classes
          </p>
        </div>

        <Preamble />

        {/* <AffectedSkillsSection skills={affectedSkills} /> */}

        {/* version toggle - fixed */}
        <div className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm py-2 px-3 rounded-lg border border-primary-dim/30 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary text-sm">Data Version:</span>
            <div className="flex rounded-lg overflow-hidden border border-primary-dim/30">
              <button
                onClick={() => setVersion('v266')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${version === 'v266'
                  ? 'bg-secondary text-background'
                  : 'bg-primary-dark text-primary hover:text-primary-bright'
                  }`}
              >
                v266
              </button>
              <button
                onClick={() => setVersion('v267')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${version === 'v267'
                  ? 'bg-secondary text-background'
                  : 'bg-primary-dark text-primary hover:text-primary-bright'
                  }`}
              >
                v267
              </button>
            </div>
          </div>
        </div>

        {/* search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search skills by name, action, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-primary-dark border border-primary-dim/30 text-primary-bright placeholder-primary-dim focus:outline-none focus:border-secondary transition-colors"
          />
          <p className="text-primary text-xs mt-2">Prefix with <code className="bg-primary-dark px-1 rounded">@</code> to search by class (e.g. <code className="bg-primary-dark px-1 rounded">@cannon master</code>)</p>
          <p className="text-primary text-xs mt-2">Prefix with <code className="bg-primary-dark px-1 rounded">#</code> to search by faction (e.g. <code className="bg-primary-dark px-1 rounded">#explorer</code>)</p>
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
          <div className="text-center text-primary py-12">
            No skills found matching your search.
          </div>
        )}
      </div>
    </>
  );
}
