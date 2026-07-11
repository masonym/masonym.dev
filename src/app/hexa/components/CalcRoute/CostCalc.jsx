import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { InputGrid } from '../InputGrid/InputGrid';
import { formatSkillName, getSkillImagePath, getCommonSkillImagePath } from '../../utils';
import sol_erda_fragment from "../../assets/sol_erda_fragment.png";
import sol_erda from '../../assets/sol_erda.png';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  calculateCosts,
  calculateTotal,
  getOrderedSkills,
  calculateProgress,
  getProgressColor,
  getEffectiveSkillType,
  getMaxLevel,
  getNextLevelCost,
  getCostTable,
} from './costCalc.utils';

// Compact inline readout for a single cost (icons + values on one row).
const CostInline = ({ cost }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
    <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
      <Image src={sol_erda} width={20} height={20} alt="Sol Erda Energy" />
      {cost.solErda.toLocaleString()}
    </span>
    <span className="flex items-center gap-1 text-sm font-semibold text-primary-bright">
      <Image src={sol_erda_fragment} width={20} height={20} alt="Sol Erda Fragment" />
      {cost.frags.toLocaleString()}
    </span>
  </div>
);

// Click-to-expand per-level cost breakdown for a skill type. Renders inline
// (not an absolutely-positioned overlay) so it can't leave dead scrollable
// space behind it or lose hover partway between a trigger and a panel.
const CostTableSection = ({ skillType }) => {
  const costTable = getCostTable(skillType);
  let total = { solErda: 0, frags: 0 };
  const rows = costTable.map((entry, index) => {
    const level = index + 1;
    const cost = entry[level];
    total = { solErda: total.solErda + cost.solErda, frags: total.frags + cost.frags };
    return { level, cost };
  });

  return (
    <details className="group/table mb-3 rounded-lg border border-primary-dim">
      <summary className="flex list-none items-center justify-between gap-2 px-3 py-2 text-xs text-primary-dim transition cursor-pointer hover:text-secondary">
        <span>Cost table</span>
        <ChevronRight className="h-4 w-4 transition-transform group-open/table:rotate-90" />
      </summary>
      <div className="max-h-72 overflow-y-auto border-t border-primary-dim p-3">
        <table className="w-full text-xs text-primary">
          <thead>
            <tr className="text-primary-dim">
              <th className="pb-1 text-left font-medium">Lv</th>
              <th className="pb-1 text-right font-medium">Sol Erda</th>
              <th className="pb-1 text-right font-medium">Frags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.level} className="border-t border-primary-dim/40">
                <td className="py-1 text-left text-primary-bright">{row.level - 1} → {row.level}</td>
                <td className="py-1 text-right">{row.cost.solErda.toLocaleString()}</td>
                <td className="py-1 text-right">{row.cost.frags.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="border-t border-primary-dim font-semibold text-primary-bright">
              <td className="py-1 text-left">Total</td>
              <td className="py-1 text-right">{total.solErda.toLocaleString()}</td>
              <td className="py-1 text-right">{total.frags.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
};

const CostCalc = ({ selectedClass, classDetails, skillLevels }) => {
  const [desiredSkillLevels, setDesiredSkillLevels] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [brokenJobBranchIcons, setBrokenJobBranchIcons] = useState({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedSkillLevels = localStorage.getItem(`desiredSkillLevels_${selectedClass}`);
      const parsedSkillLevels = savedSkillLevels ? JSON.parse(savedSkillLevels) : {};
      setDesiredSkillLevels(parsedSkillLevels);

      const savedHideCompleted = localStorage.getItem('hideCompletedSkills');
      if (savedHideCompleted !== null) {
        setHideCompleted(JSON.parse(savedHideCompleted));
      }

      const savedCollapsedCards = localStorage.getItem(`collapsedCards_${selectedClass}`);
      const parsedCollapsedCards = savedCollapsedCards ? JSON.parse(savedCollapsedCards) : {};

      // Only set collapsed cards if they were explicitly saved as collapsed
      setCollapsedCards(
        Object.keys(parsedSkillLevels).reduce((acc, skillName) => {
          acc[skillName] = parsedCollapsedCards[skillName] === true;
          return acc;
        }, {})
      );

      // Set allExpanded based on whether any cards are collapsed
      setAllExpanded(!Object.values(parsedCollapsedCards).some(value => value === true));
    }
  }, [selectedClass, isClient]);

  const resetDesiredLevels = () => {
    localStorage.removeItem(`desiredSkillLevels_${selectedClass}`);
    setDesiredSkillLevels({});
  };

  const updateSkillLevels = (newLevels, skillType) => {
    setDesiredSkillLevels(prevLevels => {
      const updatedLevels = Object.keys(newLevels).reduce((acc, skillName) => {
        acc[skillName] = {
          level: newLevels[skillName],
          type: skillType
        };
        return acc;
      }, { ...prevLevels });

      if (isClient) {
        localStorage.setItem(`desiredSkillLevels_${selectedClass}`, JSON.stringify(updatedLevels));
      }
      return updatedLevels;
    });
  };

  const getSkillImage = (skillName, skillType) => {
    if (skillType === 'jobBranch' && brokenJobBranchIcons[skillName]) {
      return getCommonSkillImagePath(skillName);
    }
    return getSkillImagePath(selectedClass, skillName, skillType === 'common');
  };

  const toggleCard = (skillName) => {
    setCollapsedCards(prev => {
      const updated = {
        ...prev,
        [skillName]: !prev[skillName]
      };
      localStorage.setItem(`collapsedCards_${selectedClass}`, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAllCards = () => {
    setAllExpanded(prev => !prev);
    setCollapsedCards(prev => {
      const updated = allExpanded
        ? Object.keys(desiredSkillLevels).reduce((acc, skillName) => {
          acc[skillName] = true;
          return acc;
        }, {})
        : {};
      localStorage.setItem(`collapsedCards_${selectedClass}`, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleHideCompleted = () => {
    setHideCompleted(prev => {
      const newValue = !prev;
      localStorage.setItem('hideCompletedSkills', JSON.stringify(newValue));
      return newValue;
    });

  }


  const totalRemaining = calculateTotal({ skillLevels, desiredSkillLevels, classDetails });
  const orderedSkills = getOrderedSkills(classDetails, desiredSkillLevels, selectedClass);

  return (
    <div className="flex flex-col">
      <InputGrid
        mode="goal"
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
        resetSkillLevels={resetDesiredLevels}
      />
      {Object.values(desiredSkillLevels).some(skill => skill.level > 0) && (



        <div className="mt-4 flex items-center flex-col">

          <h2 className="text-xl font-bold mb-2">Total Remaining:</h2>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <Image
                src={sol_erda}
                width={48}
                height={48}
                alt={"Sol Erda Energy"}
              />
              <p className="text-blue-600 font-medium text-[24px]">{totalRemaining.solErda.toLocaleString()}</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src={sol_erda_fragment}
                width={48}
                height={48}
                alt={"Sol Erda Fragment"}
              />
              <p className="text-green-600 font-medium text-[24px]">{totalRemaining.frags.toLocaleString()}</p>
            </div>
          </div>
          {/* <div className="w-full flex justify-center gap-4 items-center mb-4"> */}
          {/* <h2 className="text-xl font-bold">Progress:</h2> */}
          {/* </div> */}
          <div className="mb-4 self-center flex justify-between gap-4 w-[75%]">
            <button
              onClick={toggleAllCards}
              className="bg-primary-dark text-primary px-4 py-2 rounded hover:bg-primary-dim transition-colors"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
            <button
              onClick={toggleHideCompleted}
              className="bg-primary-dark text-primary px-4 py-2 rounded hover:bg-primary-dim transition-colors"
            >
              {hideCompleted ? 'Show Completed Skills' : 'Hide Completed Skills'}
            </button>
          </div>
          {orderedSkills.map((skillName) => {
            const costs = calculateCosts(skillName, { skillLevels, desiredSkillLevels, classDetails });
            const skillType = desiredSkillLevels[skillName]?.type || 'enhancement';
            const progress = calculateProgress(costs);
            const progressColor = getProgressColor(progress);
            const effectiveType = getEffectiveSkillType(skillName, skillType, classDetails);
            const atMaxLevel = costs.levels.current >= getMaxLevel(effectiveType);
            const nextLevelCost = !atMaxLevel ? getNextLevelCost(effectiveType, costs.levels.current) : null;

            if (hideCompleted && progress === 100) {
              return null;
            }

            return (
              <div key={skillName} className="mb-4 p-4 bg-primary-dark rounded-lg w-[75%] relative">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                  <div
                    className={`h-full ${progressColor} opacity-25 transition-all duration-500 ease-in-out`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="relative z-10">
                  <div
                    className="flex items-center mb-2 cursor-pointer"
                    onClick={() => toggleCard(skillName)}
                  >
                    <Image
                      src={getSkillImage(skillName, skillType)}
                      alt={skillName}
                      width={40}
                      height={40}
                      className="mr-3 flex-shrink-0"
                      onError={() => {
                        if (skillType === 'jobBranch' && !brokenJobBranchIcons[skillName]) {
                          setBrokenJobBranchIcons(prev => ({ ...prev, [skillName]: true }));
                        }
                      }}
                    />
                    {/* skill name & collapse arrow */}
                    <div className="flex flex-1 items-center min-w-0">
                      <span className="text-xs md:text-lg inline-block font-semibold text-primary text-wrap mr-2">{formatSkillName(skillName)}</span>
                      <span className="flex-shrink-0">{collapsedCards[skillName] ? <ChevronDown color='var(--primary)' /> : <ChevronRight />}</span>
                    </div>
                    {/* level display (curr -> desired ) */}
                    <span className="text-xs md:text-lg font-medium text-primary ml-2 flex-shrink-0">
                      Level {costs.levels.current} → {costs.levels.desired}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary-dim bg-primary-dark/40 px-3 py-2">
                    <span className="text-xs font-semibold text-primary-bright md:text-sm">
                      {atMaxLevel
                        ? 'Max level reached'
                        : `Next level (Lv ${costs.levels.current} → ${costs.levels.current + 1})`}
                    </span>
                    {nextLevelCost && <CostInline cost={nextLevelCost} />}
                  </div>
                  <CostTableSection skillType={effectiveType} />
                  {!collapsedCards[skillName] && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="items-start flex flex-col">
                        <div className="flex flex-col items-center justify-center">
                          {/* inner (left) resources spent */}
                          <h3 className="text-sm font-medium text-primary">Current Resources Spent:</h3>
                          <div className="items-center self-start flex flex-col">
                            <div className="flex flex-col items-center gap-2 w-fit my-2">
                              <Image
                                src={sol_erda}
                                width={32}
                                height={32}
                                alt={"Sol Erda Energy"}
                              />
                              <p className="text-blue-600">{costs.current.solErda.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-center gap-2 w-fit my-2 ">
                              <Image
                                src={sol_erda_fragment}
                                width={32}
                                height={32}
                                alt={"Sol Erda Fragment"}
                              />
                              <p className="text-green-600">{costs.current.frags.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* inner (right) remaining count */}
                      <div className="items-end flex flex-col">
                        <div className="flex flex-col items-center justify-center">
                          <h3 className="text-sm font-medium text-primary">Remaining:</h3>
                          <div className="flex flex-col items-center gap-2 w-fit my-2">
                            <Image
                              src={sol_erda}
                              width={32}
                              height={32}
                              alt={"Sol Erda Energy"}
                            />
                            <p className="text-blue-600">{costs.remaining.solErda.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2 w-fit my-2 ">
                            <Image
                              src={sol_erda_fragment}
                              width={32}
                              height={32}
                              alt={"Sol Erda Fragment"}
                            />
                            <p className="text-green-600">{costs.remaining.frags.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CostCalc;
