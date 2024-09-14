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
      return skillData.components.reduce((total, component) => {
        const levelDamage = component.damage + (level - 1) * component.growthPerLevel;
        return total + levelDamage * component.attacks * (component.triggers || 1);
      }, 0);
    } else if (skill.type === 'Mastery') {
      skillData = classData.masterySkills.find(s => s.name === skill.skill);
      if (level === 0) return skillData.level0;
      return skillData.level1 + (level - 1) * skillData.growthPerLevel;
    } else if (skill.type === 'Boost') {
      return 1 + (parseFloat(boostGrowth[level]?.[level] || '0') / 100);
    }

    return 0;
  };

  const getGrowth = (skill, level) => {
    const currentDamage = getSkillDamage(skill, level);
    const nextDamage = getSkillDamage(skill, level + 1);
    return nextDamage / currentDamage;
  };

  const calculateEfficiency = (skill, currentLevel) => {
    const cost = getCost(skill.type, currentLevel);
    let totalGrowthIncrease = 0;
    let totalSkillContribution = 0;

    const calculateGrowthIncrease = (s, level) => {
      const growth = getGrowth(s, level);
      return growth - 1; // Convert to percentage increase
    };

    if (skill.type === 'Mastery') {
      skills.filter(s => s.type === 'Mastery' && s.category === skill.category).forEach(s => {
        const growthIncrease = calculateGrowthIncrease(s, currentLevel);
        const skillContribution = damageDistribution[s.skill] / 100;
        
        totalGrowthIncrease += growthIncrease * skillContribution;
        totalSkillContribution += skillContribution;
      });
    } else {
      totalGrowthIncrease = calculateGrowthIncrease(skill, currentLevel);
      totalSkillContribution = damageDistribution[skill.skill] / 100;
    }

    let extraBoost = 0;
    if (skill.type === 'Origin' && [10, 20, 30].includes(currentLevel + 1)) {
      extraBoost = 0.1; // 10% extra boost at levels 10, 20, 30
    }

    const damageIncrease = (totalGrowthIncrease + extraBoost) * totalSkillContribution;
    const currentDamageMultiplier = 1 - (bossDefense / 100) * (1 - iedPercent / 100);
    const effectiveDamageIncrease = damageIncrease * currentDamageMultiplier;

    return cost > 0 ? effectiveDamageIncrease / cost : 0;
  };

  const findOptimalUpgrade = (currentSkills) => {
    let bestSkill = null;
    let bestEfficiency = 0;
    console.log("Finding optimal upgrade -----------")
    currentSkills.forEach(skill => {
      if (skill.level < 30) {
        const efficiency = calculateEfficiency(skill, skill.level);
        console.log(`Efficiency for ${skill.skill} at level ${skill.level}: ${parseFloat(efficiency * 10000000).toFixed(2)}`)
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestSkill = skill;
          console.log(`New best skill found: ${skill.skill} at ${parseFloat(efficiency * 10000000).toFixed(2)} efficiency`)
        }
      }
    });
    // console.log("Best skill: ", bestSkill.skill, "----")
    return bestSkill;
  };

  const generateUpgradePath = () => {
    const path = [];
    let currentSkills = [...skills];
    let totalCost = 0;

    while (true) {
      const skillToUpgrade = findOptimalUpgrade(currentSkills);
      if (!skillToUpgrade) break;

      const cost = getCost(skillToUpgrade.type, skillToUpgrade.level);
      totalCost += cost;

      // Update all skills in the same category for Mastery skills
      currentSkills = currentSkills.map(skill => {
        if (skillToUpgrade.type === 'Mastery' && skill.category === skillToUpgrade.category) {
          return { ...skill, level: skill.level + 1 };
        } else if (skill.skill === skillToUpgrade.skill) {
          return { ...skill, level: skill.level + 1 };
        }
        return skill;
      });

      // Add to path, consolidating consecutive upgrades
      if (path.length > 0 && path[path.length - 1].category === skillToUpgrade.category) {
        path[path.length - 1].newLevel = skillToUpgrade.level + 1;
        path[path.length - 1].cost += cost;
      } else {
        path.push({
          skill: skillToUpgrade.type === 'Mastery' ? `${skillToUpgrade.category} Skills` : skillToUpgrade.skill,
          type: skillToUpgrade.type,
          category: skillToUpgrade.category,
          newLevel: skillToUpgrade.level + 1,
          cost,
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
                level={upgrade.newLevel}
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