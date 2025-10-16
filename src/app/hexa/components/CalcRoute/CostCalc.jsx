import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { originUpgradeCost, skillUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import { GoalInputGrid } from './GoalInputGrid';
import { formatClassName, formatSkillName, formatSkillPath } from '../../utils';
import sol_erda_fragment from "../../assets/sol_erda_fragment.png";
import sol_erda from '../../assets/sol_erda.png';
import { masteryDesignation } from '@/data/masteryDesignation';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CostCalc = ({ selectedClass, classDetails, skillLevels }) => {
  const [desiredSkillLevels, setDesiredSkillLevels] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);

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

  const getCostTable = (skillType) => {
    switch (skillType) {
      case 'origin':
        return originUpgradeCost;
      case 'skill':
        return skillUpgradeCost;
      case 'mastery':
        return masteryUpgradeCost;
      case 'common':
        return commonUpgradeCost;
      case 'enhancement':
        return enhancementUpgradeCost;
      case 'ascent':
        return skillUpgradeCost;
      default:
        console.error('Unknown skill type');
        return [];
    }
  };

  const calculateSkillCost = (skill, costType) => {
    let totalCost = 0;
    const costTable = getCostTable(skill.type);
    const level = skill.level;

    for (let i = 0; i < level; i++) {
      const cost = costTable[i][i + 1][costType];
      totalCost += cost;
    }

    return Math.max(totalCost, 0);
  };

  const calculateCosts = (skillName) => {
    var currentSkill = skillLevels[skillName];
    const desiredSkill = desiredSkillLevels[skillName];

    if (!currentSkill) {
      currentSkill = { 'level': 0, type: desiredSkill.type }
    }

    if (!currentSkill || !desiredSkill) {
      return { current: { solErda: 0, frags: 0 }, remaining: { solErda: 0, frags: 0 }, levels: { current: 0, desired: 0 } };
    }

    const formattedOriginSkill = formatSkillPath(classDetails.originSkill);
    const isOriginSkill = skillName === formattedOriginSkill;
    
    const currentSkillWithType = {
      ...currentSkill,
      type: isOriginSkill ? 'origin' : (currentSkill.type === 'origin' ? 'skill' : currentSkill.type)
    };
    
    const desiredSkillWithType = {
      ...desiredSkill,
      type: isOriginSkill ? 'origin' : (desiredSkill.type === 'origin' ? 'skill' : desiredSkill.type)
    };

    const currentSolErdaSpent = calculateSkillCost(currentSkillWithType, 'solErda');
    const currentFragSpent = calculateSkillCost(currentSkillWithType, 'frags');
    const finalSolErdaCost = calculateSkillCost(desiredSkillWithType, 'solErda');
    const finalFragCost = calculateSkillCost(desiredSkillWithType, 'frags');

    const remainingSolErda = Math.max(0, finalSolErdaCost - currentSolErdaSpent);
    const remainingFrags = Math.max(0, finalFragCost - currentFragSpent);

    return {
      current: { solErda: currentSolErdaSpent, frags: currentFragSpent },
      remaining: { solErda: remainingSolErda, frags: remainingFrags },
      levels: { current: currentSkill.level, desired: desiredSkill.level }
    };
  };

  const calculateTotal = () => {
    let totalRemainingSolErda = 0;
    let totalRemainingFrags = 0;

    Object.keys(desiredSkillLevels).forEach((skillName) => {
      const costs = calculateCosts(skillName);
      totalRemainingSolErda += costs.remaining.solErda;
      totalRemainingFrags += costs.remaining.frags;
    });

    return { solErda: totalRemainingSolErda, frags: totalRemainingFrags };
  };

  const formattedClassName = formatClassName(selectedClass)
  const getSkillImage = (skillName, skillType) => {
    if (skillType === 'common') {
      return `/common/${skillName}.png`;
    } else {
      return `/classImages/${formattedClassName}/Skill_${skillName}.png`;
    }
  };

  const getOrderedSkills = (classDetails, desiredSkillLevels) => {
    if (!classDetails || !desiredSkillLevels) return [];

    const orderedSkills = [];
    const classMasteryDesignation = masteryDesignation[selectedClass];

    if (!classMasteryDesignation) return [];

    // Origin skill
    const formattedOriginSkill = formatSkillPath(classDetails.originSkill);
    if (desiredSkillLevels[formattedOriginSkill]) {
      orderedSkills.push(formattedOriginSkill);
    }

    // Ascent skills
    const ascentList = Array.isArray(classDetails.ascentSkills)
      ? classDetails.ascentSkills
      : (classDetails.ascentSkill ? [classDetails.ascentSkill] : []);
    ascentList.forEach((skill) => {
      if (!skill) return;
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // First Mastery skills
    classMasteryDesignation.firstMastery.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Second Mastery skills
    classMasteryDesignation.secondMastery.forEach(skill => {
      if (!skill) return;
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Third Mastery skills
    classMasteryDesignation.thirdMastery.forEach(skill => {
      if (!skill) return;
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Fourth Mastery skills
    classMasteryDesignation.fourthMastery.forEach(skill => {
      if (!skill) return;
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Boost skills
    classDetails.boostSkills.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Common skills
    classDetails.commonSkills.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    return orderedSkills;
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


  const calculateProgress = (costs) => {
    const totalFrags = costs.current.frags + costs.remaining.frags;
    return totalFrags > 0 ? (costs.current.frags / totalFrags) * 100 : 0;
  };

  const getProgressColor = (progress) => {
    if (progress < 33) return 'bg-progress-red';
    if (progress < 66) return 'bg-progress-orange';
    if (progress < 100) return 'bg-progress-yellow';
    return 'bg-progress-green';
  };

  const totalRemaining = calculateTotal();
  const orderedSkills = getOrderedSkills(classDetails, desiredSkillLevels);

  return (
    <div className="flex flex-col">
      <GoalInputGrid
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
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
            const costs = calculateCosts(skillName);
            const skillType = desiredSkillLevels[skillName]?.type || 'enhancement';
            const progress = calculateProgress(costs);
            const progressColor = getProgressColor(progress);

            if (hideCompleted && progress === 100) {
              return null;
            }

            return (
              <div key={skillName} className="mb-4 p-4 bg-primary-dark rounded-lg w-[75%] relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${progressColor} opacity-25 transition-all duration-500 ease-in-out`}
                  style={{ width: `${progress}%` }}
                ></div>
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
