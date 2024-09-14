import React, { useState, useEffect } from 'react';
import { masteryDesignation } from '@/data/masteryDesignation';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost } from "@/data/solErda";
import { classSkillGrowth } from '@/data/classSkillGrowth';
import { boostGrowth } from '@/data/boostGrowth';
import { formatSkillName, formatSkillPath } from '../../utils';
import Image from 'next/image';
const SkillIcon = ({ skill, level, classKey, masterySkills }) => {
  let iconPath;
  if (skill.type === 'Mastery') {
    // For mastery skills, use the first skill in the category
    const categorySkills = masterySkills[skill.category];
    const firstSkillInCategory = categorySkills[0];
    iconPath = `/classImages/${classKey}/Skill_${formatSkillPath(firstSkillInCategory)}.png`;
  } else {
    iconPath = `/classImages/${classKey}/Skill_${formatSkillPath(skill.skill)}.png`;
  }

  return (
    <div className="flex flex-col items-center m-1">
      <div className="relative w-12 h-12">
        <Image src={iconPath} alt={skill.skill} fill sizes='(max-width: 768px) 32px, (max-width: 1200px) 64px, 64px' />
      </div>
      <span className="text-xs mt-1">{level}</span>
    </div>
  );
};


const Optimizer = ({ selectedClass, classDetails, skillLevels }) => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [damagePercent, setDamagePercent] = useState(0);
  const [iedPercent, setIedPercent] = useState(0);
  const [bossDefense, setBossDefense] = useState(300);
  const [upgradePath, setUpgradePath] = useState([]);
  const [damageDistribution, setDamageDistribution] = useState({});
  const [masterySkills, setMasterySkills] = useState({});

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const savedState = localStorage.getItem(`optimizerState_${selectedClass}`);
      if (savedState) {
        const {
          damagePercent: savedDamage,
          iedPercent: savedIed,
          bossDefense: savedDefense,
          damageDistribution: savedDistribution
        } = JSON.parse(savedState);


        setDamagePercent(savedDamage || 0);
        setIedPercent(savedIed || 0);
        setBossDefense(savedDefense || 300);
        setDamageDistribution(savedDistribution);
      }
    };

    loadFromLocalStorage();
  }, [selectedClass]);

  // Update local storage functions
  const updateLocalStorage = (key, value) => {
    const currentState = JSON.parse(localStorage.getItem(`optimizerState_${selectedClass}`) || '{}');
    const newState = { ...currentState, [key]: value };
    localStorage.setItem(`optimizerState_${selectedClass}`, JSON.stringify(newState));
  };

  // Modified state setters
  const setDamagePercentWithStorage = (value) => {
    setDamagePercent(value);
    updateLocalStorage('damagePercent', value);
  };

  const setIedPercentWithStorage = (value) => {
    setIedPercent(value);
    updateLocalStorage('iedPercent', value);
  };

  const setBossDefenseWithStorage = (value) => {
    setBossDefense(value);
    updateLocalStorage('bossDefense', value);
  };

  const handleDamageDistributionChange = (skill, value) => {
    const newDistribution = {
      ...damageDistribution,
      [skill]: Number(value)
    };
    setDamageDistribution(newDistribution);
    updateLocalStorage('damageDistribution', newDistribution);
  };


  useEffect(() => {
    if (selectedClass && classDetails && skillLevels) {
      const classDesignation = masteryDesignation[selectedClass];

      // Initialize mastery levels
      const firstMasteryLevel = Math.max(
        ...classDesignation.firstMastery.map(skill => skillLevels[formatSkillPath(skill)]?.level || 0)
      );
      const secondMasteryLevel = Math.max(
        ...classDesignation.secondMastery.map(skill => skillLevels[formatSkillPath(skill)]?.level || 0)
      );

      const newSkills = [
        {
          type: 'Origin',
          skill: classDetails.originSkill,
          level: skillLevels[formatSkillPath(classDetails.originSkill)]?.level || 1
        },
        ...classDetails.masterySkills.map(skill => ({
          type: 'Mastery',
          skill,
          level: classDesignation.firstMastery.includes(skill) ? firstMasteryLevel : secondMasteryLevel,
          category: classDesignation.firstMastery.includes(skill) ? 'firstMastery' : 'secondMastery'
        })),
        ...classDetails.boostSkills.map(skill => ({
          type: 'Boost',
          skill,
          level: skillLevels[formatSkillPath(skill)]?.level || 0
        })),
      ];
      setSkills(newSkills);

      // if (Object.keys(damageDistribution).length === 0) {
      //   console.log("true")
      //   const newDistribution = newSkills.reduce((acc, skill) => {
      //     acc[skill.skill] = 0;
      //     return acc;
      //   }, {});
      //   setDamageDistribution(newDistribution);
      //   updateLocalStorage('damageDistribution', newDistribution);
      // }

      setIsLoading(false);
    }
  }, [selectedClass, classDetails, skillLevels]);

  useEffect(() => {
    if (selectedClass && masteryDesignation[selectedClass]) {
      setMasterySkills({
        firstMastery: masteryDesignation[selectedClass].firstMastery,
        secondMastery: masteryDesignation[selectedClass].secondMastery
      });
    }
  }, [selectedClass]);

  const getCost = (skillType, level) => {
    const costTable = {
      'Origin': originUpgradeCost,
      'Mastery': masteryUpgradeCost,
      'Boost': enhancementUpgradeCost,
    }[skillType] || [];
    return costTable[level]?.[level + 1]?.frags || 0;
  };

  const getSkillDamage = (skill, level) => {
    const classData = classSkillGrowth[selectedClass];
    let skillData;

    if (skill.type === 'Origin') {
      skillData = classData.originSkill;
      let baseDamage = skillData.components.reduce((total, component) => {
        const levelDamage = component.damage + (level - 1) * component.growthPerLevel;
        return total + levelDamage * component.attacks * (component.triggers || 1);
      }, 0);

      const { totalIED, bossDamageBoost } = getOriginSkillBoosts(level, iedPercent);

      // Apply IED and Boss Damage boosts
      const totalDamageMultiplier = 1 + (damagePercent + bossDamageBoost) / 100;

      console.log(totalDamageMultiplier)

      return baseDamage * totalDamageMultiplier * (1 - (bossDefense / 100) * (1 - totalIED / 100));
    } else if (skill.type === 'Mastery') {
      skillData = classData.masterySkills.find(s => s.name === skill.skill);
      if (level === 0) return skillData.level0;
      return skillData.level1 + (level - 1) * skillData.growthPerLevel;
    } else if (skill.type === 'Boost') {
      return 1 + (parseFloat(boostGrowth[level]?.[level] || '0') / 100);
    }

    return 0;
  };

  const calculateIED = (currentIED, newIED) => {
    return currentIED + (newIED * (1 - currentIED));
  };

  const getOriginSkillBoosts = (level, baseIED) => {
    let totalIED = baseIED / 100;
    let bossDamageBoost = 0;

    if (level >= 30) {
      totalIED = calculateIED(totalIED, 0.3);
      totalIED = calculateIED(totalIED, 0.2);
      bossDamageBoost += 50; // 20% + 30%
    } else if (level >= 20) {
      totalIED = calculateIED(totalIED, 0.2);
      bossDamageBoost += 20;
    } else if (level >= 10) {
      totalIED = calculateIED(totalIED, 0.2);
    }

    return { totalIED: totalIED * 100, bossDamageBoost };
  };

  const getGrowth = (skill, level) => {
    const currentDamage = getSkillDamage(skill, level);
    const nextDamage = getSkillDamage(skill, level + 1);
    return nextDamage / currentDamage;
  };

  const calculateMultiStepEfficiency = (skill, currentLevel, steps) => {
    let totalCost = 0;
    let totalGrowth = 1;

    for (let i = 0; i < steps; i++) {
      const level = currentLevel + i;
      if (level >= 30) break;

      totalCost += getCost(skill.type, level);
      totalGrowth *= getGrowth(skill, level);
    }

    const growthIncrease = totalGrowth - 1;
    const skillContribution = damageDistribution[skill.skill] / 100;
    const damageIncrease = growthIncrease * skillContribution;

    return totalCost > 0 ? damageIncrease / totalCost : 0;
  };
  const calculateEfficiency = (skill, currentLevel) => {
    const singleStepEfficiency = calculateMultiStepEfficiency(skill, currentLevel, 1);

    let maxEfficiency = singleStepEfficiency;
    let optimalSteps = 1;

    // Look ahead up to 10 steps
    for (let steps = 2; steps <= 10; steps++) {
      if (currentLevel + steps > 30) break;

      const multiStepEfficiency = calculateMultiStepEfficiency(skill, currentLevel, steps);
      if (multiStepEfficiency > maxEfficiency) {
        maxEfficiency = multiStepEfficiency;
        optimalSteps = steps;
      }
    }

    // Special consideration for boost skills near breakpoints
    if (skill.type === 'Boost' && [9, 19, 29].includes(currentLevel)) {
      const breakpointEfficiency = calculateMultiStepEfficiency(skill, currentLevel, 31 - currentLevel);
      if (breakpointEfficiency > maxEfficiency) {
        maxEfficiency = breakpointEfficiency;
        optimalSteps = 31 - currentLevel;
      }
    }

    if (skill.type === 'Origin' && [9, 19, 29].includes(currentLevel)) {
      const breakpointEfficiency = calculateMultiStepEfficiency(skill, currentLevel, 31 - currentLevel);
      if (breakpointEfficiency > maxEfficiency) {
        maxEfficiency = breakpointEfficiency;
        optimalSteps = 31 - currentLevel;
      }
    }

    return { efficiency: maxEfficiency, steps: optimalSteps };
  };

  const findOptimalUpgrade = (currentSkills) => {
    let bestSkill = null;
    let bestEfficiency = 0;
    let bestSteps = 1;

    currentSkills.forEach(skill => {
      if (skill.level < 30) {
        const { efficiency, steps } = calculateEfficiency(skill, skill.level);
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestSkill = skill;
          bestSteps = steps;
        }
      }
    });

    return { skill: bestSkill, steps: bestSteps };
  };

  const generateUpgradePath = () => {
    const path = [];
    let currentSkills = [...skills];
    let totalCost = 0;

    while (true) {
      const { skill: skillToUpgrade, steps } = findOptimalUpgrade(currentSkills);
      if (!skillToUpgrade) break;

      let upgradeCost = 0;
      const startLevel = skillToUpgrade.level;
      const endLevel = Math.min(startLevel + steps, 30);

      for (let level = startLevel; level < endLevel; level++) {
        upgradeCost += getCost(skillToUpgrade.type, level);
      }
      totalCost += upgradeCost;

      // Update skills
      currentSkills = currentSkills.map(skill => {
        if (skillToUpgrade.type === 'Mastery' && skill.category === skillToUpgrade.category) {
          return { ...skill, level: endLevel };
        } else if (skill.skill === skillToUpgrade.skill) {
          return { ...skill, level: endLevel };
        }
        return skill;
      });

      // Add to path, consolidating upgrades
      if (path.length > 0 && path[path.length - 1].skill === skillToUpgrade.skill) {
        const lastUpgrade = path[path.length - 1];
        lastUpgrade.newLevel = endLevel;
        lastUpgrade.cost += upgradeCost;
        lastUpgrade.totalCost = totalCost;
      } else {
        path.push({
          skill: skillToUpgrade.skill,
          type: skillToUpgrade.type,
          category: skillToUpgrade.category,
          startLevel: startLevel,
          newLevel: endLevel,
          cost: upgradeCost,
          totalCost
        });
      }

      // Stop if all skills are at level 30
      if (currentSkills.every(skill => skill.level === 30)) break;
    }

    setUpgradePath(path);
  };


  const handleGenerateUpgradePath = () => {
    generateUpgradePath();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-xl font-bold mt-6 mb-2">Enter your current stats</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="mb-4 relative">
          <label className="block mb-2">Damage + Boss Damage</label>
          <div className="relative">
            <input
              type="number"
              value={damagePercent}
              onChange={(e) => setDamagePercentWithStorage(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-2">IED</label>
          <div className="relative">
            <input
              type="number"
              value={iedPercent}
              onChange={(e) => setIedPercentWithStorage(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-2">Boss Defense</label>
          <div className="relative">
            <input
              type="number"
              value={bossDefense}
              onChange={(e) => setBossDefenseWithStorage(Number(e.target.value))}
              className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-6 mb-2">Enter your rotation's skill damage distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {skills.map((skill, index) => (
          <div key={index} className="border p-2 rounded">
            <h3 className="font-bold">{skill.skill}</h3>
            <label className="block mt-2">Damage Contribution</label>
            <div className="relative">
              <input
                type="number"
                value={damageDistribution[skill.skill]}
                onChange={(e) => handleDamageDistributionChange(skill.skill, e.target.value)}
                className="border p-2 pr-6 rounded w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerateUpgradePath}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Generate Upgrade Path
      </button>

      {upgradePath.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-xl font-bold mb-2">Recommended Upgrade Path</h3>
          <div className="grid grid-cols-16">
            {upgradePath.map((upgrade, index) => (
              <SkillIcon
                key={index}
                skill={{
                  skill: upgrade.skill,
                  type: upgrade.type,
                  category: upgrade.category
                }}
                // not sure which to use
                // level={`${upgrade.newLevel}`} 
                level={`${upgrade.startLevel} → ${upgrade.newLevel}`}
                classKey={selectedClass}
                masterySkills={masterySkills}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimizer;